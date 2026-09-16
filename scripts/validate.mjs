import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const capsule = JSON.parse(await readFile(new URL("../fixtures/physics-capsule.json", import.meta.url), "utf8"));
const phases = ["UNDERSTAND", "MEASURE", "ANALYSE", "REFLECT"];

assert.equal(capsule.version, 1);
assert.ok(capsule.id && capsule.objective && capsule.valid_from && capsule.valid_until);
assert.deepEqual(capsule.phases.map(({ id }) => id), phases);
assert.equal(new Set(capsule.phases.map(({ id }) => id)).size, capsule.phases.length);
assert.ok(capsule.phases.find(({ id }) => id === "MEASURE").capabilities.includes("ACCELEROMETER"));
assert.equal(capsule.integrity_policy.enabled, true);
assert.equal(capsule.offline_policy.enabled, true);
assert.deepEqual(capsule.integrity_policy.sentinel_events, ["RESTRICTED_ACCESS_ATTEMPT", "CONNECTIVITY_CHANGED", "SCHOOL_CONTEXT_LOST"]);
assert.equal(capsule.school_bubble.name, "Campus de demonstração");
for (const phase of capsule.phases) {
  assert.ok(phase.duration > 0);
  assert.ok(Array.isArray(phase.capabilities));
  assert.ok(Array.isArray(phase.restrictions));
  assert.ok(Array.isArray(phase.learning_assets));
}

console.log("Canonical Capsule fixture: PASS");
console.log(`Fixture: ${capsule.id}`);
console.log(`Flow: ${capsule.phases.map(({ id }) => id).join(" -> ")}`);
