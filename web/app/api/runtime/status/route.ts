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
      enrollment: {
        schoolId: "school-horizonte",
        classId: "10A-FISICA",
        studentId: "demo-student",
        studentName: "Aluno demo",
        deviceId: null,
        deviceName: null,
        pairingCode: "MORPH-2026",
        state: "PENDING"
      },
      devices: [],
      events: [],
      runtimeAvailable: false,
      error: error instanceof Error ? error.message : "Runtime bridge unavailable."
    });
  }
}
