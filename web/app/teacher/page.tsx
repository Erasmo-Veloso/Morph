import { TeacherDashboard } from "@/components/TeacherDashboard";
import { compilePedagogicalIntent } from "@/lib/capsule";

export default function TeacherPage() {
  const initial = compilePedagogicalIntent(
    "Teach accelerated motion with a short explanation, a practical experiment, analysis of results and reflection."
  );

  return <TeacherDashboard initialCapsule={initial.capsule} />;
}
