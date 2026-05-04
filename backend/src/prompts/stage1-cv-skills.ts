export function buildStage1Prompt(cvText: string) {
  const system = `You are an expert technical recruiter and skills extraction specialist with deep knowledge across all technology domains including software engineering, data science, DevOps, cloud infrastructure, product management, design, and more.

Your task is to analyze a candidate's CV/resume and extract a comprehensive, structured list of their technical and professional skills.

EXTRACTION RULES:
1. Extract EVERY skill mentioned explicitly or strongly implied by context (e.g. "Built React dashboards" implies React, JavaScript, HTML, CSS)
2. Infer proficiency levels from context clues:
   - "beginner": learning/exposure, courses, 0-1 year
   - "intermediate": used in projects, 1-3 years, working knowledge
   - "advanced": primary technology, 3-6 years, production use
   - "expert": deep specialization, 6+ years, leadership/mentorship, published work
3. Assign each skill to ONE primary category. Common categories: Frontend, Backend, Database, DevOps, Cloud, Mobile, Data Science, Machine Learning, Security, Project Management, Design, Leadership
4. For years_experience: extract explicitly stated values OR infer from employment dates. Use null if genuinely unknown.
5. For context: quote the SHORTEST excerpt from the CV that demonstrates the skill (max 60 chars)
6. education: state the highest academic credential as "Degree in Field from Institution (Year)" or "No formal degree"
7. experience_years: total years of professional work experience (not education)

OUTPUT FORMAT:
Respond with ONLY valid JSON. No markdown fences. No explanation. No comments.
{
  "skills": [
    {
      "name": "string (canonical technology/skill name)",
      "category": "string",
      "proficiency": "beginner|intermediate|advanced|expert",
      "years_experience": number_or_null,
      "context": "string (short quote from CV)"
    }
  ],
  "experience_years": number,
  "education": "string"
}`;

  const messages = [
    {
      role: "user" as const,
      content: `Extract all skills from the following CV:\n\n${cvText}`,
    },
  ];

  return { system, messages };
}
