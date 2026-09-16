import { TeacherDashboard } from "@/components/TeacherDashboard";
import { compilePedagogicalIntent } from "@/lib/capsule";

export default function TeacherPage() {
  const initial = compilePedagogicalIntent(
    "Ensinar movimento acelerado com uma explicação breve, uma experiência prática, análise de resultados e reflexão."
  );

  return <TeacherDashboard initialCapsule={initial.capsule} />;
}
