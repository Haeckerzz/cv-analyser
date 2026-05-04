# CV ↔ JD Analyzer

An AI-powered resume analyzer that uses Groq (Llama 3.3) to extract skills, build a skill relationship graph, score candidate fit, and generate actionable recommendations — all streamed live to the browser.

---

## How It Works

1. Paste your CV and a job description **or upload a PDF / Word file** for either
2. Adjust the scoring weights (Skills / Experience / Education)
3. Click **Analyze Match** — Groq runs 4 sequential stages:
   - Extract skills from your CV
   - Extract requirements from the JD
   - Build a skill relationship graph (family, prerequisite, transferable edges)
   - Score the match and generate recommendations
4. Results stream in progressively — graph, score, and recommendations appear as each stage completes
5. Download the full analysis as a JSON report

---

## Prerequisites

| Requirement | Minimum version | Check |
|---|---|---|
| Node.js | v18 or higher | `node --version` |
| npm | v9 or higher | `npm --version` |
| Groq API key | — | [console.groq.com](https://console.groq.com) |

### Installing Node.js and npm

If `node --version` returns an error or a version below v18:

**Windows:**
1. Go to [nodejs.org/en/download](https://nodejs.org/en/download)
2. Download the **LTS** installer (`.msi`)
3. Run the installer — npm is included
4. Open a new terminal and verify: `node --version` and `npm --version`

**macOS (with Homebrew):**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Getting a Groq API Key

1. Sign up or log in at [console.groq.com](https://console.groq.com)
2. Go to **API Keys** in the left sidebar
3. Click **Create API Key** — copy the key (starts with `gsk_`)
4. You will need this in the setup step below

Groq has a free tier with generous rate limits — no credit card required to get started.

---

## Project Structure

```
cv analyser/
├── shared/
│   └── types.ts              # Shared TypeScript types (Zod schemas)
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express server entry (port 3000)
│   │   ├── routes/
│   │   │   ├── analyze.ts    # POST /api/analyze — SSE handler
│   │   │   └── parseFile.ts  # POST /api/parse-file — PDF/DOCX parser
│   │   ├── services/
│   │   │   ├── groq.ts       # 4-stage Groq API pipeline
│   │   │   └── fileParser.ts # pdf-parse + mammoth extraction
│   │   ├── prompts/          # Prompt templates for each stage
│   │   └── lib/              # SSE helper
│   └── .env                  # ← your Groq API key goes here
└── frontend/
    └── src/
        ├── components/       # UI components (graph, score, recommendations)
        ├── hooks/            # SSE streaming + weight normalization
        └── lib/              # SSE client + file upload client
```

---

## Setup & Running

### Step 1 — Add your API key

Open `backend/.env` and replace the placeholder:

```env
GROQ_API_KEY=gsk_your_actual_key_here
PORT=3000
```

### Step 2 — Install backend dependencies

```bash
cd backend
npm install
```

### Step 3 — Install frontend dependencies

```bash
cd ../frontend
npm install
```

### Step 4 — Start the backend

Open a terminal in the `backend` folder:

```bash
npm run dev
```

You should see:
```
Backend running on http://localhost:3000
```

### Step 5 — Start the frontend

Open a **second** terminal in the `frontend` folder:

```bash
npm run dev
```

You should see:
```
  VITE ready in Xms
  ➜  Local:   http://localhost:5173/
```

### Step 6 — Open the app

Navigate to **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## Usage

### Providing your CV and job description

Each panel has two input modes — switch between them using the tabs:

- **Paste Text** — type or paste content directly into the text area
- **Upload File** — click the upload zone to select a file (PDF, DOC, or DOCX, max 10 MB). The file is parsed on the backend and the extracted text populates the panel automatically. You can switch back to Paste Text to review or edit it.

### Running the analysis

1. Provide your CV (minimum 50 characters)
2. Provide the job description (minimum 20 characters)
3. **Adjust the scoring weights** using the sliders — they always sum to 100%:
   - **Skills Match** — how much skill overlap matters
   - **Experience** — weight given to years of experience
   - **Education** — weight given to degree requirements
4. Click **Analyze Match**
5. Watch the progress feed as Groq works through each stage
6. Review your results:
   - **Score panel** — weighted match score with per-dimension breakdown
   - **Skill graph** — interactive graph showing relationships between skills
   - **Recommendations** — prioritized actions to improve your candidacy
7. Click **Download Report (JSON)** to save the full analysis

### Reading the Skill Graph

| Color | Meaning |
|---|---|
| Green nodes | Skills you have that the job wants (matched) |
| Red nodes | Skills the job requires that you're missing (gaps) |
| Orange nodes | Skills you have that aren't mentioned in the JD |

| Edge style | Meaning |
|---|---|
| Dashed blue | Same technology family (e.g. MySQL ↔ PostgreSQL) |
| Solid arrow (purple) | Prerequisite relationship (e.g. JavaScript → React) |
| Dotted green | Transferable — your existing skill gives a head-start on the gap |

Node size reflects proficiency level — larger nodes indicate more experience with that skill.

---

## Available Scripts

### Backend (`backend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start with hot-reload (uses tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output (after `npm run build`) |

### Frontend (`frontend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Troubleshooting

**"CV text must be at least 50 characters"**
The CV panel requires at least 50 characters before the Analyze button activates. If you uploaded a file and the character count shows 0, the file may not have extractable text (e.g. a scanned image PDF).

**"Could not extract readable text from the file"**
The file was uploaded successfully but contained no parseable text. This happens with scanned PDFs or image-only documents. Use the **Paste Text** tab and copy-paste the content manually instead.

**"Analysis failed" / API error**
- Confirm your API key in `backend/.env` starts with `gsk_`
- Check that the backend terminal shows no startup errors
- Verify your Groq account is active at [console.groq.com](https://console.groq.com)

**Frontend can't reach the backend**
- Make sure the backend is running on port 3000 before starting the frontend
- The Vite dev server proxies `/api` requests to `http://localhost:3000` automatically — no CORS configuration needed on your end

**Port already in use**
Change the port in `backend/.env`:
```env
PORT=3001
```
Then update `frontend/vite.config.ts`:
```ts
proxy: {
  "/api": "http://localhost:3001",
}
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI | Groq (`llama-3.3-70b-versatile`) via `groq-sdk` |
| Backend | Node.js + Express 5 + TypeScript |
| File parsing | `pdf-parse` (PDF) + `mammoth` (DOCX/DOC) via `multer` |
| Validation | Zod |
| Frontend | React 19 + Vite + Tailwind CSS |
| Graph | vis-network |
| State | React Query (TanStack) |
| Streaming | Server-Sent Events (SSE) over `fetch()` |
