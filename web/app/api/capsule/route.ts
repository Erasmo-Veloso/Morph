import { NextResponse } from "next/server";
import type { LearningCapsule } from "@/lib/capsule";
import { saveCapsule } from "@/lib/session-store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { capsule?: LearningCapsule };

  if (!body.capsule) {
    return NextResponse.json({ error: "Learning Capsule is required." }, { status: 400 });
  }

  return NextResponse.json({ capsule: saveCapsule(body.capsule) });
}
