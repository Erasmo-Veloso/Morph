import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { setTimeout as delay } from "node:timers/promises";

const port = Number(process.env.MORPH_SMOKE_PORT ?? 8790);
const baseUrl = `http://127.0.0.1:${port}`;
const temporaryDirectory = await mkdtemp(join(tmpdir(), "morph-demo-smoke-"));
const stateFile = join(temporaryDirectory, "state.json");
const fixture = JSON.parse(await readFile("fixtures/physics-capsule.json", "utf8"));
const child = spawn(process.execPath, ["server/index.mjs"], {
  env: { ...process.env, PORT: String(port), MORPH_STATE_FILE: stateFile, MORPH_EMULATOR_DEMO: "1" },
  stdio: ["ignore", "ignore", "pipe"]
});

const post = async (path, body) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`${path}: ${payload.error ?? response.status}`);
  return payload;
};

const waitForHealth = async () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {}
    await delay(100);
  }
  throw new Error("Demo smoke server did not start");
};

try {
  await waitForHealth();
  for (let run = 1; run <= 3; run += 1) {
    const reset = await post("/bridge/reset");
    if (reset.enrollment.state !== "PENDING" || reset.session.phase !== "FINISHED") throw new Error(`run ${run}: reset`);

    const paired = await post("/bridge/enrollment", { action: "pair", code: "MORPH-2026", deviceId: `smoke-${run}`, deviceName: "Smoke Android" });
    if (paired.enrollment.state !== "PAIRED") throw new Error(`run ${run}: pairing`);

    const assigned = await post("/bridge/capsule", { capsule: fixture });
    if (assigned.capsuleId !== fixture.id) throw new Error(`run ${run}: Capsule`);

    await post("/bridge/command", { command: "context:outside" });
    let rejectedOutsideStart = false;
    try {
      await post("/bridge/command", { command: "start" });
    } catch (error) {
      rejectedOutsideStart = error instanceof Error && error.message.includes("contexto escolar verificado");
    }
    if (!rejectedOutsideStart) throw new Error(`run ${run}: outside start guard`);
    await post("/bridge/command", { command: "context:verified" });

    const start = await post("/bridge/command", { command: "start" });
    if (start.phase !== "UNDERSTAND") throw new Error(`run ${run}: UNDERSTAND`);
    for (const expectedPhase of ["MEASURE", "ANALYSE", "REFLECT"]) {
      const next = await post("/bridge/command", { command: "next" });
      if (next.phase !== expectedPhase) throw new Error(`run ${run}: ${expectedPhase}`);
    }

    const unverified = await post("/bridge/command", { command: "context:unverified" });
    if (unverified.schoolContext !== "SCHOOL_UNVERIFIED") throw new Error(`run ${run}: unverified context`);
    const verified = await post("/bridge/command", { command: "context:verified" });
    if (verified.schoolContext !== "SCHOOL_VERIFIED") throw new Error(`run ${run}: verified context`);
    const ended = await post("/bridge/command", { command: "end" });
    if (ended.phase !== "FINISHED") throw new Error(`run ${run}: end`);
    await post("/bridge/command", { command: "start" });
    const outside = await post("/bridge/command", { command: "context:outside" });
    if (outside.running || outside.phase !== "FINISHED" || outside.schoolContext !== "OUTSIDE_SCHOOL") {
      throw new Error(`run ${run}: active outside cleanup`);
    }
  }
  console.log("Golden bridge rehearsal (3 runs): PASS");
} finally {
  child.kill("SIGTERM");
  await delay(100);
  await rm(temporaryDirectory, { recursive: true, force: true });
}
