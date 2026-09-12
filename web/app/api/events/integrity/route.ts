import { NextResponse } from "next/server";
import { triggerIntegrityEvent } from "@/lib/session-store";

export async function POST() {
  return NextResponse.json({ session: triggerIntegrityEvent() });
}
