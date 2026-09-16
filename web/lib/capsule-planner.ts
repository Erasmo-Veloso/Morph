import { parseLessonCapsule } from "../../contracts/src/index";
import { loadEnvConfig } from "@next/env";
import path from "node:path";
import {
  CAPABILITIES,
  PHASE_TYPES
} from "../../contracts/src/index";
import {
  compilePedagogicalIntent,
  type ApprovedApp,
  type Capability,
  type CompileResult,
  type LearningCapsule,
  type LearningAsset,
  type PhaseId
} from "./capsule";

export type DraftPhase = {
  id: PhaseId;
  title: string;
  objective: string;
  activity: string;
  evidence: string;
  duration_minutes: number;
  capabilities: Capability[];
  recommended_apps: AppRecommendation[];
};

export type AppRecommendation = {
  id: string;
  reason: string;
};

export type LessonDraft = {
  title: string;
  subject: string;
  school_level: string;
  objective: string;
  phases: [DraftPhase, DraftPhase, DraftPhase, DraftPhase];
};

export type PlannedCapsule = CompileResult & {
  source: "groq" | "fallback";
  draft: LessonDraft;
};

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b";
const MAX_INTENT_LENGTH = 1200;
const MAX_TEXT_LENGTH = 240;

// The repository-level .env is intentionally shared by web and the bridge.
// Load it only in this server-only module; never expose it through client code.
loadEnvConfig(path.resolve(process.cwd(), ".."));

const safeCapabilities = [...CAPABILITIES] as Capability[];

export function lessonDraftSchemaFor(appCatalog: ApprovedApp[]) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["title", "subject", "school_level", "objective", "phases"],
    properties: {
      title: { type: "string", minLength: 3, maxLength: MAX_TEXT_LENGTH },
      subject: { type: "string", minLength: 2, maxLength: 80 },
      school_level: { type: "string", minLength: 2, maxLength: 80 },
      objective: { type: "string", minLength: 10, maxLength: MAX_TEXT_LENGTH },
      phases: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "title", "objective", "activity", "evidence", "duration_minutes", "capabilities", "recommended_apps"],
          properties: {
            id: { type: "string", enum: [...PHASE_TYPES] },
            title: { type: "string", minLength: 2, maxLength: 80 },
            objective: { type: "string", minLength: 5, maxLength: MAX_TEXT_LENGTH },
            activity: { type: "string", minLength: 5, maxLength: MAX_TEXT_LENGTH },
            evidence: { type: "string", minLength: 5, maxLength: MAX_TEXT_LENGTH },
            duration_minutes: { type: "integer", minimum: 1, maximum: 60 },
            capabilities: { type: "array", items: { type: "string", enum: [...CAPABILITIES] } },
            recommended_apps: {
              type: "array",
              maxItems: 2,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["id", "reason"],
                properties: {
                  id: { type: "string", enum: appCatalog.map((app) => app.id) },
                  reason: { type: "string", minLength: 5, maxLength: 160 }
                }
              }
            }
          }
        }
      }
    }
  } as const;
}

export const lessonDraftSchema = lessonDraftSchemaFor([]);

type RecordValue = Record<string, unknown>;

export async function planLesson(intent: string, appCatalog: ApprovedApp[] = []): Promise<PlannedCapsule> {
  const boundedIntent = intent.trim().slice(0, MAX_INTENT_LENGTH);
  const fallback = () => fromFallback(boundedIntent, appCatalog);

  if (process.env.AI_CAPSULES_ENABLED === "false" || !hasUsableGroqKey()) return fallback();

  try {
    const draft = await requestGroqDraftWithRetry(boundedIntent, appCatalog);
    return fromDraft(draft, "groq", ["Rascunho pedagógico gerado por IA e validado localmente."]);
  } catch {
    const result = fallback();
    return {
      ...result,
      notes: ["IA indisponível ou resposta inválida; foi usado o fallback determinístico.", ...result.notes]
    };
  }
}

