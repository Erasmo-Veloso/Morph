import { NextResponse } from "next/server";
import type { SchoolBubble } from "@/lib/capsule";
import { getSchool, saveSchoolBubble } from "@/lib/school-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ school: getSchool() });
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { bubble?: SchoolBubble };
  if (!body.bubble) return NextResponse.json({ error: "School Bubble is required." }, { status: 400 });
  try {
    return NextResponse.json({ school: saveSchoolBubble(body.bubble) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid School Bubble." }, { status: 400 });
  }
}
