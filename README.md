# Morph

Executable Learning Capsule for HACKTUDO 2026: the teacher compiles a lesson
in the Next.js dashboard and the Android runtime changes capabilities as the
lesson advances.

The vertical slice is intentionally narrow: teacher start → Android
`UNDERSTAND` → restricted-package shield → teacher next → Android `MEASURE` →
real accelerometer graph → end-session cleanup.

## Teacher dashboard

```bash
cd web
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Android realtime bridge

```bash
npm install
npm run validate
npm start
```

Open `http://localhost:8787` for the teacher controls.

The local control server persists its current teacher phase in the ignored
`.morph-session-state.json` file so a realtime reconnect does not reset the
active Capsule.

## Android

```bash
scripts/android-build.sh
scripts/android-install.sh
scripts/android-demo-check.sh
```

For a physical device, set `MORPH_SERVER_URL` to the laptop LAN address before
the build. The default URL targets an Android emulator.

`android/local.properties` is machine-local and points to the configured SDK.

## Repository layout

- `contracts/`: versioned TypeScript contract and parser.
- `fixtures/`: deterministic physics Capsule used when compiler/backend is not
  available.
- `web/`: canonical teacher dashboard and pedagogical compiler.
- `server/` + `public/`: Android realtime bridge and diagnostic control.
- `android/`: Kotlin/Compose runtime, Room queue, sensor and Accessibility
  Shield.
- `docs/`: product, architecture, demo procedure and implementation status.

Android SDK and Gradle are configured and the debug APK builds successfully.
The Android vertical slice is verified on the `morph-api36` emulator; physical
handset movement and release signing remain pending. See
`docs/implementation-status.md`.
