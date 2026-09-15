import { NextResponse } from "next/server";
import { setOfflineMode, syncQueuedEvents } from "@/lib/session-store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { mode?: "offline" | "sync" };
  const session = body.mode === "offline" ? setOfflineMode() : syncQueuedEvents();

  return NextResponse.json({ session });
}
