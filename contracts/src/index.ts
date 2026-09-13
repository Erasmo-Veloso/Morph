export const CAPSULE_VERSION = 1 as const;

export const PHASE_TYPES = ["UNDERSTAND", "MEASURE", "ANALYSE", "REFLECT"] as const;
export type PhaseType = (typeof PHASE_TYPES)[number];

export const CAPABILITIES = [
  "LEARNING_CONTENT", "GUIDED_EXPLANATION", "ACCELEROMETER", "GYROSCOPE",
  "CAMERA", "CHRONOMETER", "COLLECTED_DATA", "GRAPH", "CALCULATOR", "EXIT_TICKET"
] as const;
export type Capability = (typeof CAPABILITIES)[number];

export const RESTRICTIONS = ["SOCIAL_APPS", "MESSAGING", "UNRELATED_BROWSER"] as const;
export type Restriction = (typeof RESTRICTIONS)[number];

export interface LearningAsset {
  id: string;
  title: string;
  kind: "TEXT" | "PROMPT" | "DATASET";
  local: boolean;
}

export interface LearningPhase {
  id: PhaseType;
  duration: number;
  capabilities: Capability[];
  restrictions: Restriction[];
  learning_assets: LearningAsset[];
  transitions: { next: PhaseType | null };
}

export interface LearningCapsule {
  id: string;
  version: 1;
  objective: string;
  phases: LearningPhase[];
  integrity_policy: {
    enabled: boolean;
    sentinel_events?: string[];
    privacy?: "POLICY_INTEGRITY_ONLY";
  };
  offline_policy: {
    enabled: boolean;
    assets?: "LOCAL_CACHE";
    events?: "LOCAL_QUEUE";
  };
  valid_from: string;
  valid_until: string;
  signature?: string;
}

export type LessonCapsule = LearningCapsule;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function parseLessonCapsule(input: unknown): LearningCapsule {
  if (!isRecord(input)) throw new Error("Capsule must be an object");
  if (input.version !== CAPSULE_VERSION) throw new Error("Unsupported capsule version");
  if (!isNonEmptyString(input.id) || !isNonEmptyString(input.objective)) {
    throw new Error("Capsule id and objective are required");
  }
  if (!isNonEmptyString(input.valid_from) || !isNonEmptyString(input.valid_until)) {
    throw new Error("Capsule validity is required");
  }
  if (Number.isNaN(Date.parse(input.valid_from)) || Number.isNaN(Date.parse(input.valid_until))) {
    throw new Error("Capsule validity must use ISO timestamps");
  }
  if (!Array.isArray(input.phases) || input.phases.length === 0) throw new Error("At least one phase is required");
  const phases = input.phases.map((value, index) => parsePhase(value, index));
  const phaseTypes = phases.map((phase) => phase.id);
  if (new Set(phaseTypes).size !== phaseTypes.length) throw new Error("Phase types must be unique");

  if (!isRecord(input.integrity_policy) || typeof input.integrity_policy.enabled !== "boolean") {
    throw new Error("integrity_policy.enabled is required");
  }
  if (!isRecord(input.offline_policy) || typeof input.offline_policy.enabled !== "boolean") {
    throw new Error("offline_policy.enabled is required");
  }
  if (input.signature !== undefined && !isNonEmptyString(input.signature)) {
    throw new Error("signature must be a non-empty string");
  }
  return input as unknown as LearningCapsule;
}

function parsePhase(input: unknown, index: number): LearningPhase {
  if (!isRecord(input)) throw new Error(`phases[${index}] must be an object`);
  if (!PHASE_TYPES.includes(input.id as PhaseType)) throw new Error(`phases[${index}] has an invalid id`);
  if (!isPositiveNumber(input.duration)) throw new Error(`phases[${index}].duration must be positive`);
  if (!Array.isArray(input.capabilities) || input.capabilities.some((value) => !CAPABILITIES.includes(value as Capability))) {
    throw new Error(`phases[${index}].capabilities contains an invalid capability`);
  }
  if (!Array.isArray(input.restrictions) || input.restrictions.some((value) => !RESTRICTIONS.includes(value as Restriction))) {
    throw new Error(`phases[${index}].restrictions contains an invalid restriction`);
  }
  if (!Array.isArray(input.learning_assets)) throw new Error(`phases[${index}].learning_assets is required`);
  if (!isRecord(input.transitions) || (input.transitions.next !== null && !PHASE_TYPES.includes(input.transitions.next as PhaseType))) {
    throw new Error(`phases[${index}].transitions.next is invalid`);
  }
  return input as unknown as LearningPhase;
}
