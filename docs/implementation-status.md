# Implementation status

Updated: 2026-09-12

## PROVEN

- `fixtures/physics-capsule.json` passes the local runtime validation script.
- Valid and invalid capsule cases, including duplicate phase types, are checked
  by `npm run validate`.
- `npm run typecheck` runs the contracts through `tsc --noEmit` with strict
  compiler settings, and `npm run validate` invokes it before runtime checks.
- Android SDK is configured at `/home/helio/Android/Sdk`; platform 36,
  build-tools 36.0.0 and platform-tools are installed.
- `./android/gradlew -p android assembleDebug --no-daemon` completed with
  `BUILD SUCCESSFUL`.
- Build targets `compileSdk`/`targetSdk` 36 with Build Tools 36.0.0. AGP 8.7.3
  emits a non-blocking compatibility warning because it was tested through API
  35; compilation and tests still complete successfully.
- Debug APK generated at
  `android/app/build/outputs/apk/debug/app-debug.apk`.
- `testDebugUnitTest` passes the PhaseEngine transition/capability/cleanup test.
- `testDebugUnitTest` also covers the pure `ONLINE`/`LOCAL`/`ISOLATED`
  connectivity mapping.
- Deterministic planner fallback maps Portuguese pedagogical intent to phases;
  it is covered by `npm run validate`.
- `npm run validate` includes an isolated realtime smoke test covering the
  dashboard bridge (`/bridge/capsule`, `/bridge/command`, `/bridge/status`),
  invalid Capsule rejection, `UNDERSTAND`, `MEASURE`, device status,
  idempotent duplicate Sentinel ACK and `FINISHED`; it also checks that the
  public teacher page contains its control surface.
- `npm run validate` also restarts an isolated teacher server and verifies that
  an active `MEASURE` session and its Sentinel idempotency state are restored
  from persisted state.
- Teacher control server and browser controls are implemented with a WebSocket
  protocol: assignment, start, next, end and Sentinel acknowledgement.
- Server-side duplicate Sentinel deliveries are ACKed idempotently; a local
  smoke test delivered the same event twice and processed it once. The
  acknowledged IDs and minimal Sentinel timeline survive a server restart.
- Android source contains explicit Capsule parsing, phase transitions, policy
  cleanup, Room-first Sentinel persistence and a real `Sensor.TYPE_ACCELEROMETER`
  integration.
- A real API 36 emulator named `morph-api36` booted, the debug APK installed,
  and the Android runtime completed the WebSocket flow through the visible UI.
- The Erasmo Next.js dashboard now publishes the confirmed Capsule, relays
  start/next/end commands to the Android runtime, and displays polled Android
  connectivity, current phase and the latest Sentinel event.
- The MVP visual contract is documented in `docs/mvp-visual-spec.md`; Android
  now uses the supplied Morph mark, a white editorial runtime, a connected
  phase rail, consistent phase labels and non-punitive Shield messaging
  without changing the teacher dashboard base.
- The Creative Production model is preserved at
  `docs/morph-white-editorial.png`; the runtime implements its visual language
  with native Compose components and keeps the logo gradient limited to brand
  identity.
- The Android runtime keeps the `MEASURE` card and live chart accessible in
  landscape through vertical scrolling; the chart visibly changed from the
  emulator's `8.77` to `3.74 m/s²` after a SensorManager input change.
- `web` typecheck and `web` production build pass; Next.js is configured to use
  the stable TypeScript API path and an explicit Turbopack workspace root.
- With `MORPH_EMULATOR_DEMO=1`, the installed Chrome package is added to the
  `UNDERSTAND` policy even after a Capsule is published by the dashboard.
  AccessibilityService detected Chrome, kept `MORPH SHIELD` visible, and Room
  persisted `RESTRICTED_ACCESS_ATTEMPT` before its successful ACK.
- Teacher `start` and `next` through the Next.js API produced visible
  `UNDERSTAND` and `MEASURE` Android states. `sensorservice` showed
  `AccelerometerEngine` registered; emulator SensorManager input changed the
  visible magnitude from `9.80` to `8.77 m/s²`.
- Stopping the server left `MEASURE` and its sensor listener active while the
  runtime reported `ISOLATED` and Room retained the unsynced connectivity
  event. After restart, `MEASURE` returned `ONLINE`; all queued rows were ACKed
  and the server timeline contained 21 unique IDs for 21 events.
- Teacher `end` through the Next.js API produced visible `FINISHED`, `Sessão
  terminada · policy limpa`, no Morph connection among active sensorservice
  clients, and no deletion of Sentinel rows.

## PARTIAL

- `WAITING_FOR_DEVICE`: ADB reports only the API 36 emulator; no authorized
  physical Android handset is connected for the movement test.
- A physical handset and physical movement are not proven in this environment.
  The sensor graph proof uses the API 36 emulator's virtual SensorManager input
  (`adb emu sensor`), not a claim of human movement.
- The default fixture still lists Instagram/TikTok; those packages are absent
  from this emulator. Chrome enforcement is available only through the
  explicit emulator demo profile.
- Release signing, video capture and capsule cryptographic signatures remain
  outside this MVP slice.

## PLANNED

- Capsule signature verification (ECDSA P-256).
- Tamper-evident `previousHash` / `eventHash` chain.
- LLM/compiler integration beyond the deterministic planner and fixture.
- Real device/video evidence and release signing.
