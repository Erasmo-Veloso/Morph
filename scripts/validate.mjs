import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const capsule = JSON.parse(await readFile(new URL("../fixtures/physics-capsule.json", import.meta.url), "utf8"));

function parseLessonCapsule(input) {
  assert.equal(input.version, 1, "unsupported capsule version");
  assert.ok(input.id && input.issuedAt && input.durationMs > 0, "metadata is invalid");
  assert.ok(input.lesson?.subject && input.lesson?.topic, "lesson is invalid");
  assert.ok(Array.isArray(input.phases) && input.phases.length > 0, "phases are required");
  const types = new Set(input.phases.map((phase) => phase.type));
  assert.equal(types.size, input.phases.length, "phase types must be unique");
  for (const phase of input.phases) {
    assert.ok(["UNDERSTAND", "MEASURE", "ANALYSE", "REFLECT"].includes(phase.type), `invalid phase ${phase.type}`);
    assert.ok(phase.durationMinutes > 0, `${phase.type} duration is invalid`);
    assert.ok(Array.isArray(phase.capabilities), `${phase.type} capabilities are invalid`);
    assert.ok(Array.isArray(phase.restrictions?.packages), `${phase.type} restrictions are invalid`);
  }
  return input;
}

const result = parseLessonCapsule(capsule);
assert.deepEqual(result.phases.map(({ type }) => type), ["UNDERSTAND", "MEASURE", "ANALYSE", "REFLECT"]);
assert.ok(result.phases.find(({ type }) => type === "MEASURE").capabilities.includes("ACCELEROMETER"));
assert.throws(() => parseLessonCapsule({ ...capsule, version: 99 }), /unsupported capsule version/);
assert.throws(() => parseLessonCapsule({ ...capsule, phases: [{ ...capsule.phases[0], type: "BROKEN" }] }), /invalid phase/);
console.log("Capsule validation: PASS");
console.log(`Fixture: ${result.id}`);
console.log(`Flow: ${result.phases.map(({ type }) => type).join(" -> ")}`);

