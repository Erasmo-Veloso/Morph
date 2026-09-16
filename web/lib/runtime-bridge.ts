import type { LearningCapsule } from "./capsule";
import { loadEnvConfig } from "@next/env";
import path from "node:path";

loadEnvConfig(path.resolve(process.cwd(), ".."));

export type RuntimeCommand = "start" | "next" | "end" | "context:outside" | "context:unverified" | "context:verified";

export type RuntimeStatus = {
  session: {
    type: "session:state";
    capsuleId: string;
    running: boolean;
    phase: string;
    schoolContext?: "OUTSIDE_SCHOOL" | "SCHOOL_VERIFIED" | "SCHOOL_UNVERIFIED";
  };
  enrollment: {
    schoolId: string;
    classId: string;
    studentId: string;
    studentName: string;
    deviceId: string | null;
    deviceName: string | null;
    pairingCode: string;
    state: "PENDING" | "PAIRED";
  };
  devices: Array<{
    schoolId?: string;
    studentId: string;
    classId: string;
    deviceId?: string;
    enrollment?: "PENDING" | "PAIRED";
    phase?: string;
    connectivity: "ONLINE" | "LOCAL" | "ISOLATED";
    integrity: string;
    bubbleStatus?: "NOT_REQUIRED" | "CHECKING" | "INSIDE" | "OUTSIDE" | "UNKNOWN";
    schoolContext?: "OUTSIDE_SCHOOL" | "SCHOOL_VERIFIED" | "SCHOOL_UNVERIFIED";
    authority?: "PASSIVE" | "SCHOOL_IDLE" | "CAPSULE_ACTIVE" | "BREAK";
    bubbleName?: string;
    lastSeen: number;
    receivedAt: number;
  }>;
  events: Array<{
    id: string;
    type: string;
    phaseId: string;
    occurredAt: number;
    receivedAt: number;
    payload: string;
  }>;
};

const runtimeUrl = process.env.MORPH_RUNTIME_URL ?? "http://127.0.0.1:8787";

async function runtimeRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${runtimeUrl}${path}`, { ...init, cache: "no-store" });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Android runtime bridge failed (${response.status}): ${body}`);
  }
  return response.json() as Promise<T>;
}

export function publishCapsule(capsule: LearningCapsule) {
  return runtimeRequest<{ capsuleId: string }>("/bridge/capsule", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ capsule })
  });
}

export function sendRuntimeCommand(command: RuntimeCommand) {
  return runtimeRequest<RuntimeStatus["session"]>("/bridge/command", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ command })
  });
}

export function getRuntimeStatus() {
  return runtimeRequest<RuntimeStatus>("/bridge/status");
}
