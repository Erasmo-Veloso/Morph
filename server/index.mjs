import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.env.PORT ?? 8787);
const fixtureCapsule = JSON.parse(await readFile(join(root, process.env.MORPH_CAPSULE_FILE ?? "fixtures/physics-capsule.json"), "utf8"));
const stateFile = process.env.MORPH_STATE_FILE ?? join(root, ".morph-session-state.json");
const classId = process.env.MORPH_CLASS_ID ?? "10A-FISICA";
const persistedState = await readFile(stateFile, "utf8")
  .then((raw) => JSON.parse(raw))
  .catch(() => ({}));
function prepareCapsule(candidate) {
  const prepared = structuredClone(candidate);
  if (process.env.MORPH_EMULATOR_DEMO === "1") {
    const understand = prepared.phases.find((phase) => phase.id === "UNDERSTAND");
    if (understand && !understand.restrictions.includes("UNRELATED_BROWSER")) {
      understand.restrictions.push("UNRELATED_BROWSER");
    }
  }
  return prepared;
}
let capsule = prepareCapsule(persistedState.capsule?.version === 1 ? persistedState.capsule : fixtureCapsule);
const clients = new Set();
const deviceStatuses = new Map();
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
    capsule,
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
    phase: running ? currentPhase()?.id ?? "FINISHED" : "FINISHED"
  };
}

function startSession() {
  phaseIndex = 0;
  running = true;
  void persistSessionState();
  broadcast({ type: "session:started", capsuleId: capsule.id, phase: currentPhase() });
}

function advanceSession() {
  if (!running || phaseIndex >= capsule.phases.length - 1) return;
  phaseIndex += 1;
  void persistSessionState();
  broadcast({ type: "phase:changed", capsuleId: capsule.id, phase: currentPhase() });
}

function endSession() {
  if (!running) return;
  running = false;
  void persistSessionState();
  broadcast({ type: "session:ended", capsuleId: capsule.id });
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => { body += chunk; if (body.length > 1_000_000) reject(new Error("Request too large")); });
    request.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); } catch (error) { reject(error); }
    });
    request.on("error", reject);
  });
}

const server = createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }
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
  if (request.method === "GET" && request.url === "/bridge/status") {
    response.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    response.end(JSON.stringify({ session: stateMessage(), devices: [...deviceStatuses.values()], events: sentinelTimeline }));
    return;
  }
  if (request.method === "POST" && request.url === "/bridge/capsule") {
    try {
      const body = await readJson(request);
      if (body.capsule?.version !== 1 || !Array.isArray(body.capsule.phases) || body.capsule.phases.length === 0) {
        throw new Error("Invalid Learning Capsule");
      }
      capsule = prepareCapsule(body.capsule);
      phaseIndex = 0;
      running = false;
      await persistSessionState();
      broadcast({ type: "capsule:assigned", capsule });
      response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ capsuleId: capsule.id }));
    } catch (error) {
      response.writeHead(400, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: error.message }));
    }
    return;
  }
  if (request.method === "POST" && request.url === "/bridge/command") {
    try {
      const { command } = await readJson(request);
      if (command === "start") startSession();
      else if (command === "next") advanceSession();
      else if (command === "end") endSession();
      else throw new Error("Invalid teacher command");
      response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify(stateMessage()));
    } catch (error) {
      response.writeHead(400, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: error.message }));
    }
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

const websocket = new WebSocketServer({ server, path: "/realtime", verifyClient: () => true });
websocket.on("connection", (socket) => {
  clients.add(socket);
  socket.send(JSON.stringify({ type: "capsule:assigned", capsule }));
  socket.send(JSON.stringify(stateMessage()));
  socket.on("message", (raw) => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { return; }

    if (message.type === "teacher:start") {
      startSession();
      return;
    }
    if (message.type === "teacher:next" && running) {
      advanceSession();
      return;
    }
    if (message.type === "teacher:end" && running) {
      endSession();
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
      const status = { ...message, classId: message.classId ?? classId, receivedAt: Date.now() };
      deviceStatuses.set(status.studentId ?? "unknown", status);
      broadcast({ type: "device:status", status });
    }
  });
  socket.on("close", () => clients.delete(socket));
});

server.listen(port, () => console.log(`Morph teacher control: http://localhost:${port}`));
