import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { parseLessonCapsule } from "../contracts/src/index.js";
import { planIntent } from "../contracts/src/planner.js";

const raw = await readFile(new URL("../fixtures/physics-capsule.json", import.meta.url), "utf8");
const capsule = parseLessonCapsule(JSON.parse(raw));

assert.deepEqual(capsule.phases.map(({ type }) => type), ["UNDERSTAND", "MEASURE", "ANALYSE", "REFLECT"]);
assert.ok(capsule.phases.find(({ type }) => type === "MEASURE")?.capabilities.includes("ACCELEROMETER"));
assert.throws(() => parseLessonCapsule({ ...capsule, version: 99 }), /Unsupported capsule version/);
assert.throws(() => parseLessonCapsule({ ...capsule, phases: [{ ...capsule.phases[0], type: "BROKEN" }] }), /invalid type/);
assert.deepEqual(planIntent("explicação, experiência prática, analisar dados e reflexão"), ["UNDERSTAND", "MEASURE", "ANALYSE", "REFLECT"]);
assert.deepEqual(planIntent("texto sem intenção reconhecível"), ["UNDERSTAND"]);
console.log("TypeScript contract parser: PASS");
console.log("Deterministic planner fallback: PASS");
