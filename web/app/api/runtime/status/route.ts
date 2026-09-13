import { NextResponse } from "next/server";
import { getRuntimeStatus } from "@/lib/runtime-bridge";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getRuntimeStatus());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Runtime bridge unavailable." }, { status: 503 });
  }
}
