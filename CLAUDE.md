# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (`backend/`)
```bash
npm run dev      # start with hot-reload (tsx watch)
npm run build    # compile TypeScript → dist/
npm start        # run compiled output
npx tsc --noEmit # type-check only, no emit
```

### Frontend (`frontend/`)
```bash
npm run dev      # Vite dev server on :5173
npm run build    # tsc + vite build → dist/
npx tsc --noEmit # type-check only
```

Both servers must run simultaneously. The Vite dev server proxies `/api/*` to `http://localhost:3000` — no other cross-origin config is needed in dev.

## Architecture

This is a monorepo with three folders: `shared/`, `backend/`, and `frontend/`. There is no workspace setup — `shared/types.ts` is the single source of truth for all TypeScript types and Zod schemas, and its contents are manually duplicated into `backend/src/types/shared.ts` and `frontend/src/types/shared.ts`. **When changing any type or schema, update all three copies.**

### Request lifecycle

1. User submits `{ cv_text, jd_text, weights }` from `AnalyzerPage`
2. `useAnalysis` hook (frontend) calls `streamAnalysis` from `sseClient.ts`, which POSTs to `/api/analyze` and reads the response as a `ReadableStream` — not `EventSource`, because `EventSource` doesn't support POST
3. `analyze.ts` route validates with Zod, sets SSE headers, calls `runAnalysis()` from `claude.ts`, then ends the response
4. `runAnalysis()` runs 4 sequential Claude API calls (non-streaming `messages.create`), emitting an SSE event after each stage completes:
   - `status` → `cv_skills` → `status` → `jd_skills` → `status` → `graph` → `status` → `score` → `done`
5. `useAnalysis` dispatches each event type into React state; components render as data arrives
6. On `done`, the hook assembles a `FullReport` from the four accumulated payloads

### The 4-stage Claude pipeline (`backend/src/services/claude.ts`)

Each stage uses a dedicated prompt builder (`backend/src/prompts/stage{1-4}-*.ts`) and a matching Zod schema for response validation. Every system prompt block carries `cache_control: { type: "ephemeral" }` to enable prompt caching on repeated analyses.

| Stage | Prompt input | SSE event emitted | Schema |
|---|---|---|---|
| 1 — CV skills | raw cv_text | `cv_skills` | `CVSkillsDataSchema` |
| 2 — JD skills | raw jd_text | `jd_skills` | `JDSkillsDataSchema` |
| 3 — Graph | stage 1 + 2 output | `graph` | `GraphDataSchema` |
| 4 — Score | stage 1 + 2 + 3 output + weights | `score` | `ScoreDataSchema` |

`runStage<T>()` is the generic executor: calls `messages.create`, strips any accidental markdown fences from the response text, then validates against the schema. If Claude returns invalid JSON or the schema rejects it, the error propagates to the route handler which emits `{ type: "error" }` and ends the stream.

### Frontend state model

`useAnalysis` is the single source of state for the entire analysis. It holds `AnalysisState` (six nullable result fields + `isLoading` + `error`) and updates each field as the corresponding SSE event arrives. All result components (`ScorePanel`, `SkillGraph`, `RecommendationList`) receive data directly from this hook via `AnalyzerPage` — there is no global store or context.

`useWeights` manages the three scoring sliders with a normalization invariant: when one slider changes, the other two are proportionally adjusted so the sum is always 100.

### Skill graph (`frontend/src/components/SkillGraph.tsx`)

Uses `vis-network` + `vis-data`. The `Network` instance is held in a `useRef` and recreated (destroy + new) whenever `graphData` changes. Node appearance is driven by `status` (color) and `proficiency` (size); edge appearance is driven by `type` (dashes pattern + color). Tooltip text is set via the `title` property on each node/edge object.

## Key constraints

- **Claude model**: hardcoded as `"claude-sonnet-4-6"` in `backend/src/services/claude.ts`
- **SSE format**: each event is `data: <JSON>\n\n` — the client splits on `\n\n` and strips the `data: ` prefix
- **Weights validation**: Zod `.refine()` enforces that `skills + experience + education` is within 0.5 of 100; the UI normalizes on every slider change so this is always satisfied before submission
- **Type duplication**: `shared/types.ts` ↔ `backend/src/types/shared.ts` ↔ `frontend/src/types/shared.ts` must stay in sync manually — the backend `rootDir: "./src"` in `tsconfig.json` prevents a cross-folder re-export
- **AbortController**: the route wires `req.on("close")` to an `AbortController` whose `signal` is passed into every `messages.create` call, so client disconnects cancel in-flight Claude requests
