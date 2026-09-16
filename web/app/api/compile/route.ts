import { NextResponse } from "next/server";
import { planLesson } from "@/lib/capsule-planner";
import { saveCapsule } from "@/lib/session-store";
import { getSchool } from "@/lib/school-store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { intent?: unknown };
  if (typeof body.intent !== "string") {
    return NextResponse.json({ error: "A intenção pedagógica é obrigatória." }, { status: 400 });
  }
  if (!body.intent.trim()) {
    return NextResponse.json({ error: "Descreva a aula antes de pedir uma sugestão." }, { status: 400 });
  }
  if (body.intent.length > 1200) {
    return NextResponse.json({ error: "A intenção pedagógica não pode exceder 1200 caracteres." }, { status: 400 });
  }

  const result = await planLesson(body.intent, getSchool().appCatalog);
  saveCapsule(result.capsule);

  return NextResponse.json(result);
}
