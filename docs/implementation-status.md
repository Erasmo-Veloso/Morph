# Implementation status

Updated: 2026-09-12

## PROVEN

- `fixtures/physics-capsule.json` passes the local runtime validation script.
- Valid and invalid capsule cases are checked by `npm run validate`.
- The real TypeScript contract parser runs in `npm run validate` with strict
  compiler settings.
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
- `npm run validate` includes an isolated realtime smoke test covering Capsule
  assignment, `UNDERSTAND`, `MEASURE`, idempotent duplicate Sentinel ACK and
  `FINISHED`.
- Teacher control server and browser controls are implemented with a WebSocket
  protocol: assignment, start, next, end and Sentinel acknowledgement.
- Server-side duplicate Sentinel deliveries are ACKed idempotently; a local
  smoke test delivered the same event twice and processed it once.
- Android source contains explicit Capsule parsing, phase transitions, policy
  cleanup, Room-first Sentinel persistence and a real `Sensor.TYPE_ACCELEROMETER`
  integration.
- A real API 36 emulator named `morph-api36` booted, the debug APK installed,
  and the Android runtime completed the WebSocket flow through the visible UI.
- With `MORPH_EMULATOR_DEMO=1`, the installed Chrome package was added to the
  active Capsule policy. AccessibilityService detected Chrome, returned to
  Morph, opened `MORPH SHIELD`, and Room persisted one
  `RESTRICTED_ACCESS_ATTEMPT`.
- Teacher `start` and `next` produced visible `UNDERSTAND` and `MEASURE` UI
  states. `sensorservice` showed `AccelerometerEngine` registered; emulator
  sensor input changed the visible magnitude from `9.81` to `7.07` and then
  `12.00 m/s²`.
- Stopping the server left the active phase running while Room retained
  unsynced `CONNECTIVITY_CHANGED` rows. After restart, all pending rows were
  ACKed and the server logged each event id once.
- Teacher `end` produced visible `FINISHED`, `Sessão terminada · policy limpa`,
  no active Morph sensor registration, and no deletion of Sentinel rows.

## PARTIAL

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
