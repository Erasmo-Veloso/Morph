# Morph — Product

## Vision

Morph transforms a lesson plan into an executable program for the student's smartphone.

> **A aula programa o smartphone.**

Instead of defining only what students should learn or which application they should open, the lesson defines which digital capabilities are useful at each pedagogical stage.

---

## Problem

Smartphones are usually treated as a fixed category during class:

* allowed;
* restricted;
* blocked;
* monitored.

This does not reflect how a real lesson changes over time.

A lesson may require:

```text
explanation
→ measurement
→ analysis
→ collaboration
→ reflection
```

Each stage may require a different set of device capabilities.

---

## Solution

Morph introduces the concept of an executable `Learning Capsule`.

The teacher describes the pedagogical intention.

The system compiles it into a Capsule containing:

```text
objective
phases
capabilities
restrictions
learning assets
transitions
integrity policy
offline policy
validity
signature
```

The Capsule is then executed locally on the student's device.

---

## Core Differentiator

The fundamental unit is not the application.

It is the:

> **Pedagogical capability**

The same smartphone can become:

```text
Learning material
      ↓
Laboratory
      ↓
Data analyzer
      ↓
Reflection tool
```

depending on the current phase.

---

## Example

Teacher input:

> Teach accelerated motion in 45 minutes with a short explanation, a practical group experiment, result analysis and reflection.

Morph produces:

```text
UNDERSTAND
    ↓
MEASURE
    ↓
ANALYSE
    ↓
REFLECT
```

The device changes capabilities as the lesson progresses.

---

## Supporting Systems

### School Bubble

Defines the context in which school authority applies.

### Sentinel

Verifies relevant session/policy integrity.

### Local Runtime

Executes the Capsule on-device.

### Offline Queue

Stores events locally when connectivity is unavailable and synchronizes them later.

---

## Privacy Principle

Morph verifies whether the lesson policy remains intact.

It should not require access to:

* private messages;
* personal photographs;
* personal browsing history;
* screenshots;
* unrelated personal content.

The goal is policy integrity, not surveillance.
