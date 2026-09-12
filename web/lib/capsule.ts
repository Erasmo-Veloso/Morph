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
};

export type LearningPhase = {
  id: PhaseId;
  duration: number;
  capabilities: Capability[];
  restrictions: Restriction[];
  learning_assets: LearningAsset[];
  transitions: {
    next: PhaseId | null;
  };
};

export type LearningCapsule = {
  id: string;
  version: 1;
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
  const objective =
    normalizedIntent.length > 0
      ? "Understand accelerated motion through explanation, measurement, analysis and reflection"
      : "Understand accelerated motion";

  const now = new Date();
  const validUntil = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  return {
    capsule: {
      id: "physics-accelerated-motion-001",
      version: 1,
      objective,
      phases: [
        {
          id: "UNDERSTAND",
          duration: phaseDurations.UNDERSTAND,
          capabilities: ["LEARNING_CONTENT", "GUIDED_EXPLANATION"],
          restrictions: ["SOCIAL_APPS", "MESSAGING"],
          learning_assets: [
            {
              id: "asset-understand-motion",
              title: "Short explanation: accelerated motion",
              kind: "TEXT",
              local: true
            }
          ],
          transitions: { next: "MEASURE" }
        },
        {
          id: "MEASURE",
          duration: phaseDurations.MEASURE,
          capabilities: ["ACCELEROMETER", "GYROSCOPE", "CAMERA", "CHRONOMETER"],
          restrictions: ["SOCIAL_APPS", "MESSAGING", "UNRELATED_BROWSER"],
          learning_assets: [
            {
              id: "asset-measure-protocol",
              title: "Group experiment protocol",
              kind: "PROMPT",
              local: true
            }
          ],
          transitions: { next: "ANALYSE" }
        },
        {
          id: "ANALYSE",
          duration: phaseDurations.ANALYSE,
          capabilities: ["COLLECTED_DATA", "GRAPH", "CALCULATOR"],
          restrictions: ["SOCIAL_APPS", "MESSAGING"],
          learning_assets: [
            {
              id: "asset-analysis-template",
              title: "Local graph and calculation workspace",
              kind: "DATASET",
              local: true
            }
          ],
          transitions: { next: "REFLECT" }
        },
        {
          id: "REFLECT",
          duration: phaseDurations.REFLECT,
          capabilities: ["EXIT_TICKET"],
          restrictions: ["SOCIAL_APPS", "MESSAGING"],
          learning_assets: [
            {
              id: "asset-exit-ticket",
              title: "Personal conclusion prompt",
              kind: "PROMPT",
              local: true
            }
          ],
          transitions: { next: null }
        }
      ],
      integrity_policy: {
        enabled: true,
        sentinel_events: [
          "RESTRICTED_CAPABILITY_REQUESTED",
          "PERMISSION_CHANGED",
          "NETWORK_UNAVAILABLE",
          "LOCAL_QUEUE_SYNCED"
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
      "Deterministic compiler output for the Hacktudo MVP lesson.",
      "Capsule is offline-ready and does not depend on the original teacher text.",
      "Sentinel events are limited to policy integrity, not student content."
    ]
  };
}

export function getNextPhase(capsule: LearningCapsule, currentPhase: PhaseId) {
  const phase = capsule.phases.find((item) => item.id === currentPhase);
  return phase?.transitions.next ?? null;
}
