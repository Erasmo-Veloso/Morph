# Morph — MVP Scope

## Goal

Build a vertical slice capable of demonstrating the core Morph concept in under two minutes.

The MVP is not a complete school-management platform.

---

## Must Have

### 1. Compile

Teacher enters a lesson description.

System generates a valid `LearningCapsule`.

---

### 2. Preview

Teacher can inspect the generated lesson phases and capabilities.

---

### 3. Start

Teacher starts a lesson session.

The Capsule is delivered to the Android runtime.

---

### 4. Morph

The Android device changes according to the active phase.

Required phases:

```text
UNDERSTAND
MEASURE
ANALYSE
REFLECT
```

---

### 5. Realtime

Teacher presses:

```text
NEXT
```

Android changes phase immediately.

---

### 6. MEASURE

The Android device uses a real accelerometer and displays collected data/graph.

---

### 7. Restriction

A defined restricted capability produces a visible shield/block state.

---

### 8. Sentinel

A relevant integrity event appears in the teacher dashboard.

---

### 9. Offline

Disable Internet.

The active Capsule continues executing locally.

Events are stored locally.

---

### 10. Synchronization

Restore Internet.

Queued events synchronize with the backend.

---

### 11. End

Teacher ends the session.

The Android runtime reaches the final state.

---

## Explicitly Out of Scope

Unless required for the demo, do not implement:

* full school administration;
* grades;
* attendance;
* messaging;
* social features;
* complete LMS functionality;
* complex analytics;
* production-grade multi-tenant infrastructure;
* large-scale device management;
* extensive surveillance;
* advanced AI personalization;
* complex authentication flows.

---

## Success Criteria

The MVP is successful when the team can execute:

```text
Teacher writes lesson
        ↓
Compile
        ↓
Capsule generated
        ↓
Preview
        ↓
Start
        ↓
Android = UNDERSTAND
        ↓
Next
        ↓
Android = MEASURE
        ↓
Real sensor
        ↓
Next
        ↓
Android = ANALYSE
        ↓
Internet OFF
        ↓
Capsule continues
        ↓
Integrity event
        ↓
Internet ON
        ↓
Events synchronize
        ↓
Reflect
        ↓
End
```

No code or JSON should need to be manually edited during the demonstration.
