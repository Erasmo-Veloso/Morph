import assert from "node:assert/strict";
import { parseLessonCapsule } from "../contracts/src/index.js";
import {
  buildCapsuleFromDraft,
  normalizeLessonDraft,
  planLesson,
  type LessonDraft
} from "../web/lib/capsule-planner.ts";

const originalKey = process.env.GROQ_API_KEY;
const originalEnabled = process.env.AI_CAPSULES_ENABLED;
delete process.env.GROQ_API_KEY;
process.env.AI_CAPSULES_ENABLED = "true";

const result = await planLesson("Ensinar História: Revolução Francesa com fontes, debate, análise de evidências e reflexão.");
assert.equal(result.source, "fallback");
assert.equal(result.capsule.subject, "História");
assert.match(result.capsule.title ?? "", /Revolução Francesa/i);
assert.equal(result.capsule.phases.length, 4);
assert.deepEqual(result.capsule.phases.map(({ id }) => id), ["UNDERSTAND", "MEASURE", "ANALYSE", "REFLECT"]);
assert.ok(result.capsule.phases.every(({ allowed_apps }) => allowed_apps.length === 0));
parseLessonCapsule(result.capsule);

const draft = normalizeLessonDraft({
  title: "Ecossistemas locais",
  subject: "Biologia",
  school_level: "8.º ano",
  objective: "Relacionar seres vivos e ambiente através de observação e reflexão.",
  phases: [
    { id: "UNDERSTAND", title: "Contexto", objective: "Compreender relações", activity: "Ler o contexto", evidence: "Hipótese", duration_minutes: 8, capabilities: ["LEARNING_CONTENT"], recommended_apps: [] },
    { id: "MEASURE", title: "Observar", objective: "Recolher sinais", activity: "Observar o espaço", evidence: "Registo", duration_minutes: 10, capabilities: ["CAMERA", "COLLECTED_DATA"], recommended_apps: [] },
    { id: "ANALYSE", title: "Interpretar", objective: "Encontrar padrões", activity: "Comparar registos", evidence: "Conclusão", duration_minutes: 7, capabilities: ["GRAPH"], recommended_apps: [] },
    { id: "REFLECT", title: "Aplicar", objective: "Transferir a aprendizagem", activity: "Escrever reflexão", evidence: "Exit ticket", duration_minutes: 5, capabilities: ["EXIT_TICKET"], recommended_apps: [] }
  ]
} satisfies LessonDraft);
const compiled = buildCapsuleFromDraft(draft);
assert.equal(compiled.subject, "Biologia");
assert.ok(compiled.phases[1].learning_assets[0].activity?.includes("Observar"));
assert.ok(compiled.phases.every((phase) => phase.restrictions.includes("SOCIAL_APPS")));
parseLessonCapsule(compiled);
assert.throws(() => normalizeLessonDraft({ ...draft, phases: draft.phases.map((phase) => ({ ...phase, activity: "Abrir com.example.game" })) }), /package name/);

if (originalKey === undefined) delete process.env.GROQ_API_KEY;
else process.env.GROQ_API_KEY = originalKey;
if (originalEnabled === undefined) delete process.env.AI_CAPSULES_ENABLED;
else process.env.AI_CAPSULES_ENABLED = originalEnabled;

console.log("AI planner fallback and semantic validation: PASS");
