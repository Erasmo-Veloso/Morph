# Morph — Architecture

## System

```text
┌──────────────────────┐
│  Teacher Dashboard   │
│                      │
│ Compile              │
│ Preview              │
│ Start                │
│ Next                 │
│ End                  │
└──────────┬───────────┘
           │
           │ API / Realtime
           ▼
┌──────────────────────┐
│       Backend        │
│                      │
│ Pedagogical Compiler │
│ Session Manager      │
│ Capsule Management   │
│ Event Receiver       │
└──────────┬───────────┘
           │
           │ Learning Capsule
           ▼
┌──────────────────────┐
│   Android Runtime    │
│                      │
│ State Machine        │
│ Capability Manager   │
│ Sentinel             │
│ Local Storage        │
│ Offline Queue        │
└──────────────────────┘
```

---

## Components

### Teacher Dashboard

Responsible for:

* entering lesson intent;
* compiling;
* previewing the Capsule;
* starting a session;
* advancing phases;
* ending the session;
* viewing integrity events.

---

### Pedagogical Compiler

Input:

```text
Teacher's pedagogical intent
```

Output:

```text
LearningCapsule
```

The compiler should produce deterministic, schema-valid output.

---

### Backend

Responsible for:

* Capsule persistence;
* session management;
* teacher/device communication;
* realtime events;
* receiving queued device events;
* synchronization.

---

### Android Runtime

Responsible for:

* receiving the Capsule;
* validating it;
* executing the state machine;
* activating/deactivating capabilities;
* executing local assets;
* maintaining offline operation;
* producing local events.

---

### Sentinel

Responsible for detecting relevant integrity events.

It must not become a general-purpose surveillance system.

---

### Local Queue

When offline:

```text
Runtime Event
    ↓
Local Queue
```

When online:

```text
Local Queue
    ↓
Sync
    ↓
Backend
```

Events must not be lost solely because the network is unavailable.

---

## Realtime

Teacher commands should propagate to the student's runtime.

Example:

```text
Teacher clicks NEXT
        ↓
Backend / realtime layer
        ↓
Android receives phase change
        ↓
Runtime validates transition
        ↓
Current phase changes
        ↓
Capabilities change
```

The Android runtime should remain the final authority for whether a received transition is valid.

---

## Offline Mode

Internet availability must not determine whether the active Capsule can continue executing.

```text
ONLINE
policy = ACTIVE
assets = LOCAL
events = SYNC

OFFLINE
policy = ACTIVE
assets = LOCAL
events = QUEUE
```

---

## Architectural Principle

Build around the Capsule and Runtime rather than around individual UI screens.

The central flow is:

```text
Intent
→ Compile
→ Capsule
→ Execute
→ Observe
```
