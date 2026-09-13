import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import WebSocket from "ws";

const port = 8788;
const baseUrl = `http://127.0.0.1:${port}`;
const temporaryDirectory = await mkdtemp(join(tmpdir(), "morph-realtime-"));
const stateFile = join(temporaryDirectory, "state.json");
const child = spawn(process.execPath, ["server/index.mjs"], {
  env: { ...process.env, PORT: String(port), MORPH_STATE_FILE: stateFile },
  stdio: ["ignore", "pipe", "pipe"]
});

const waitForHealth = async () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return response.json();
    } catch {}
    await delay(100);
  }
  throw new Error("Realtime server did not start");
};

const messageQueue = [];
const messageWaiters = [];
const nextMessage = (predicate, timeoutMs = 3000) => new Promise((resolve, reject) => {
  const queuedIndex = messageQueue.findIndex(predicate);
  if (queuedIndex >= 0) {
    resolve(messageQueue.splice(queuedIndex, 1)[0]);
    return;
  }
  const waiter = { predicate, resolve, reject };
  waiter.timeout = setTimeout(() => {
    const index = messageWaiters.indexOf(waiter);
    if (index >= 0) messageWaiters.splice(index, 1);
    reject(new Error("Timed out waiting for realtime message"));
  }, timeoutMs);
  messageWaiters.push(waiter);
});

let socket;
try {
  const initialHealth = await waitForHealth();
  const pageResponse = await fetch(baseUrl);
  const page = await pageResponse.text();
  if (!pageResponse.ok || !page.includes('id="start"') || !page.includes('id="capsule-form"') || !page.includes('id="summary-view"') || !page.includes('Teacher control')) {
    throw new Error("Public teacher page is not functional");
  }
  socket = new WebSocket(`ws://127.0.0.1:${port}/realtime`);
  socket.on("message", (raw) => {
    const message = JSON.parse(raw.toString());
    const waiterIndex = messageWaiters.findIndex(({ predicate }) => predicate(message));
    if (waiterIndex < 0) {
      messageQueue.push(message);
      return;
    }
    const waiter = messageWaiters.splice(waiterIndex, 1)[0];
    clearTimeout(waiter.timeout);
    waiter.resolve(message);
  });
  await new Promise((resolve, reject) => {
    socket.once("open", resolve);
    socket.once("error", reject);
  });
  await nextMessage((message) => message.type === "capsule:assigned");
  await nextMessage((message) => message.type === "session:state");

  const fixture = JSON.parse(await readFile("fixtures/physics-capsule.json", "utf8"));
  const capsuleResponse = await fetch(`${baseUrl}/bridge/capsule`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ capsule: fixture })
  });
  if (!capsuleResponse.ok || (await capsuleResponse.json()).capsuleId !== fixture.id) {
    throw new Error("Bridge did not accept the canonical Capsule");
  }
  await nextMessage((message) => message.type === "capsule:assigned" && message.capsule.id === fixture.id);

  const invalidCapsuleResponse = await fetch(`${baseUrl}/bridge/capsule`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ capsule: { version: 1, phases: [] } })
  });
  if (invalidCapsuleResponse.status !== 400) throw new Error("Bridge accepted an invalid Capsule");

  const startResponse = await fetch(`${baseUrl}/bridge/command`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ command: "start" })
  });
  if (!startResponse.ok) throw new Error("Bridge start command failed");
  const started = await nextMessage((message) => message.type === "session:started");
  if (started.phase.id !== "UNDERSTAND") throw new Error("Expected UNDERSTAND start");

  const nextResponse = await fetch(`${baseUrl}/bridge/command`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ command: "next" })
  });
  if (!nextResponse.ok) throw new Error("Bridge next command failed");
  const changed = await nextMessage((message) => message.type === "phase:changed");
  if (changed.phase.id !== "MEASURE") throw new Error("Expected MEASURE transition");

  socket.send(JSON.stringify({
    type: "device:status",
    studentId: "validate-student",
    phase: "MEASURE",
    connectivity: "LOCAL",
    integrity: "UNVERIFIED",
    lastSeen: Date.now()
  }));
  const deviceStatus = await nextMessage((message) => message.type === "device:status");
  if (deviceStatus.status.classId !== "10A-FISICA") throw new Error("Expected classId in device status");

  const eventId = randomUUID();
  const event = { id: eventId, studentId: "validate-student", capsuleId: changed.capsuleId, phaseId: changed.phase.id, type: "CONNECTIVITY_CHANGED", occurredAt: Date.now(), payload: "state=LOCAL" };
  const eventMessage = JSON.stringify({ type: "sentinel:event", event });
  socket.send(eventMessage);
  await nextMessage((message) => message.type === "session:ack" && message.eventId === eventId);
  socket.send(eventMessage);
  await nextMessage((message) => message.type === "session:ack" && message.eventId === eventId);

  const finalHealth = await (await fetch(`${baseUrl}/health`)).json();
  if (finalHealth.acknowledgedEventCount !== initialHealth.acknowledgedEventCount + 1) {
    throw new Error("Duplicate Sentinel event was not deduplicated");
  }

  const status = await (await fetch(`${baseUrl}/bridge/status`)).json();
  if (status.session.phase !== "MEASURE" || status.devices.length !== 1 || status.events.length !== 1) {
    throw new Error("Bridge status did not expose session, device, and Sentinel state");
  }

  const endResponse = await fetch(`${baseUrl}/bridge/command`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ command: "end" })
  });
  if (!endResponse.ok) throw new Error("Bridge end command failed");
  await nextMessage((message) => message.type === "session:ended");
  console.log("Realtime bridge, teacher flow, and idempotent Sentinel ACK: PASS");
} finally {
  socket?.close();
  child.kill("SIGTERM");
  await delay(100);
  await rm(temporaryDirectory, { recursive: true, force: true });
}
