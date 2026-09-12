import { NextResponse } from "next/server";
import { compilePedagogicalIntent } from "@/lib/capsule";
import { saveCapsule } from "@/lib/session-store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { intent?: string };
  const result = compilePedagogicalIntent(body.intent ?? "");
  saveCapsule(result.capsule);

  return NextResponse.json(result);
}