async function requestGroqDraftWithRetry(intent: string, appCatalog: ApprovedApp[]) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await requestGroqDraft(intent, appCatalog);
    } catch (error) {
      lastError = error;
      console.warn(`[Morph] Groq planner attempt ${attempt + 1} failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Groq draft generation failed");
}

export function normalizeLessonDraft(input: unknown, appCatalog: ApprovedApp[] = []): LessonDraft {
  if (!isRecord(input)) throw new Error("AI draft must be an object");
  const phasesValue = input.phases;
  if (!Array.isArray(phasesValue) || phasesValue.length !== 4) throw new Error("AI draft must contain four phases");
  const phases = phasesValue.map((phase, index) => normalizePhase(phase, index, appCatalog)) as [DraftPhase, DraftPhase, DraftPhase, DraftPhase];
  if (phases.map((phase) => phase.id).join(",") !== PHASE_TYPES.join(",")) throw new Error("AI draft phases are out of order");

  return {
    title: boundedText(input.title, "title"),
    subject: boundedText(input.subject, "subject"),
    school_level: boundedText(input.school_level, "school_level"),
    objective: boundedText(input.objective, "objective"),
    phases
  };
}

function fromFallback(intent: string, appCatalog: ApprovedApp[]): PlannedCapsule {
  const result = compilePedagogicalIntent(intent);
  return {
    ...result,
    source: "fallback",
    draft: draftFromCapsule(result.capsule, appCatalog)
  };
}

function fromDraft(draft: LessonDraft, source: PlannedCapsule["source"], notes: string[]): PlannedCapsule {
  const capsule = buildCapsuleFromDraft(draft);
  parseLessonCapsule(capsule);
  return { capsule, notes, source, draft };
}

export function buildCapsuleFromDraft(draft: LessonDraft): LearningCapsule {
  const now = new Date();
  const validUntil = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const totalSeconds = draft.phases.reduce((total, phase) => total + phase.duration_minutes * 60, 0);

  return {
    id: `capsule-${slug(`${draft.subject}-${draft.title}`)}-${shortHash(draft.objective)}`,
    version: 1,
    title: draft.title,
    subject: draft.subject,
    school_level: draft.school_level,
    objective: draft.objective,
    phases: draft.phases.map((phase, index) => ({
      id: phase.id,
      duration: phase.duration_minutes * 60,
      capabilities: uniqueCapabilities(phase.capabilities),
      restrictions: phase.id === "MEASURE" ? ["SOCIAL_APPS", "MESSAGING", "UNRELATED_BROWSER"] : ["SOCIAL_APPS", "MESSAGING"],
      allowed_apps: [],
      learning_assets: [assetForPhase(phase, index)],
      transitions: { next: draft.phases[index + 1]?.id ?? null }
    })),
    integrity_policy: {
      enabled: true,
      sentinel_events: ["RESTRICTED_ACCESS_ATTEMPT", "CONNECTIVITY_CHANGED", "SCHOOL_CONTEXT_LOST", "POLICY_PERMISSION_CHANGED"],
      privacy: "POLICY_INTEGRITY_ONLY"
    },
    offline_policy: { enabled: true, assets: "LOCAL_CACHE", events: "LOCAL_QUEUE" },
    valid_from: now.toISOString(),
    valid_until: new Date(now.getTime() + Math.max(totalSeconds * 1000, 60 * 60 * 1000)).toISOString(),
    signature: "demo-signature-hkt-04"
  };
}

async function requestGroqDraft(intent: string, appCatalog: ApprovedApp[]): Promise<LessonDraft> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL,
        temperature: 0.2,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content: [
              "És o planner pedagógico da Morph. Responde apenas com JSON válido, sem markdown.",
              "Gera um rascunho para qualquer disciplina, em português de Portugal, com os campos exactos pedidos.",
              "Inclui title, subject, school_level, objective e phases; cada fase inclui id, title, objective, activity, evidence, duration_minutes, capabilities e recommended_apps.",
              "As quatro fases devem permanecer nesta ordem: UNDERSTAND, MEASURE, ANALYSE, REFLECT.",
              "Escolhe apenas capabilities da enumeração recebida; usa sensores apenas quando a atividade realmente os exigir.",
              "Os únicos valores válidos para capabilities são LEARNING_CONTENT, GUIDED_EXPLANATION, ACCELEROMETER, GYROSCOPE, CAMERA, CHRONOMETER, COLLECTED_DATA, GRAPH, CALCULATOR e EXIT_TICKET.",
              "Cada fase deve incluir obrigatoriamente um título curto no campo title.",
              "Não cries packages Android, restrictions, políticas de segurança ou dados de alunos.",
              "Recomenda apenas aplicações do catálogo fornecido, usando o id exacto e uma razão pedagógica curta; não autorizes nenhuma aplicação automaticamente.",
              `Catálogo disponível: ${JSON.stringify(appCatalog.map(({ id, name, category }) => ({ id, name, category })))}.`,
              "O professor irá rever cada recomendação; a policy Android será aplicada por código separado.",
              "Mantém os textos concisos: uma frase curta por campo e no máximo duas recomendações por fase."
            ].join(" ")
          },
          { role: "user", content: `Intenção do professor:\n${intent || "Criar uma aula interdisciplinar introdutória."}` }
        ],
        response_format: {
          type: "json_object"
        }
      }),
      signal: controller.signal
    });
    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`Groq request failed: ${response.status} ${errorBody.slice(0, 280)}`);
    }
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq returned no content");
    return normalizeLessonDraft(JSON.parse(content), appCatalog);
  } finally {
    clearTimeout(timeout);
  }
}

function draftFromCapsule(capsule: LearningCapsule, appCatalog: ApprovedApp[]): LessonDraft {
  const phases = capsule.phases.map((phase) => {
    const asset = phase.learning_assets[0];
    return {
      id: phase.id,
      title: phase.id,
      objective: asset?.activity ?? asset?.title ?? "Explorar esta fase.",
      activity: asset?.activity ?? asset?.title ?? "Executar a atividade proposta.",
      evidence: asset?.evidence ?? "Registo local da aprendizagem.",
      duration_minutes: Math.max(1, Math.round(phase.duration / 60)),
      capabilities: phase.capabilities,
      recommended_apps: fallbackAppRecommendations(phase.id, appCatalog)
    };
  }) as [DraftPhase, DraftPhase, DraftPhase, DraftPhase];
  return {
    title: capsule.title ?? "Nova aula",
    subject: capsule.subject ?? "Aula interdisciplinar",
    school_level: capsule.school_level ?? "Ensino básico e secundário",
    objective: capsule.objective,
    phases
  };
}

function fallbackAppRecommendations(phaseId: PhaseId, appCatalog: ApprovedApp[]): AppRecommendation[] {
  const preferredCategories: Record<PhaseId, string[]> = {
    UNDERSTAND: ["NAVEGAÇÃO", "APRENDIZAGEM"],
    MEASURE: ["CAPTURA", "CÁLCULO", "NOTAS"],
    ANALYSE: ["CÁLCULO", "NOTAS", "APRENDIZAGEM"],
    REFLECT: ["NOTAS"]
  };
  return appCatalog
    .filter((app) => preferredCategories[phaseId].includes(app.category.toLocaleUpperCase("pt-PT")))
    .slice(0, 2)
    .map((app) => ({
      id: app.id,
      reason: phaseId === "MEASURE" ? "Ajuda a recolher ou registar evidência da atividade." : "Pode apoiar o trabalho desta etapa sem ser autorizado automaticamente."
    }));
}

function normalizePhase(input: unknown, index: number, appCatalog: ApprovedApp[]): DraftPhase {
  if (!isRecord(input)) throw new Error(`AI phase ${index + 1} is invalid`);
  const id = input.id;
  if (!PHASE_TYPES.includes(id as (typeof PHASE_TYPES)[number])) throw new Error(`AI phase ${index + 1} has an invalid id`);
  const duration = input.duration_minutes;
  if (typeof duration !== "number" || !Number.isInteger(duration) || duration < 1 || duration > 60) throw new Error(`AI phase ${index + 1} duration is invalid`);
  if (!Array.isArray(input.capabilities)) throw new Error(`AI phase ${index + 1} capabilities are invalid`);
  const capabilities = input.capabilities.filter((value): value is Capability => safeCapabilities.includes(value as Capability));
  if (capabilities.length !== input.capabilities.length) throw new Error(`AI phase ${index + 1} contains an unknown capability`);
  const recommendedApps = input.recommended_apps;
  if (!Array.isArray(recommendedApps)) throw new Error(`AI phase ${index + 1} recommendations are invalid`);
  const catalogIds = new Set(appCatalog.map((app) => app.id));
  const recommendations = recommendedApps.map((value, recommendationIndex) => {
    if (!isRecord(value) || typeof value.id !== "string" || !catalogIds.has(value.id)) {
      throw new Error(`AI phase ${index + 1} recommendation ${recommendationIndex + 1} is not in the school catalogue`);
    }
    return { id: value.id, reason: boundedText(value.reason, `phases[${index}].recommended_apps[${recommendationIndex}].reason`) };
  });
  if (new Set(recommendations.map(({ id }) => id)).size !== recommendations.length) throw new Error(`AI phase ${index + 1} contains duplicate app recommendations`);
  return {
    id: id as PhaseId,
    title: boundedText(input.title ?? input.objective, `phases[${index}].title`),
    objective: boundedText(input.objective, `phases[${index}].objective`),
    activity: boundedText(input.activity, `phases[${index}].activity`),
    evidence: boundedText(input.evidence, `phases[${index}].evidence`),
    duration_minutes: duration,
    capabilities,
    recommended_apps: recommendations
  };
}

function assetForPhase(phase: DraftPhase, index: number): LearningAsset {
  return {
    id: `asset-${phase.id.toLocaleLowerCase("en-US")}-${index + 1}`,
    title: phase.title,
    kind: phase.id === "MEASURE" || phase.id === "REFLECT" ? "PROMPT" : phase.id === "ANALYSE" ? "DATASET" : "TEXT",
    local: true,
    activity: phase.activity,
    evidence: phase.evidence
  };
}

function uniqueCapabilities(values: Capability[]) {
  return [...new Set(values)] as Capability[];
}

function boundedText(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length < 2 || value.length > MAX_TEXT_LENGTH) throw new Error(`AI draft field ${field} is invalid`);
  if (/\b[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+\b/i.test(value)) throw new Error(`AI draft field ${field} contains a package name`);
  return value.trim();
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasUsableGroqKey() {
  const key = process.env.GROQ_API_KEY?.trim();
  return Boolean(key && key.length >= 32 && !/^replace|^your[-_ ]/i.test(key));
}

function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 70) || "aula";
}

function shortHash(value: string) {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash.toString(36).slice(0, 7);
}
