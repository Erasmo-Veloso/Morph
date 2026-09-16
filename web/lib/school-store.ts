import { withApprovedApps } from "./capsule";
import type { ApprovedApp, LearningCapsule, SchoolBubble } from "./capsule";

export type SchoolTeacher = { id: string; name: string; subject: string; className: string; studentIds: string[] };
export type SchoolStudent = { id: string; name: string; className: string };
export type SchoolApp = ApprovedApp;

export type SchoolConfig = {
  id: string;
  name: string;
  bubble: SchoolBubble;
  teachers: SchoolTeacher[];
  students: SchoolStudent[];
  appCatalog: SchoolApp[];
};

const defaultSchool: SchoolConfig = {
  id: "school-demo",
  name: "Escola de demonstração",
  bubble: {
    id: "bubble-demo-main",
    school_id: "school-demo",
    name: "Campus de demonstração",
    boundary: { type: "CIRCLE", center: { latitude: -8.8383, longitude: 13.2344 }, radius_meters: 180 },
    policy: { gps_required: true, max_accuracy_meters: 100, unknown_location_grace_seconds: 300 }
  },
  teachers: [
    { id: "teacher-demo", name: "Professor da demonstração", subject: "Física", className: "Turma de demonstração", studentIds: ["demo-student", "student-2", "student-3"] },
    { id: "teacher-math", name: "Professor de Matemática", subject: "Matemática", className: "Turma B", studentIds: ["student-4", "student-5"] },
    { id: "teacher-biology", name: "Professor de Biologia", subject: "Biologia", className: "Turma C", studentIds: ["student-6", "student-7"] }
  ],
  students: [
    { id: "demo-student", name: "Aluno de demonstração", className: "Turma de demonstração" },
    { id: "student-2", name: "Aluno 02", className: "Turma de demonstração" },
    { id: "student-3", name: "Aluno 03", className: "Turma de demonstração" },
    { id: "student-4", name: "Aluno 04", className: "Turma B" },
    { id: "student-5", name: "Aluno 05", className: "Turma B" },
    { id: "student-6", name: "Aluno 06", className: "Turma C" },
    { id: "student-7", name: "Aluno 07", className: "Turma C" }
  ],
  appCatalog: [
    { id: "calculator", name: "Calculadora", category: "CÁLCULO", description: "Cálculos rápidos durante a experiência.", package_names: ["com.sec.android.app.popupcalculator", "com.google.android.calculator", "com.android.calculator2"], preferred_android: { package_name: "com.sec.android.app.popupcalculator", activity_name: ".Calculator" } },
    { id: "samsung-notes", name: "Samsung Notes", category: "NOTAS", description: "Registo local de observações e resultados.", package_names: ["com.samsung.android.app.notes"], preferred_android: { package_name: "com.samsung.android.app.notes", activity_name: ".memolist.MemoListActivity" } },
    { id: "chrome", name: "Google Chrome", category: "NAVEGAÇÃO", description: "Consulta de uma fonte indicada pelo professor.", package_names: ["com.android.chrome"], preferred_android: { package_name: "com.android.chrome" } },
    { id: "camera", name: "Câmara", category: "CAPTURA", description: "Registo visual de uma experiência, quando necessário.", package_names: ["com.sec.android.app.camera", "com.google.android.GoogleCamera"] },
    { id: "files", name: "Os meus ficheiros", category: "FICHEIROS", description: "Acesso a materiais locais preparados pela escola.", package_names: ["com.sec.android.app.myfiles", "com.google.android.documentsui"] },
    { id: "classroom", name: "Google Classroom", category: "APRENDIZAGEM", description: "Materiais e instruções de uma turma.", package_names: ["com.google.android.apps.classroom"] },
    { id: "drive", name: "Google Drive", category: "APRENDIZAGEM", description: "Leitura de ficheiros partilhados para a aula.", package_names: ["com.google.android.apps.docs"] }
  ]
};

const globalStore = globalThis as typeof globalThis & { morphSchool?: SchoolConfig };

function clone<T>(value: T): T { return structuredClone(value); }

/** The in-memory store survives hot reloads and deploys, so a stored school may
 * predate a field added to the configuration. Fill those gaps from the defaults
 * instead of serving a half-shaped school to the panels. */
export function getSchool(): SchoolConfig {
  const defaults = clone(defaultSchool);
  globalStore.morphSchool = globalStore.morphSchool ? { ...defaults, ...globalStore.morphSchool } : defaults;
  if (!Array.isArray(globalStore.morphSchool.appCatalog)) globalStore.morphSchool.appCatalog = defaults.appCatalog;
  return clone(globalStore.morphSchool);
}

export function saveSchoolBubble(candidate: SchoolBubble): SchoolConfig {
  if (candidate.boundary.type !== "CIRCLE" || !Number.isFinite(candidate.boundary.center.latitude) || !Number.isFinite(candidate.boundary.center.longitude) || candidate.boundary.center.latitude < -90 || candidate.boundary.center.latitude > 90 || candidate.boundary.center.longitude < -180 || candidate.boundary.center.longitude > 180 || candidate.boundary.radius_meters < 5 || candidate.boundary.radius_meters > 2000) {
    throw new Error("A School Bubble precisa de um centro válido e de um raio entre 5 e 2000 metros.");
  }
  if (candidate.policy.max_accuracy_meters < 10 || candidate.policy.unknown_location_grace_seconds < 30) {
    throw new Error("A política de localização da School Bubble é inválida.");
  }
  const school = getSchool();
  globalStore.morphSchool = { ...school, bubble: clone(candidate) };
  return getSchool();
}

function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const packageNamePattern = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/;

export function addSchoolApp(candidate: SchoolApp): SchoolConfig {
  const id = slug(candidate.id || candidate.name);
  const name = candidate.name.trim();
  const category = candidate.category.trim() || "PERSONALIZADA";
  const packageNames = [...new Set(candidate.package_names.map((item) => item.trim()).filter(Boolean))];
  if (!id || !name || packageNames.length === 0 || packageNames.some((item) => !packageNamePattern.test(item))) {
    throw new Error("Indique um nome e pelo menos um package Android válido (por exemplo, com.android.chrome).");
  }
  if (candidate.preferred_android && !packageNames.includes(candidate.preferred_android.package_name)) {
    throw new Error("A aplicação Android preferida deve constar na lista de packages.");
  }
  const app: SchoolApp = {
    id,
    name,
    category,
    ...(candidate.description?.trim() ? { description: candidate.description.trim() } : {}),
    package_names: packageNames,
    ...(candidate.preferred_android ? { preferred_android: candidate.preferred_android } : {})
  };
  const school = getSchool();
  if (school.appCatalog.some((item) => item.id === id)) throw new Error("Já existe uma aplicação com este identificador no catálogo.");
  globalStore.morphSchool = { ...school, appCatalog: [...school.appCatalog, app] };
  return getSchool();
}

export function attachSchoolBubble(capsule: LearningCapsule): LearningCapsule {
  const school = getSchool();
  const catalog = new Map(school.appCatalog.map((app) => [app.id, app]));
  const phases = withApprovedApps(capsule).phases.map((phase) => ({
    ...phase,
    allowed_apps: phase.allowed_apps.map((selected) => {
      const approved = catalog.get(selected.id);
      if (!approved) throw new Error(`A aplicação ${selected.name} não pertence ao catálogo desta escola.`);
      return approved;
    })
  }));
  return { ...capsule, phases, school_bubble: school.bubble };
}
