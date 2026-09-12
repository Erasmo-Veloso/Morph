import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.env.PORT ?? 8787);
const capsule = JSON.parse(await readFile(join(root, process.env.MORPH_CAPSULE_FILE ?? "fixtures/physics-capsule.json"), "utf8"));
const stateFile = process.env.MORPH_STATE_FILE ?? join(root, ".morph-session-state.json");
if (process.env.MORPH_EMULATOR_DEMO === "1") {
  for (const phase of capsule.phases) {
    if (!phase.restrictions.packages.includes("com.android.chrome")) phase.restrictions.packages.push("com.android.chrome");
  }
}
const clients = new Set();
const deviceStatuses = new Map();
const persistedState = await readFile(stateFile, "utf8")
  .then((raw) => JSON.parse(raw))
  .catch(() => ({}));
const acknowledgedEventIds = new Set(
  Array.isArray(persistedState.acknowledgedEventIds) ? persistedState.acknowledgedEventIds : []
);
let phaseIndex = Number.isInteger(persistedState.phaseIndex) ? persistedState.phaseIndex : 0;
let running = persistedState.capsuleId === capsule.id && persistedState.running === true;
const sentinelTimeline = Array.isArray(persistedState.sentinelTimeline) ? persistedState.sentinelTimeline : [];
let persistChain = Promise.resolve();

function persistSessionState() {
  const snapshot = JSON.stringify({
    capsuleId: capsule.id,
    phaseIndex,
    running,
    acknowledgedEventIds: [...acknowledgedEventIds],
    sentinelTimeline
  }) + "\n";
  persistChain = persistChain
    .then(() => writeFile(stateFile, snapshot))
    .catch((error) => console.error(`Could not persist session state: ${error.message}`));
  return persistChain;
}

function broadcast(message) {
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === 1) client.send(payload);
  }
}

function currentPhase() {
  return capsule.phases[phaseIndex];
}

function stateMessage() {
  return {
    type: "session:state",
    capsuleId: capsule.id,
    running,
    phase: running ? currentPhase()?.type ?? "FINISHED" : "FINISHED"
  };
}

const server = createServer(async (request, response) => {
  if (request.url?.split("?", 1)[0] === "/health") {
    response.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    response.end(JSON.stringify({
      status: "ok",
      acknowledgedEventCount: acknowledgedEventIds.size,
      sentinelTimelineCount: sentinelTimeline.length,
      connectedClients: clients.size
    }));
    return;
  }
  const requested = request.url === "/" ? "/index.html" : request.url;
  const safePath = normalize(requested).replace(/^\.\.(\/|\\|$)/, "");
  const filePath = join(root, "public", safePath);
  try {
    const body = await readFile(filePath);
    const contentType = extname(filePath) === ".html" ? "text/html; charset=utf-8" : "application/json";
    response.writeHead(200, { "content-type": contentType, "cache-control": "no-store" });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

const websocket = new WebSocketServer({ server, path: "/realtime" });
websocket.on("connection", (socket) => {
  clients.add(socket);
  socket.send(JSON.stringify({ type: "capsule:assigned", capsule }));
  socket.send(JSON.stringify(stateMessage()));
  socket.on("message", (raw) => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { return; }

    if (message.type === "teacher:start") {
      phaseIndex = 0;
      running = true;
      void persistSessionState();
      broadcast({ type: "session:started", capsuleId: capsule.id, phase: currentPhase() });
      return;
    }
    if (message.type === "teacher:next" && running) {
      if (phaseIndex >= capsule.phases.length - 1) return;
      phaseIndex += 1;
      void persistSessionState();
      broadcast({ type: "phase:changed", capsuleId: capsule.id, phase: currentPhase() });
      return;
    }
    if (message.type === "teacher:end" && running) {
      running = false;
      void persistSessionState();
      broadcast({ type: "session:ended", capsuleId: capsule.id });
      return;
    }
    if (message.type === "sentinel:event") {
      const eventId = message.event?.id;
      if (eventId && !acknowledgedEventIds.has(eventId)) {
        acknowledgedEventIds.add(eventId);
        sentinelTimeline.push({ ...message.event, receivedAt: Date.now() });
        void persistSessionState();
        console.log(JSON.stringify({ received: "sentinel:event", eventId }));
      }
      socket.send(JSON.stringify({ type: "session:ack", eventId }));
      return;
    }
    if (message.type === "device:status") {
      const status = { ...message, classId: message.classId ?? capsule.lesson.classId, receivedAt: Date.now() };
      deviceStatuses.set(status.studentId ?? "unknown", status);
      broadcast({ type: "device:status", status });
    }
  });
  socket.on("close", () => clients.delete(socket));
});

server.listen(port, () => console.log(`Morph teacher control: http://localhost:${port}`));
