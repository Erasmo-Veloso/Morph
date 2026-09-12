import { NextResponse } from "next/server";
import { endSession } from "@/lib/session-store";
import { sendRuntimeCommand } from "@/lib/runtime-bridge";

export async function POST() {
  try {
    await sendRuntimeCommand("end");
    return NextResponse.json({ session: endSession() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Runtime bridge unavailable." }, { status: 503 });
  }
}
