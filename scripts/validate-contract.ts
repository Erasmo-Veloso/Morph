import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { parseLessonCapsule } from "../contracts/src/index.js";
import { planIntent } from "../contracts/src/planner.js";

const raw = await readFile(new URL("../fixtures/physics-capsule.json", import.meta.url), "utf8");
const capsule = parseLessonCapsule(JSON.parse(raw));

assert.deepEqual(capsule.phases.map(({ id }) => id), ["UNDERSTAND", "MEASURE", "ANALYSE", "REFLECT"]);
assert.ok(capsule.phases.find(({ id }) => id === "MEASURE")?.capabilities.includes("ACCELEROMETER"));
assert.deepEqual(capsule.integrity_policy.sentinel_events, [
  "RESTRICTED_ACCESS_ATTEMPT",
  "CONNECTIVITY_CHANGED",
  "SCHOOL_CONTEXT_LOST"
]);
assert.equal(capsule.school_bubble?.name, "Campus Horizonte");
assert.throws(() => parseLessonCapsule({ ...capsule, version: 99 }), /Unsupported capsule version/);
assert.throws(() => parseLessonCapsule({ ...capsule, phases: [{ ...capsule.phases[0], id: "BROKEN" }] }), /invalid id/);
assert.throws(() => parseLessonCapsule({ ...capsule, phases: [capsule.phases[0], capsule.phases[0]] }), /Phase types must be unique/);
assert.throws(() => parseLessonCapsule({ ...capsule, integrity_policy: { ...capsule.integrity_policy, sentinel_events: ["UNKNOWN_EVENT"] } }), /invalid event/);
assert.deepEqual(planIntent("explicação, experiência prática, analisar dados e reflexão"), ["UNDERSTAND", "MEASURE", "ANALYSE", "REFLECT"]);
assert.deepEqual(planIntent("texto sem intenção reconhecível"), ["UNDERSTAND"]);
console.log("TypeScript contract parser: PASS");
console.log("Deterministic planner fallback: PASS");
