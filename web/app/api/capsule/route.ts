import { NextResponse } from "next/server";
import type { LearningCapsule } from "@/lib/capsule";
import { saveCapsule } from "@/lib/session-store";
import { publishCapsule } from "@/lib/runtime-bridge";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { capsule?: LearningCapsule };

  if (!body.capsule) {
    return NextResponse.json({ error: "Learning Capsule is required." }, { status: 400 });
  }

  try {
    await publishCapsule(body.capsule);
    return NextResponse.json({ capsule: saveCapsule(body.capsule) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Runtime bridge unavailable." }, { status: 503 });
  }
}
