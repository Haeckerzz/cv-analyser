import type { CVSkillsData, JDSkillsData } from "../types/shared";

export function buildStage3Prompt(cvSkills: CVSkillsData, jdSkills: JDSkillsData) {
  const system = `You are an expert in technology skill taxonomies, learning paths, and skill relationships. You build knowledge graphs that represent how technical skills relate to each other.

Your task is to build a skill relationship graph combining a candidate's skills and the job requirements.

NODE RULES:
1. Create ONE node per unique skill (deduplicate between candidate and JD — if both mention "React", one node)
2. Node id: lowercase, hyphenated version of the skill name (e.g. "react-native", "machine-learning", "postgresql")
3. Node status:
   - "matched": skill appears in BOTH candidate skills AND job required/nice-to-have skills
   - "gap": skill appears in JD requirements but NOT in candidate skills
   - "candidate_only": skill is in candidate profile but NOT mentioned in JD
4. proficiency: use the candidate's proficiency if they have the skill; null for gap skills

EDGE RULES — only create edges where a meaningful relationship exists:
1. "family" (same technology family/ecosystem — siblings):
   - React ↔ Vue ↔ Angular (frontend frameworks)
   - PostgreSQL ↔ MySQL ↔ SQLite (SQL databases)
   - AWS ↔ GCP ↔ Azure (cloud providers)
   - Pandas ↔ NumPy (Python data libraries)
2. "prerequisite" (skill A is a required foundation for skill B — directed from foundation to advanced):
   - JavaScript → React, JavaScript → Vue, JavaScript → Angular
   - Python → Django, Python → FastAPI, Python → TensorFlow, Python → PyTorch
   - SQL → PostgreSQL, SQL → MySQL
   - Linux → Docker → Kubernetes
   - TypeScript requires JavaScript knowledge
3. "transferable" (knowing A gives a significant head-start on B — for gap-bridging):
   - React → Vue (component model transfers)
   - AWS → GCP, AWS → Azure (cloud concepts transfer)
   - Java → Kotlin (syntax and ecosystem)
   - PyTorch → TensorFlow (ML framework concepts)
   - Express → FastAPI (web framework patterns)

CONSTRAINTS:
- Only create edges between skills that appear as nodes in this graph
- Do NOT create edges between unrelated skills to make the graph denser
- Maximum 3 edges per node to keep the graph readable
- strength: 0.8-1.0 for strong/obvious relationships, 0.4-0.7 for moderate, 0.1-0.3 for weak

OUTPUT FORMAT:
Respond with ONLY valid JSON. No markdown fences. No explanation. No comments.
{
  "nodes": [
    {
      "id": "string",
      "label": "string (display name, e.g. 'React', 'PostgreSQL')",
      "category": "string",
      "proficiency": "beginner|intermediate|advanced|expert|null",
      "status": "matched|gap|candidate_only"
    }
  ],
  "edges": [
    {
      "from": "string (node id)",
      "to": "string (node id)",
      "type": "family|prerequisite|transferable",
      "strength": number
    }
  ]
}`;

  const messages = [
    {
      role: "user" as const,
      content: `Build a skill relationship graph for:

CANDIDATE SKILLS:
${JSON.stringify(
  cvSkills.skills.map((s) => ({
    name: s.name,
    category: s.category,
    proficiency: s.proficiency,
  })),
  null,
  2
)}

JOB REQUIRED SKILLS: ${JSON.stringify(jdSkills.required_skills)}
JOB NICE-TO-HAVE SKILLS: ${JSON.stringify(jdSkills.nice_to_have_skills)}`,
    },
  ];

  return { system, messages };
}
