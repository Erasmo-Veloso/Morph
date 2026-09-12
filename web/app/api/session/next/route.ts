import { NextResponse } from "next/server";
import { advanceSession } from "@/lib/session-store";
import { sendRuntimeCommand } from "@/lib/runtime-bridge";

export async function POST() {
  try {
    await sendRuntimeCommand("next");
    return NextResponse.json({ session: advanceSession() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Runtime bridge unavailable." }, { status: 503 });
  }
}
