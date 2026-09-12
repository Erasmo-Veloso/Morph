export const CAPSULE_VERSION = 1 as const;

export const PHASE_TYPES = ["UNDERSTAND", "MEASURE", "ANALYSE", "REFLECT"] as const;
export type PhaseType = (typeof PHASE_TYPES)[number];

export const CAPABILITIES = [
  "MATERIAL",
  "NOTES",
  "ACCELEROMETER",
  "TIMER",
  "CHART",
  "CALCULATOR",
  "REFLECTION",
] as const;
export type Capability = (typeof CAPABILITIES)[number];

export interface LessonCapsule {
  id: string;
  version: 1;
  lesson: {
    subject: string;
    topic: string;
    classId: string;
    teacherId: string;
    durationMinutes: number;
  };
  phases: Phase[];
  policy: {
    integrityMonitoring: boolean;
    offlineExecution: boolean;
  };
  issuedAt: string;
  durationMs: number;
  signature?: string;
}

export interface Phase {
  id: string;
  type: PhaseType;
  title: string;
  durationMinutes: number;
  capabilities: Capability[];
  restrictions: {
    packages: string[];
    categories: string[];
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function parseLessonCapsule(input: unknown): LessonCapsule {
  if (!isRecord(input)) throw new Error("Capsule must be an object");
  if (input.version !== CAPSULE_VERSION) throw new Error("Unsupported capsule version");
  if (!isNonEmptyString(input.id) || !isNonEmptyString(input.issuedAt)) {
    throw new Error("Capsule id and issuedAt are required");
  }
  if (!isPositiveNumber(input.durationMs)) throw new Error("durationMs must be positive");

  const lesson = input.lesson;
  if (!isRecord(lesson)) throw new Error("lesson is required");
  for (const field of ["subject", "topic", "classId", "teacherId"] as const) {
    if (!isNonEmptyString(lesson[field])) throw new Error(`lesson.${field} is required`);
  }
  if (!isPositiveNumber(lesson.durationMinutes)) throw new Error("lesson.durationMinutes must be positive");

  if (!Array.isArray(input.phases) || input.phases.length === 0) throw new Error("At least one phase is required");
  const phases = input.phases.map((value, index) => parsePhase(value, index));
  const phaseTypes = phases.map((phase) => phase.type);
  if (new Set(phaseTypes).size !== phaseTypes.length) throw new Error("Phase types must be unique");

  if (!isRecord(input.policy) || typeof input.policy.integrityMonitoring !== "boolean" || typeof input.policy.offlineExecution !== "boolean") {
    throw new Error("policy must define integrityMonitoring and offlineExecution");
  }

  return input as unknown as LessonCapsule;
}

function parsePhase(input: unknown, index: number): Phase {
  if (!isRecord(input)) throw new Error(`phases[${index}] must be an object`);
  if (!isNonEmptyString(input.id) || !isNonEmptyString(input.title)) throw new Error(`phases[${index}] id and title are required`);
  if (!PHASE_TYPES.includes(input.type as PhaseType)) throw new Error(`phases[${index}] has an invalid type`);
  if (!isPositiveNumber(input.durationMinutes)) throw new Error(`phases[${index}].durationMinutes must be positive`);
  if (!Array.isArray(input.capabilities) || input.capabilities.some((value) => !CAPABILITIES.includes(value as Capability))) {
    throw new Error(`phases[${index}].capabilities contains an invalid capability`);
  }
  if (!isRecord(input.restrictions) || !Array.isArray(input.restrictions.packages) || !Array.isArray(input.restrictions.categories)) {
    throw new Error(`phases[${index}].restrictions is invalid`);
  }
  if (input.restrictions.packages.some((value) => !isNonEmptyString(value)) || input.restrictions.categories.some((value) => !isNonEmptyString(value))) {
    throw new Error(`phases[${index}].restrictions must contain strings`);
  }
  return input as unknown as Phase;
}

