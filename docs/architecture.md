# Morph architecture

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
- Sentinel persists before any network attempt. A reconnect marks an event
  synced only after the server acknowledges its id.
- `ConnectivityMonitor` combines local network validation with WebSocket
  reachability: `ONLINE` means validated Internet plus server, `LOCAL` means
  server reachable without validated Internet, and `ISOLATED` means server
  unreachable.

The demo server uses one WebSocket endpoint. `teacher:next` is broadcast as
`phase:changed`, which makes the Android state transition observable in real
time. Android also reports `device:status` with student, class, current phase,
connectivity, integrity and last-seen timestamp. The server keeps the latest
status in memory and persists the acknowledged Sentinel IDs and minimal event
timeline alongside the teacher session state.
