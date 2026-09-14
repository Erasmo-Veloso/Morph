import type { LearningCapsule } from "./capsule";

export type RuntimeCommand = "start" | "next" | "end";

export type RuntimeStatus = {
  session: {
    type: "session:state";
    capsuleId: string;
    running: boolean;
    phase: string;
  };
  devices: Array<{
    studentId: string;
    classId: string;
    phase?: string;
    connectivity: "ONLINE" | "LOCAL" | "ISOLATED";
    integrity: string;
    bubbleStatus?: "NOT_REQUIRED" | "CHECKING" | "INSIDE" | "OUTSIDE" | "UNKNOWN";
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
