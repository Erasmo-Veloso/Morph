export type PhaseId = "UNDERSTAND" | "MEASURE" | "ANALYSE" | "REFLECT";

export type Capability =
  | "LEARNING_CONTENT"
  | "GUIDED_EXPLANATION"
  | "ACCELEROMETER"
  | "GYROSCOPE"
  | "CAMERA"
  | "CHRONOMETER"
  | "COLLECTED_DATA"
  | "GRAPH"
  | "CALCULATOR"
  | "EXIT_TICKET";

export type Restriction = "SOCIAL_APPS" | "MESSAGING" | "UNRELATED_BROWSER";

export type LearningAsset = {
  id: string;
  title: string;
  kind: "TEXT" | "PROMPT" | "DATASET";
  local: boolean;
  activity?: string;
  evidence?: string;
};

/** A school-approved Android application carried inside the offline Capsule. */
export type ApprovedApp = {
  id: string;
  name: string;
  category: string;
  description?: string;
  package_names: string[];
  preferred_android?: { package_name: string; activity_name?: string };
};

export type LearningPhase = {
  id: PhaseId;
  duration: number;
  capabilities: Capability[];
  restrictions: Restriction[];
  allowed_apps: ApprovedApp[];
  learning_assets: LearningAsset[];
  transitions: {
    next: PhaseId | null;
  };
};

export type SchoolBubble = {
  id: string;
  school_id: string;
  name: string;
  boundary: {
    type: "CIRCLE";
    center: { latitude: number; longitude: number };
    radius_meters: number;
  };
  policy: {
    gps_required: boolean;
    max_accuracy_meters: number;
    unknown_location_grace_seconds: number;
  };
};

export type LearningCapsule = {
  id: string;
  version: 1;
  title?: string;
  subject?: string;
  school_level?: string;
  objective: string;
  phases: LearningPhase[];
  integrity_policy: {
    enabled: true;
    sentinel_events: string[];
    privacy: "POLICY_INTEGRITY_ONLY";
  };
  offline_policy: {
    enabled: true;
    assets: "LOCAL_CACHE";
    events: "LOCAL_QUEUE";
  };
  valid_from: string;
  valid_until: string;
  signature: string;
  school_bubble?: SchoolBubble;
};

export type CompileResult = {
  capsule: LearningCapsule;
  notes: string[];
};

const phaseDurations: Record<PhaseId, number> = {
  UNDERSTAND: 480,
  MEASURE: 720,
  ANALYSE: 600,
  REFLECT: 300
};

