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

export const SENTINEL_EVENT_TYPES = [
  "RESTRICTED_ACCESS_ATTEMPT",
  "CONNECTIVITY_CHANGED",
  "SCHOOL_CONTEXT_LOST",
  "POLICY_PERMISSION_CHANGED"
] as const;
export type SentinelEventType = (typeof SENTINEL_EVENT_TYPES)[number];

export interface LearningAsset {
  id: string;
  title: string;
  kind: "TEXT" | "PROMPT" | "DATASET";
  local: boolean;
}

export interface ApprovedApp {
  id: string;
  name: string;
  category: string;
  description?: string;
  package_names: string[];
  preferred_android?: {
    package_name: string;
    activity_name?: string;
  };
}

export interface LearningPhase {
  id: PhaseType;
  duration: number;
  capabilities: Capability[];
  restrictions: Restriction[];
  allowed_apps: ApprovedApp[];
  learning_assets: LearningAsset[];
  transitions: { next: PhaseType | null };
}

export interface SchoolBubble {
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
}

export interface LearningCapsule {
  id: string;
  version: 1;
  objective: string;
  phases: LearningPhase[];
  integrity_policy: {
    enabled: boolean;
    sentinel_events?: SentinelEventType[];
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
  school_bubble?: SchoolBubble;
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
  const sentinelEvents = input.integrity_policy.sentinel_events;
  if (sentinelEvents !== undefined && (!Array.isArray(sentinelEvents) || sentinelEvents.some((value) => !SENTINEL_EVENT_TYPES.includes(value as SentinelEventType)))) {
    throw new Error("integrity_policy.sentinel_events contains an invalid event");
  }
  if (!isRecord(input.offline_policy) || typeof input.offline_policy.enabled !== "boolean") {
    throw new Error("offline_policy.enabled is required");
  }
  if (input.signature !== undefined && !isNonEmptyString(input.signature)) {
    throw new Error("signature must be a non-empty string");
  }
  if (input.school_bubble !== undefined) parseSchoolBubble(input.school_bubble);
  return input as unknown as LearningCapsule;
}

function parseSchoolBubble(input: unknown): SchoolBubble {
  if (!isRecord(input)) throw new Error("school_bubble must be an object");
  if (!isNonEmptyString(input.id) || !isNonEmptyString(input.school_id) || !isNonEmptyString(input.name)) {
    throw new Error("school_bubble id, school_id and name are required");
  }
  if (!isRecord(input.boundary) || input.boundary.type !== "CIRCLE" || !isRecord(input.boundary.center)) {
    throw new Error("school_bubble must define a circular boundary");
  }
  const { latitude, longitude } = input.boundary.center;
  if (typeof latitude !== "number" || latitude < -90 || latitude > 90 || typeof longitude !== "number" || longitude < -180 || longitude > 180 || !isPositiveNumber(input.boundary.radius_meters)) {
    throw new Error("school_bubble boundary is invalid");
  }
  if (!isRecord(input.policy) || typeof input.policy.gps_required !== "boolean" || !isPositiveNumber(input.policy.max_accuracy_meters) || !isPositiveNumber(input.policy.unknown_location_grace_seconds)) {
    throw new Error("school_bubble policy is invalid");
  }
  return input as unknown as SchoolBubble;
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
  if (!Array.isArray(input.allowed_apps)) throw new Error(`phases[${index}].allowed_apps is required`);
  const appIds = input.allowed_apps.map((app, appIndex) => parseApprovedApp(app, index, appIndex).id);
  if (new Set(appIds).size !== appIds.length) throw new Error(`phases[${index}].allowed_apps contains duplicate apps`);
  if (!Array.isArray(input.learning_assets)) throw new Error(`phases[${index}].learning_assets is required`);
  if (!isRecord(input.transitions) || (input.transitions.next !== null && !PHASE_TYPES.includes(input.transitions.next as PhaseType))) {
    throw new Error(`phases[${index}].transitions.next is invalid`);
  }
  return input as unknown as LearningPhase;
}

function parseApprovedApp(input: unknown, phaseIndex: number, appIndex: number): ApprovedApp {
  if (!isRecord(input) || !isNonEmptyString(input.id) || !isNonEmptyString(input.name) || !isNonEmptyString(input.category)) {
    throw new Error(`phases[${phaseIndex}].allowed_apps[${appIndex}] is invalid`);
  }
  if (!Array.isArray(input.package_names) || input.package_names.length === 0 || input.package_names.some((name) => !isNonEmptyString(name))) {
    throw new Error(`phases[${phaseIndex}].allowed_apps[${appIndex}].package_names is invalid`);
  }
  if (input.preferred_android !== undefined && (!isRecord(input.preferred_android) || !isNonEmptyString(input.preferred_android.package_name) || (input.preferred_android.activity_name !== undefined && !isNonEmptyString(input.preferred_android.activity_name)))) {
    throw new Error(`phases[${phaseIndex}].allowed_apps[${appIndex}].preferred_android is invalid`);
  }
  return input as unknown as ApprovedApp;
}
