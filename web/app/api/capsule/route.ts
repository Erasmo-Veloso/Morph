import { NextResponse } from "next/server";
import type { LearningCapsule } from "@/lib/capsule";
import { parseLessonCapsule } from "../../../../contracts/src/index";
import { saveCapsule } from "@/lib/session-store";
import { publishCapsule } from "@/lib/runtime-bridge";
import { attachSchoolBubble } from "@/lib/school-store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { capsule?: LearningCapsule };

  if (!body.capsule) {
    return NextResponse.json({ error: "Learning Capsule is required." }, { status: 400 });
  }

  try {
    parseLessonCapsule(body.capsule);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Learning Capsule inválida." }, { status: 400 });
  }

  try {
    const capsule = attachSchoolBubble(body.capsule);
    await publishCapsule(capsule);
    return NextResponse.json({ capsule: saveCapsule(capsule) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Runtime bridge unavailable." }, { status: 503 });
  }
}
