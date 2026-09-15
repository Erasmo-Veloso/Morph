# Golden demo flow (under 2 minutes)

## Setup

1. Start the control server: `MORPH_EMULATOR_DEMO=1 npm start`.
2. Reset the deterministic fixture: `npm run demo:reset`.
   `npm run demo:smoke` runs the bridge rehearsal three times without touching
   the live demo state.
3. Build/install the Android app with `scripts/android-build.sh` and
   `scripts/android-install.sh`, or use Android Studio with an emulator/device.
4. For a physical device, build with the laptop's LAN address without editing
   source: `MORPH_SERVER_URL=ws://192.168.x.x:8787/realtime scripts/android-build.sh`.
   Keep the phone and laptop on the same network and allow port 8787 through
   the local firewall. The default `10.0.2.2` targets an emulator. If an
   emulator remains connected, set `ADB_SERIAL=<phone-serial>` for install,
   diagnostics and logcat.
5. On the Android device, enable Morph under Accessibility. This is an
   explicit OS permission required for package-level enforcement.

## Recording path

1. Open `http://localhost:3001/school`. Show Aluno demo, 10.º A, the device
   association and pairing code `MORPH-2026`.
2. Enter the code in Android. The Android screen becomes **Na escola. Sem
   restrições.**
3. Open `http://localhost:3001/teacher`, select the Physics Capsule and tap
   **Iniciar simulação**. Android receives the fixture and enters
   `UNDERSTAND`.
4. Open an installed restricted app. Morph returns to the lesson and shows
   `MORPH SHIELD`. The service writes `RESTRICTED_ACCESS_ATTEMPT` to Room.

For the local Android emulator, start the server with `MORPH_EMULATOR_DEMO=1`
to add the already-installed Chrome package to the Capsule's restricted list.
This is an explicit emulator profile. The canonical fixture also carries the
Campus Horizonte Bubble contract; the pitch APK reports it as `DEMO_READY` and
does not claim to evaluate GPS.
5. Tap **Next phase** on the teacher page. Android receives `phase:changed`,
   enters `MEASURE`, and starts the real accelerometer.
6. Move the device. The live magnitude and graph react to sensor events.
7. Advance to **Analisar** to show mean, peak and a deterministic local
   insight; advance to **Reflectir**, save the exit ticket and end.
8. Android enters **Intervalo**. `PolicyState` is already clear; tap **Usar
   normalmente** for `FINISHED`.
9. Use the **Rehearsal de contexto** controls in the live teacher view only for
   a rehearsal of the final boundary: **Saída da escola** clears all policy and
   shows the outside-school screen.

## Offline proof

Turn off external connectivity after the Capsule is received. The current
phase, sensor and local policy keep running. The Sentinel row remains
`synced = 0`; when the WebSocket reconnects, the server acknowledges the event
id and the row becomes synced. This queue is local-first, not a claim of full
mesh/P2P operation.
