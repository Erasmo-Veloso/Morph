# MORPH — Final gap analysis

Audited on 15 September 2026 against the final HACKTUDO flow. Status labels
describe evidence in this repository, not an assumption about a physical device
or a hosted environment.

## IMPLEMENTED

- **Capsule contract and fixture.** `contracts/` defines the versioned Capsule
  model, its phases, capabilities, restrictions, allowlisted applications and
  School Bubble metadata. `fixtures/physics-capsule.json` provides the
  deterministic *Movimento Acelerado* path: UNDERSTAND, MEASURE, ANALYSE and
  REFLECT.
- **Teacher-to-device runtime.** The Node bridge in `server/index.mjs`, the
  Next.js teacher routes in `web/app/api/`, and Android `SessionClient` exchange
  capsules, phase commands, device status and Sentinel acknowledgements.
- **Phase authority and cleanup.** Android `PhaseEngine` activates only the
  active phase capabilities, persists the runtime, clears capabilities at the
  end and continues an already active capsule while disconnected.
- **Contextual Shield and privacy-limited Sentinel.**
  `PolicyAccessibilityService` detects applications outside the active
  allowlist; `ShieldActivity` returns the learner to Morph. The event is first
  stored in Room and marked synced only after server acknowledgement. The event
  payload does not collect application content, messages, contacts, images or
  screenshots. The bridge validates the event envelope and canonical event type
  before acknowledging it.
- **MEASURE.** The Android runtime uses `SensorManager` with
  `TYPE_ACCELEROMETER`, shows its magnitude in a live chart and releases the
  listener outside the measurement phase.
- **Teacher experience.** `web/components/TeacherDashboard.tsx` has capsule
  creation, phase orchestration, a compact device preview and recent runtime
  evidence. The live view now exposes class size, learner/device association,
  connectivity, context and Sentinel. `web/components/SchoolDashboard.tsx` has
  School Bubble, allowlisted applications and the pairing state.
- **Enrollment and authority model.** The bridge owns one deterministic pairing
  code for the demo; `DeviceEnrollmentStore` persists the local device identity.
  Android models enrollment, school context, authority, Capsule stage,
  connectivity and integrity separately. The teacher sees the resulting
  association through `/bridge/status`.
- **Analysis, reflection and autonomy.** Android Analyse renders local sensor
  samples with mean, peak and deterministic insight; Reflect stores the answer
  under the Capsule ID. Ending a lesson enters an explicit Break with policy
  already cleared, followed by `FINISHED`. Outside-school has its own passive
  screen.
- **Emergency boundary.** The Accessibility policy always excludes Android
  system UI and known phone/dialer packages, so emergency calling is outside
  the Capsule policy. OEM-specific emergency surfaces still require hardware
  validation.
- **Presentation reset.** `npm run demo:reset` restores fixture, session,
  association, context and Sentinel timeline without manual data edits.
- **Golden bridge rehearsal.** `npm run demo:smoke` executes the deterministic
  pairing, Capsule, four phases, unverified-context recovery and end flow three
  times against an isolated temporary bridge state.
- **Offline protocol.** `ConnectivityMonitor` represents ONLINE, LOCAL and
  ISOLATED; Room-first events are retried after reconnect and server event IDs
  are idempotent.
- **Build evidence.** On this checkout, `npm test`, web typecheck/build,
  `./android/gradlew -p android test` and Android debug APK assembly have
  passed. The debug APK is produced at
  `android/app/build/outputs/apk/debug/app-debug.apk`.
- **Emulator E2E evidence.** The current APK was paired through the live bridge
  on `emulator-5554`, then exercised through Understand, Shield interception of
  Chrome, Measure with virtual `TYPE_ACCELEROMETER` input, Analyse, Reflect
  persistence, Break and Outside School. The rendered captures are retained in
  `docs/screenshots/final/` with an emulator-only label.

## PARTIAL

- **School Context.** The MVP combines enrollment with the local bridge and
  supports verified, unverified and outside transitions. The School Bubble is
  still a pitch adapter: it does not combine timetable, known-network and
  approximate location signals.
- **Unverified context.** `SCHOOL_CONTEXT_LOST` is persisted and the active
  Capsule continues temporarily. The Android runtime now applies the Bubble
  grace period and ends into policy-free Break when that local TTL expires.
  This remains a local safety rule, not a production attendance assertion.
- **Demo evidence.** Reset and runbook are deterministic. Rendered web
  association and Capsule-creation captures, current APK emulator-flow
  captures, and a labelled emulator fallback video exist. A physical-device
  capture does not yet exist.
- **Evidence boundary.** The runtime has been proven on an Android emulator,
  including Shield, Sentinel, phase transition, virtual sensor input, isolation
  and reconnect. That is not physical-device proof.

## MISSING

- A production-grade association authority (authentication, pairing-code
  rotation and persistence outside one local runtime).
- A real multi-signal School Context Engine beyond the current enrolled-device
  and local-runtime pitch signals.
- End-to-end Android tests for the UI-level pairing, reflection persistence and
  physical outside-school transition.
- A physical-device video recorded from the current APK.

## BLOCKER

- **Physical Android validation.** No physical enrolled handset is currently
  connected. A person with an Android device must install the debug APK, enable
  Morph accessibility access and run the final flow to mark real movement,
  Shield interception and cleanup as PROVEN. This does not block implementing
  or validating the remaining local flow.

## NICE TO HAVE

- Cryptographic Capsule signatures and tamper evidence.
- A real approximate geofence plus local-network/timetable signal adapters.
- Release signing, AAB distribution and a deployed WSS runtime.
- A short prerecorded golden-demo video after physical-device validation.
