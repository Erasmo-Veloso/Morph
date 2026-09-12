import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import WebSocket from "ws";

const port = 8788;
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["server/index.mjs"], {
  env: { ...process.env, PORT: String(port) },
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

  socket.send(JSON.stringify({ type: "teacher:start" }));
  const started = await nextMessage((message) => message.type === "session:started");
  if (started.phase.type !== "UNDERSTAND") throw new Error("Expected UNDERSTAND start");

  socket.send(JSON.stringify({ type: "teacher:next" }));
  const changed = await nextMessage((message) => message.type === "phase:changed");
  if (changed.phase.type !== "MEASURE") throw new Error("Expected MEASURE transition");

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

  socket.send(JSON.stringify({ type: "teacher:end" }));
  await nextMessage((message) => message.type === "session:ended");
  console.log("Realtime teacher flow and idempotent Sentinel ACK: PASS");
} finally {
  socket?.close();
  child.kill("SIGTERM");
  await delay(100);
}
