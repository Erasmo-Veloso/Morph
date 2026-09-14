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

## Implemented MVP runtime

```text
Pedagogical intent
        ↓
Capsule compiler / deterministic fixture
        ↓
LessonCapsule v1
        ↓
Android LessonRuntime + PhaseEngine
        ├── Capability state (Compose)
        ├── PolicyGuard (AccessibilityService)
        ├── SensorEngine (TYPE_ACCELEROMETER)
        └── Sentinel → Room → sync attempt
```

## Boundaries

- `contracts/` defines the versioned JSON shape and runtime validation used by
  the web/server side. `CapsuleRepository` delegates to `CapsuleParser` and
  enforces the required fields on Android before a capsule enters the runtime.
- `LessonRuntime` is the Android orchestration boundary; `PhaseEngine` owns the
  explicit lifecycle and `CapabilityManager` owns the currently active tools.
- `PhaseEngine` is the only owner of phase transitions. A transition clears
  the previous policy, applies the new restrictions and exposes a `StateFlow`.
- `AccelerometerEngine` registers `TYPE_ACCELEROMETER` only while the runtime
  is in `MEASURE`; lifecycle disposal unregisters the listener.
- `PolicyAccessibilityService` observes only the foreground package name. It
  does not read window content, capture the screen or access personal data.
- During an active lesson, `PolicyAccessibilityService` applies a small
  phase-level allowlist: Morph only in `UNDERSTAND`/`REFLECT`, Calculator and
  Samsung Notes in `MEASURE`, and Chrome in `ANALYSE`. A denied launch records
  a minimal Sentinel event and returns the learner to Morph. It is an
  accessibility-based MVP guard, not a replacement for Device Owner/kiosk mode.
- Sentinel persists before any network attempt. A reconnect marks an event
  synced only after the server acknowledges its id.
- `ConnectivityMonitor` combines local network validation with WebSocket
  reachability: `ONLINE` means validated Internet plus server, `LOCAL` means
  server reachable without validated Internet, and `ISOLATED` means server
  unreachable.
- `SchoolBubbleMonitor` currently provides `DEMO_READY`: the pitch APK accepts
  a Bubble immediately without requesting or reading GPS. The Capsule already
  carries the complete local-GPS contract; a foreground evaluator is the next
  post-pitch replacement for this adapter.

The demo server uses one WebSocket endpoint. `teacher:next` is broadcast as
`phase:changed`, which makes the Android state transition observable in real
time. Android also reports `device:status` with student, class, current phase,
connectivity, integrity and last-seen timestamp. The server keeps the latest
status in memory and persists the acknowledged Sentinel IDs and minimal event
timeline alongside the teacher session state.
