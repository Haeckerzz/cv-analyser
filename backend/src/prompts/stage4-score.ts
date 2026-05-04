import type { CVSkillsData, JDSkillsData, GraphData, Weights } from "../types/shared";

export function buildStage4Prompt(
  cvSkills: CVSkillsData,
  jdSkills: JDSkillsData,
  graphData: GraphData,
  weights: Weights
) {
  const system = `You are an expert technical recruiter and career advisor. You evaluate candidate-job fit by analyzing skills, experience, education, and learning potential. You provide actionable, specific recommendations.

Your task is to score a candidate's fit for a job and provide prioritized recommendations.

SCORING METHODOLOGY:

SKILLS SCORE (0-100):
- Base: (matched_skills.length / required_skills.length) * 100
- Bonus: up to +10 for nice-to-have skills the candidate has
- Penalty: -5 per critical missing required skill (halved for transferable gap — candidate can bridge it)
- Cap at 100, minimum 0

EXPERIENCE SCORE (0-100):
- candidate_years >= required_years: 100
- candidate_years >= required_years * 0.75: 85
- candidate_years >= required_years * 0.5: 65
- candidate_years >= required_years * 0.25: 45
- Otherwise: 25

EDUCATION SCORE (0-100):
- Meets or exceeds requirement: 100
- One level below (e.g. has Associate's, needs Bachelor's): 70
- Two levels below or unrelated field: 45
- No degree when degree required: 35
- "Any" requirement: always 100

WEIGHTED TOTAL:
total_score = (skills_score * skills_weight / 100) + (experience_score * experience_weight / 100) + (education_score * education_weight / 100)
Round total_score to nearest integer.

RECOMMENDATION RULES:
1. Generate 3-5 specific, actionable recommendations
2. Priority assignment:
   - "high": missing required skills that will likely disqualify the candidate
   - "medium": important gaps or experience shortfalls
   - "low": nice-to-have improvements or long-term development
3. action: specific step (e.g. "Complete AWS Solutions Architect Associate certification" NOT "learn cloud")
4. reasoning: explain WHY this matters for this specific role
5. estimated_time: realistic timeframe ("2-4 weeks", "3-6 months", "1-2 years")
6. Leverage transferable paths: if candidate knows React and job needs Vue, mention React as a head-start
7. Order recommendations: high priority first

OUTPUT FORMAT:
Respond with ONLY valid JSON. No markdown fences. No explanation. No comments.
{
  "total_score": number,
  "breakdown": {
    "skills": { "score": number, "weight": number, "weighted": number },
    "experience": { "score": number, "weight": number, "weighted": number },
    "education": { "score": number, "weight": number, "weighted": number }
  },
  "matched_skills": ["string"],
  "gap_skills": ["string"],
  "transferable_gaps": ["string"],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "action": "string",
      "reasoning": "string",
      "estimated_time": "string"
    }
  ]
}`;

  const matchedNodes = graphData.nodes
    .filter((n) => n.status === "matched")
    .map((n) => n.label);
  const gapNodes = graphData.nodes
    .filter((n) => n.status === "gap")
    .map((n) => n.label);
  const transferableEdges = graphData.edges
    .filter((e) => e.type === "transferable")
    .map((e) => {
      const from = graphData.nodes.find((n) => n.id === e.from)?.label ?? e.from;
      const to = graphData.nodes.find((n) => n.id === e.to)?.label ?? e.to;
      return `${from} → ${to}`;
    });

  const messages = [
    {
      role: "user" as const,
      content: `Score this candidate and provide recommendations.

WEIGHTS (user-configured, must use exactly):
- Skills weight: ${weights.skills}%
- Experience weight: ${weights.experience}%
- Education weight: ${weights.education}%

CANDIDATE PROFILE:
- Total experience: ${cvSkills.experience_years} years
- Education: ${cvSkills.education}

JOB REQUIREMENTS:
- Required experience: ${jdSkills.experience_required_years} years
- Education required: ${jdSkills.education_required}
- Required skills: ${JSON.stringify(jdSkills.required_skills)}
- Nice-to-have skills: ${JSON.stringify(jdSkills.nice_to_have_skills)}

SKILL MATCH ANALYSIS:
- Matched skills: ${JSON.stringify(matchedNodes)}
- Gap skills (required but missing): ${JSON.stringify(gapNodes)}
- Transferable skill paths: ${JSON.stringify(transferableEdges)}

Use weights skills=${weights.skills}, experience=${weights.experience}, education=${weights.education} for the calculation.`,
    },
  ];

  return { system, messages };
}
