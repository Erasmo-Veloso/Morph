import { NextResponse } from "next/server";
import { getRuntimeStatus } from "@/lib/runtime-bridge";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getRuntimeStatus());
  } catch (error) {
    return NextResponse.json({
      session: {
        type: "session:state",
        capsuleId: "",
        running: false,
        phase: "FINISHED"
      },
      devices: [],
      events: [],
      runtimeAvailable: false,
      error: error instanceof Error ? error.message : "Runtime bridge unavailable."
    });
  }
}
