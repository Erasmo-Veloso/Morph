# Morph — Coding Agent Context

## 1. Project

Morph is an educational runtime that transforms a teacher's pedagogical intent into an executable `Learning Capsule`.

> **A aula programa o smartphone.**

The system does not primarily exist to block applications. Its core idea is that the smartphone changes its available capabilities according to the pedagogical phase of the lesson.

The MVP is designed for Hacktudo 2026.

---

## 2. Read First

Before making architectural or product decisions, read:

1. `docs/product.md`
2. `docs/architecture.md`
3. `docs/capsule.md`
4. `docs/mvp.md`

For the presentation flow, read:

5. `docs/demo.md`

---

## 3. Core Flow

```text
Teacher Intent
      ↓
Pedagogical Compiler
      ↓
Learning Capsule
      ↓
Android Local Runtime
      ↓
Pedagogical Phase
      ↓
Device Capabilities
```

Teacher controls the running lesson:

```text
Compile
  ↓
Preview
  ↓
Start
  ↓
Next Phase
  ↓
Next Phase
  ↓
Next Phase
  ↓
End
```

---

## 4. Core Concepts

### Learning Capsule

A temporary, executable package containing:

* objective
* phases
* capabilities
* restrictions
* learning assets
* transitions
* integrity policy
* offline policy
* validity period
* signature

### Pedagogical Compiler

Transforms the teacher's natural-language lesson intent into a structured `Learning Capsule`.

### Local Runtime

Runs the Capsule on the Android device.

The Capsule must remain executable when Internet connectivity is unavailable.

### Sentinel

Integrity watchdog.

It records relevant policy/integrity events without inspecting the student's personal content.

### School Bubble

Defines where and when school authority may apply, using campus/session/time boundaries.

---

## 5. Important Product Principle

Do NOT reduce Morph to:

* an app blocker;
* screen-time software;
* classroom monitoring;
* a geofence;
* a surveillance system.

These are infrastructure or supporting mechanisms.

The central abstraction is:

> **Pedagogical capability**

The system determines which capabilities the smartphone should provide during each phase of the lesson.

---

## 6. MVP

The MVP demonstrates one lesson:

**Physics — accelerated motion**

Example phases:

```text
UNDERSTAND
    ↓
MEASURE
    ↓
ANALYSE
    ↓
REFLECT
```

The smartphone changes its capabilities between phases.

Example:

```text
UNDERSTAND
- learning material
- guided explanation

MEASURE
- accelerometer
- gyroscope
- camera
- chronometer

ANALYSE
- collected data
- graph
- calculator

REFLECT
- exit ticket
- personal conclusion
```

---

## 7. Offline-First

Offline operation is a requirement, not an optional enhancement.

When Internet is unavailable:

```text
policy = ACTIVE
assets = LOCAL CACHE
events = LOCAL QUEUE
```

When connectivity returns:

```text
LOCAL QUEUE
    ↓
SYNC
```

Do not design the core lesson execution around continuous Internet connectivity.

---

## 8. Integrity

The system should verify policy/session integrity rather than spy on the student.

Relevant events may include:

* restricted capability requested;
* permission changed;
* location becoming unavailable;
* network becoming unavailable;
* integrity/log alteration.

The system should avoid collecting personal content that is unnecessary for the lesson.

---

## 9. MVP Rule

Prefer a small vertical slice that is completely demonstrable over building a complete platform.

Do not add features unless they directly help demonstrate:

1. Compile
2. Morph
3. Offline
4. Integrity

---

## 10. Development Rule

When implementing a feature:

1. Check whether it is part of the MVP.
2. Check the existing architecture before introducing a new abstraction.
3. Preserve the `Learning Capsule` as the contract between the web/compiler side and Android runtime.
4. Prefer deterministic, explicit state transitions.
5. Keep offline behavior functional.
6. Do not introduce surveillance features.
7. Do not solve future scalability problems before the MVP works end-to-end.

The goal is a working vertical slice, not a production-scale platform.
