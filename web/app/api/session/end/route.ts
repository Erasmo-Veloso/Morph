import { NextResponse } from "next/server";
import { endSession } from "@/lib/session-store";

export async function POST() {
  return NextResponse.json({ session: endSession() });
}
