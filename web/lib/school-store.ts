import type { LearningCapsule, SchoolBubble } from "./capsule";

export type SchoolTeacher = { id: string; name: string; subject: string; className: string; studentIds: string[] };
export type SchoolStudent = { id: string; name: string; className: string };

export type SchoolConfig = {
  id: string;
  name: string;
  bubble: SchoolBubble;
  teachers: SchoolTeacher[];
  students: SchoolStudent[];
};

const defaultSchool: SchoolConfig = {
  id: "school-horizonte",
  name: "Colégio Horizonte",
  bubble: {
    id: "bubble-horizonte-main",
    school_id: "school-horizonte",
    name: "Campus Horizonte",
    boundary: { type: "CIRCLE", center: { latitude: -8.8383, longitude: 13.2344 }, radius_meters: 180 },
    policy: { gps_required: true, max_accuracy_meters: 100, unknown_location_grace_seconds: 300 }
  },
  teachers: [
    { id: "teacher-ana", name: "Prof. Ana Matias", subject: "Física", className: "10.º A", studentIds: ["student-demo", "student-2", "student-3"] },
    { id: "teacher-joel", name: "Prof. Joel Manuel", subject: "Matemática", className: "9.º B", studentIds: ["student-4", "student-5"] },
    { id: "teacher-lurdes", name: "Prof. Lurdes Paulo", subject: "Biologia", className: "11.º C", studentIds: ["student-6", "student-7"] }
  ],
  students: [
    { id: "student-demo", name: "Aluno demo", className: "10.º A" },
    { id: "student-2", name: "Marta Costa", className: "10.º A" },
    { id: "student-3", name: "André Silva", className: "10.º A" },
    { id: "student-4", name: "Nuno Paulo", className: "9.º B" },
    { id: "student-5", name: "Rita Miguel", className: "9.º B" },
    { id: "student-6", name: "Ivo Manuel", className: "11.º C" },
    { id: "student-7", name: "Sara João", className: "11.º C" }
  ]
};

const globalStore = globalThis as typeof globalThis & { morphSchool?: SchoolConfig };

function clone<T>(value: T): T { return structuredClone(value); }

export function getSchool(): SchoolConfig {
  globalStore.morphSchool ??= clone(defaultSchool);
  return clone(globalStore.morphSchool);
}

export function saveSchoolBubble(candidate: SchoolBubble): SchoolConfig {
  if (candidate.boundary.type !== "CIRCLE" || !Number.isFinite(candidate.boundary.center.latitude) || !Number.isFinite(candidate.boundary.center.longitude) || candidate.boundary.center.latitude < -90 || candidate.boundary.center.latitude > 90 || candidate.boundary.center.longitude < -180 || candidate.boundary.center.longitude > 180 || candidate.boundary.radius_meters < 50 || candidate.boundary.radius_meters > 2000) {
    throw new Error("A School Bubble precisa de um centro válido e de um raio entre 50 e 2000 metros.");
  }
  if (candidate.policy.max_accuracy_meters < 10 || candidate.policy.unknown_location_grace_seconds < 30) {
    throw new Error("A política de localização da School Bubble é inválida.");
  }
  const school = getSchool();
  globalStore.morphSchool = { ...school, bubble: clone(candidate) };
  return getSchool();
}

export function attachSchoolBubble(capsule: LearningCapsule): LearningCapsule {
  return { ...capsule, school_bubble: getSchool().bubble };
}
