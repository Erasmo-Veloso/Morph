import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import WebSocket from "ws";

const port = 8789;
const baseUrl = `http://127.0.0.1:${port}`;
const stateDirectory = await mkdtemp(join(tmpdir(), "morph-session-"));
const stateFile = join(stateDirectory, "state.json");
let child;

const waitForHealth = async () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {}
    await delay(100);
  }
  throw new Error("Persistent-state server did not start");
};

const startServer = async () => {
  child = spawn(process.execPath, ["server/index.mjs"], {
    env: { ...process.env, PORT: String(port), MORPH_STATE_FILE: stateFile },
    stdio: ["ignore", "ignore", "pipe"]
  });
  await waitForHealth();
};

const stopServer = async () => {
  child?.kill("SIGTERM");
  await delay(150);
  child = undefined;
};

const connect = async () => {
  const socket = new WebSocket(`ws://127.0.0.1:${port}/realtime`);
  const messages = [];
  const waiters = [];
  const next = (predicate, timeoutMs = 3000) => new Promise((resolve, reject) => {
    const queuedIndex = messages.findIndex(predicate);
    if (queuedIndex >= 0) {
      resolve(messages.splice(queuedIndex, 1)[0]);
      return;
    }
    const waiter = { predicate, resolve, reject };
    waiter.timeout = setTimeout(() => reject(new Error("Timed out waiting for persistent-state message")), timeoutMs);
    waiters.push(waiter);
  });
  socket.on("message", (raw) => {
    const message = JSON.parse(raw.toString());
    const waiterIndex = waiters.findIndex(({ predicate }) => predicate(message));
    if (waiterIndex < 0) {
      messages.push(message);
      return;
    }
    const waiter = waiters.splice(waiterIndex, 1)[0];
    clearTimeout(waiter.timeout);
    waiter.resolve(message);
  });
  await new Promise((resolve, reject) => {
    socket.once("open", resolve);
    socket.once("error", reject);
  });
  return { socket, next };
};

try {
  await startServer();
  const first = await connect();
  await first.next((message) => message.type === "capsule:assigned");
  await first.next((message) => message.type === "session:state");
  first.socket.send(JSON.stringify({ type: "teacher:start" }));
  await first.next((message) => message.type === "session:started");
  first.socket.send(JSON.stringify({ type: "teacher:next" }));
  const changed = await first.next((message) => message.type === "phase:changed");
  if (changed.phase.type !== "MEASURE") throw new Error("Expected MEASURE before restart");
  await delay(200);
  first.socket.close();
  await stopServer();

  await startServer();
  const resumed = await connect();
  await resumed.next((message) => message.type === "capsule:assigned");
  const state = await resumed.next((message) => message.type === "session:state");
  if (!state.running || state.phase !== "MEASURE") throw new Error("Active phase was not restored after restart");
  resumed.socket.close();
  console.log("Teacher session persistence across server restart: PASS");
} finally {
  child?.kill("SIGTERM");
  await delay(150);
  await rm(stateDirectory, { recursive: true, force: true });
}
