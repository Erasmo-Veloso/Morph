# MORPH — presentation readiness

## What Morph is

Morph is an executable learning Capsule. The same smartphone becomes the tool
needed for the current learning phase, then returns to the learner when the
phase, lesson or school context ends.

## Five-minute narrative

1. **Problem and premise — 0:00–0:30.** A phone is not inherently a
   distraction; its purpose is undefined in class.
2. **Association and consent boundary — 0:30–1:00.** Show o Aluno de demonstração,
   a turma de demonstração,
   the Android device and the pairing code. State that being enrolled or at
   school does not itself activate restrictions.
3. **Teacher orchestration — 1:00–1:40.** Create/select *Movimento Acelerado*,
   inspect the four pedagogical phases and start.
4. **Metamorphosis — 1:40–3:30.** Show UNDERSTAND, a restricted-app attempt and
   Morph Shield/Sentinel; advance to MEASURE and move the physical device;
   advance to ANALYSE and REFLECT.
5. **Autonomy and resilience — 3:30–4:30.** Show LOCAL while the Capsule keeps
   running, end into BREAK, then show that outside school removes policy.
6. **Trust boundary — 4:30–5:00.** Explain local-first events, minimal data,
   no permanent school control and the MVP's signal/location limitation.

## Deterministic setup

From `/home/helio/HEr/Hackathon/Morph`:

```bash
MORPH_EMULATOR_DEMO=1 npm start
npm run demo:reset
cd web && npm run dev -- --port 3001
```

Open `http://localhost:3001/school`, associate Android with `MORPH-2026`, then
open `http://localhost:3001/teacher`. For a physical device, rebuild with a
reachable LAN or WSS bridge URL before installation:

```bash
MORPH_SERVER_URL=ws://<laptop-lan-ip>:8787/realtime scripts/android-build.sh
```

Run `npm run demo:reset` before every rehearsal. It restores the fixture,
phase, association, context and Sentinel timeline. It never needs an external
AI API or manual database edit.

Run `npm run demo:smoke` to rehearse the bridge path three times against an
isolated temporary state before recording.

## Proven now

- Capsule contract/parser, deterministic fixture and bridge persistence.
- Pairing endpoint and bridge status reconciliation.
- Teacher configuration and rendered school association panel.
- Android state-machine unit tests, debug APK assembly and real
  `TYPE_ACCELEROMETER` implementation.
- Current emulator E2E evidence: pairing, Shield interception, Sentinel,
  virtual sensor input, Analyse, persisted reflection, Break and Outside
  School. The labelled captures are under `docs/screenshots/final/`.

## Partial / required before stage

- **Physical Android rehearsal:** install the current APK; enable Accessibility;
  pair; verify real movement, Shield and cleanup. This is the only proof that
  must be performed on hardware.
- **Screenshots:** rendered local web and Android-emulator captures are in
  `docs/screenshots/final/`. A physical-device capture is still required for
  hardware proof.
- **Hosted runtime:** not required for the local pitch. A deployed WSS bridge
  and release-signed AAB are not yet validated.

## Backup hierarchy

1. Local web at port 3001 and bridge at port 8787.
2. Debug golden APK: `android/app/build/outputs/apk/debug/app-debug.apk`.
3. Fixture: `fixtures/physics-capsule.json`.
4. Final screenshots manifest: `docs/screenshots/final/README.md`.
5. `android-emulator-golden-run.mp4`: Analyse to Reflect to Break fallback,
   explicitly labelled emulator evidence. Record a physical run separately;
   never present the emulator video as physical proof.
