import { NextResponse } from "next/server";
import { advanceSession } from "@/lib/session-store";

export async function POST() {
  return NextResponse.json({ session: advanceSession() });
}