export function compilePedagogicalIntent(intent: string): CompileResult {
  const normalizedIntent = intent.trim();
  const subject = inferSubject(normalizedIntent);
  const title = inferTitle(normalizedIntent, subject);
  const objective = normalizedIntent.length > 0
    ? `Compreender ${title.toLocaleLowerCase("pt-PT")} através de exploração, prática, análise e reflexão.`
    : "Explorar um tema através de compreensão, prática, análise e reflexão.";

  const now = new Date();
  const validUntil = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  return {
    capsule: {
      id: `capsule-${slug(`${subject}-${title}`) || "aula-geral"}-${shortHash(normalizedIntent || title)}`,
      version: 1,
      title,
      subject,
      school_level: "Ensino básico e secundário",
      objective,
      phases: [
        {
          id: "UNDERSTAND",
          duration: phaseDurations.UNDERSTAND,
          capabilities: ["LEARNING_CONTENT", "GUIDED_EXPLANATION"],
          restrictions: ["SOCIAL_APPS", "MESSAGING"],
          allowed_apps: [],
          learning_assets: [
            {
              id: "asset-understand-motion",
              title: `Introdução: ${title}`,
              kind: "TEXT",
              local: true,
              activity: `Explorar os conceitos essenciais de ${title.toLocaleLowerCase("pt-PT")}.`,
              evidence: "Hipótese inicial registada pelo aluno."
            }
          ],
          transitions: { next: "MEASURE" }
        },
        {
          id: "MEASURE",
          duration: phaseDurations.MEASURE,
          capabilities: ["ACCELEROMETER", "GYROSCOPE", "CAMERA", "CHRONOMETER"],
          restrictions: ["SOCIAL_APPS", "MESSAGING", "UNRELATED_BROWSER"],
          allowed_apps: [],
          learning_assets: [
            {
              id: "asset-measure-protocol",
              title: `Atividade prática: ${title}`,
              kind: "PROMPT",
              local: true,
              activity: "Executar a atividade proposta e recolher observações ou medições.",
              evidence: "Registo local de observações e dados."
            }
          ],
          transitions: { next: "ANALYSE" }
        },
        {
          id: "ANALYSE",
          duration: phaseDurations.ANALYSE,
          capabilities: ["COLLECTED_DATA", "GRAPH", "CALCULATOR"],
          restrictions: ["SOCIAL_APPS", "MESSAGING"],
          allowed_apps: [],
          learning_assets: [
            {
              id: "asset-analysis-template",
              title: `Análise de resultados: ${title}`,
              kind: "DATASET",
              local: true,
              activity: "Organizar os dados, identificar padrões e justificar uma conclusão.",
              evidence: "Interpretação local dos dados recolhidos."
            }
          ],
          transitions: { next: "REFLECT" }
        },
        {
          id: "REFLECT",
          duration: phaseDurations.REFLECT,
          capabilities: ["EXIT_TICKET"],
          restrictions: ["SOCIAL_APPS", "MESSAGING"],
          allowed_apps: [],
          learning_assets: [
            {
              id: "asset-exit-ticket",
              title: "Reflexão final",
              kind: "PROMPT",
              local: true,
              activity: "Explicar o que foi aprendido e o que ainda merece investigação.",
              evidence: "Conclusão individual guardada no dispositivo."
            }
          ],
          transitions: { next: null }
        }
      ],
      integrity_policy: {
        enabled: true,
        sentinel_events: [
          "RESTRICTED_ACCESS_ATTEMPT",
          "CONNECTIVITY_CHANGED",
          "SCHOOL_CONTEXT_LOST",
          "POLICY_PERMISSION_CHANGED"
        ],
        privacy: "POLICY_INTEGRITY_ONLY"
      },
      offline_policy: {
        enabled: true,
        assets: "LOCAL_CACHE",
        events: "LOCAL_QUEUE"
      },
      valid_from: now.toISOString(),
      valid_until: validUntil.toISOString(),
      signature: "demo-signature-hkt-04"
    },
    notes: [
      "Fallback determinístico agnóstico de disciplina para o MVP Hacktudo.",
      "A Capsule fica pronta para revisão do professor antes de ser publicada no runtime.",
      "O compilador não permite que conteúdo pedagógico escolha packages ou altere a policy Android.",
      "Os eventos Sentinel ficam limitados à integridade da policy, não ao conteúdo do aluno."
    ]
  };
}

const subjectHints: ReadonlyArray<[string, string]> = [
  ["física", "Física"],
  ["accelerated motion", "Física"],
  ["movimento acelerado", "Física"],
  ["matemática", "Matemática"],
  ["biologia", "Biologia"],
  ["química", "Química"],
  ["história", "História"],
  ["geografia", "Geografia"],
  ["português", "Português"],
  ["inglês", "Inglês"],
  ["programação", "Programação"],
  ["informática", "Informática"]
];

function inferSubject(intent: string) {
  const normalized = intent.toLocaleLowerCase("pt-PT");
  return subjectHints.find(([hint]) => normalized.includes(hint))?.[1] ?? "Aula interdisciplinar";
}

function inferTitle(intent: string, subject: string) {
  const cleaned = intent
    .replace(/^(ensinar|ensina|teach|teaches|aula sobre|explicar|explorar)\s+/i, "")
    .split(/\s+(?:com|with)\s+/i, 1)[0]
    .split(/[.!?;]/, 1)[0]
    ?.trim()
    .replace(/\s+/g, " ");
  if (!cleaned || cleaned.length < 3) return subject === "Aula interdisciplinar" ? "Nova aula" : subject;
  return cleaned.slice(0, 72);
}

function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function shortHash(value: string) {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash.toString(36).slice(0, 7);
}

/** A Capsule compiled before the school catalogue carries no app selection.
 * Read that absence as "no application authorised", which is the restrictive
 * reading, instead of letting a missing field break the studio or the API. */
export function withApprovedApps(capsule: LearningCapsule): LearningCapsule {
  return {
    ...capsule,
    phases: capsule.phases.map((phase) => ({ ...phase, allowed_apps: phase.allowed_apps ?? [] }))
  };
}

export function getNextPhase(capsule: LearningCapsule, currentPhase: PhaseId) {
  const phase = capsule.phases.find((item) => item.id === currentPhase);
  return phase?.transitions.next ?? null;
}
