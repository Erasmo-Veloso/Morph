import { NextResponse } from "next/server";
import type { SchoolBubble } from "@/lib/capsule";
import { addSchoolApp, getSchool, saveSchoolBubble, type SchoolApp } from "@/lib/school-store";

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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { app?: SchoolApp };
  if (!body.app) return NextResponse.json({ error: "School app is required." }, { status: 400 });
  try {
    return NextResponse.json({ school: addSchoolApp(body.app) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid school app." }, { status: 400 });
  }
}
