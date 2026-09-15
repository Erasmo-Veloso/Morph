# Final screenshot manifest

The web captures in this folder are rendered from the current local web build.
The `android-emulator-*` captures were taken from the current debug APK on the
Android Emulator (`emulator-5554`) on 15 September 2026. They are runtime
evidence, not physical-device evidence. Do not rename or present them as
physical-device screenshots.

For a fresh run, execute `npm run demo:reset` before capturing:

- `web-school-association.png` — captured
- `web-capsule-create.png` — captured
- `web-capsule-configure.png` — captured
- `web-capsule-preview.png` — captured
- `web-live-session.png` — captured; active phase and device status
- `web-sentinel.png` — captured; restricted-access event
- `android-emulator-initial.png` — captured; unpaired entry state
- `android-emulator-school-idle.png` — captured; paired, at school, no policy
- `android-emulator-understand.png` — captured
- `android-emulator-shield.png` — captured; Chrome interception
- `android-emulator-measure.png` — captured; virtual accelerometer input
- `android-emulator-analyse.png` — captured; local analysis state
- `android-emulator-analyse-stats.png` — captured; local mean and peak
- `android-emulator-reflect.png` — captured
- `android-emulator-reflect-saved.png` — captured; persisted conclusion
- `android-emulator-break.png` — captured; policy-free pause
- `android-emulator-outside-school.png` — captured; passive outside-school state
- `android-emulator-unverified.png` — captured; temporary Capsule authority
- `android-emulator-golden-run.mp4` — captured; Analyse to Reflect to Break
- `android-emulator-finished.png` — captured; restrictions cleared

Use the current web screen and the current installed APK only. The existing
assets under `web/public/assets/android/` are presentation previews, not final
evidence for this folder.
