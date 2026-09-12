# Demo flow (under 2 minutes)

## Setup

1. Start the control server: `npm install && npm start`.
2. Build/install the Android app with `scripts/android-build.sh` and
   `scripts/android-install.sh`, or use Android Studio with an emulator/device.
3. For a physical device, build with the laptop's LAN address without editing
   source: `MORPH_SERVER_URL=ws://192.168.x.x:8787/realtime scripts/android-build.sh`.
   Keep the phone and laptop on the same network and allow port 8787 through
   the local firewall. The default `10.0.2.2` targets an emulator. If an
   emulator remains connected, set `ADB_SERIAL=<phone-serial>` for install,
   diagnostics and logcat.
4. On the Android device, enable Morph under Accessibility. This is an
   explicit OS permission required for package-level enforcement.

## Recording path

1. Open `http://localhost:8787` in the teacher browser.
2. Tap **Start capsule**. Android receives the fixture and enters
   `UNDERSTAND`.
3. Open an installed restricted app. Morph returns to the lesson and shows
   `MORPH SHIELD`. The service writes `RESTRICTED_ACCESS_ATTEMPT` to Room.

For the local Android emulator, start the server with `MORPH_EMULATOR_DEMO=1`
to add the already-installed Chrome package to the Capsule's restricted list.
This is an explicit emulator profile; the default Capsule keeps the production
fixture's Instagram/TikTok package list.
4. Tap **Next phase** on the teacher page. Android receives `phase:changed`,
   enters `MEASURE`, and starts the real accelerometer.
5. Move the device. The live magnitude and graph react to sensor events.
6. Tap **End session**. Android clears `PolicyState` and stops the sensor.

## Offline proof

Turn off external connectivity after the Capsule is received. The current
phase, sensor and local policy keep running. The Sentinel row remains
`synced = 0`; when the WebSocket reconnects, the server acknowledges the event
id and the row becomes synced. This queue is local-first, not a claim of full
mesh/P2P operation.
