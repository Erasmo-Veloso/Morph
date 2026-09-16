# Morph visual QA

## Source visual truth

- Desktop create state: `/tmp/codex-clipboard-ecbb2c70-0faa-46db-ba73-4e31052c2c1c.png` — 1448 × 1086 px.
- Desktop configure state: `/tmp/codex-clipboard-5d00e24f-2782-456a-8b1c-9d314af86d18.png` — 1448 × 1086 px.
- Desktop live state: `/tmp/codex-clipboard-479736aa-8cc7-4d29-9260-a4c765a1d300.png` — 1448 × 1086 px.
- Mobile runtime references: `/tmp/codex-clipboard-e9caf551-0125-467b-8325-415c04842383.png`, `/tmp/codex-clipboard-980e90d7-5402-404b-9923-fbf27241ffcd.png`, `/tmp/codex-clipboard-7c33fd64-2217-4e11-99cb-747790eff1a8.png`, `/tmp/codex-clipboard-b169ad38-035d-489a-baaf-d042715703c1.png`, `/tmp/codex-clipboard-3eee7ec5-6e73-4acd-9a57-67c5f475fe40.png`, `/tmp/codex-clipboard-0257e3b4-9fad-4887-b9e8-b52ed17554d8.png` — 941 × 1672 px each.

## Implementation evidence

- Create state: `/tmp/morph-teacher-reference-final.png` — 1440 × 1100 px, Chrome headless, CSS viewport 1440 × 1100, device scale factor 1.
- Create state (latest): `/tmp/morph-teacher-create-v2.png` — 1448 × 1086 px, Chrome headless, CSS viewport 1448 × 1086, device scale factor 1.
- Live state: `/tmp/morph-teacher-live-rendered.png` — 1440 × 1100 px, Chrome headless, CSS viewport 1440 × 1100, device scale factor 1.
- Live state (latest): `/tmp/morph-teacher-live-rich-v3.png` — 1448 × 1086 px, Chrome headless, CSS viewport 1448 × 1086, device scale factor 1.
- School state: `/tmp/morph-school-reference-final.png` — 1440 × 1100 px, Chrome headless, CSS viewport 1440 × 1100, device scale factor 1.
- Android shell/idle state: `/tmp/morph-android-chrome-final-2.png` — 1080 × 2400 px, Android emulator `emulator-5554`, post-splash capture.
- Android Compreender state: `/tmp/morph-android-understand-final-2.png` — 1080 × 2400 px, live bridge session, post-splash capture.
- Android Medir/Analisar/Reflectir states: `/tmp/morph-android-measure-latest.png`, `/tmp/morph-android-analyse-latest.png`, `/tmp/morph-android-reflect-latest.png` — 1080 × 2400 px, live bridge phase transitions.
- Android Intervalo state: `/tmp/morph-android-break-latest.png` — 1080 × 2400 px, live bridge end-session transition.
- Density normalization: screenshots were compared at their native pixel dimensions; no device frame was used for the desktop comparison. Android captures were taken at the emulator's native 1080 × 2400 px surface and compared with the 941 × 1672 px mobile references by layout hierarchy and responsive density, not as a pixel-for-pixel desktop match.

## State and interactions tested

- `/teacher` create state with editable lesson intent and working “Compilar a aula” action.
- `/teacher` live state after starting the bridge session; Android reported online and the live phase view was restored after reload.
- `/teacher` live state now exposes the reference hierarchy: Capsule title/meta, four-phase rail, active-stage instructions, Android preview, class roster and Sentinel events.
- `/school` shell and School Bubble configuration rendered without layout regressions.
- Teacher navigation, primary action styles, responsive sidebar collapse and mobile bottom navigation were checked.
- Android was rebuilt, installed and exercised against the live bridge through `UNDERSTAND → MEASURE → ANALYSE → REFLECT → FINISHED`; the real sensor card, phase rail, school context, logo, profile/bell chrome and bottom navigation rendered after the splash.

## Findings

- [P3] The supplied mock includes handwritten decorative illustration marks that are not present in the current asset set. Existing Morph media and the official Morph logo were retained instead of fabricating replacement artwork.
- [P3] The live Teacher Studio is intentionally denser and more operational than the supplied marketing-like live mock because it exposes the actual phase, Android runtime and Sentinel state required by the hackathon demo.
- [P3] The Android runtime now matches the supplied information hierarchy and interaction surfaces. The supplied editorial illustrations are not present in the repository asset set, so the implementation uses the existing Morph mark, native icons and data-driven cards rather than embedding screenshots or fabricating brand artwork.

## Required fidelity surfaces

- Fonts and typography: large dark-indigo editorial headings, compact uppercase labels, readable body copy and strong numeric hierarchy are implemented with the existing system font stack and updated weights/letter spacing.
- Spacing and layout rhythm: shared 220 px desktop sidebar, 76 px topbar, 14 px surfaces, consistent card padding and responsive collapse rules are implemented as shared shell tokens.
- Colors and visual tokens: neutral light-blue canvas, white surfaces, indigo text, blue primary actions and green status indicators match the supplied direction while preserving Morph branding.
- Image quality and asset fidelity: the existing official Morph logo, Android screenshots and project media are used; no logo redraw or placeholder logo was introduced.
- Copy and content: the demo remains Physics-specific only inside the demo Capsule; the shell and navigation use neutral educational language.

## Comparison history

1. Initial shell comparison found the intent screen vertically mis-composed because legacy grid areas overrode the new two-column layout.
2. Fixed by adding explicit final-precedence grid areas for heading, Capsule summary, composer and live preview.
3. Re-captured `/tmp/morph-teacher-latest.png` and `/tmp/morph-school-latest.png`; shared shell, logo treatment and profile affordance have no actionable P0/P1/P2 mismatch.
4. Rebuilt and installed Android, then captured the post-splash shell and every bridge-driven pedagogical phase; the mobile hierarchy, logo, navigation and phase surfaces have no actionable P0/P1/P2 mismatch.
5. Replaced stale web Android preview captures with post-splash runtime captures and added a dedicated Reflectir capture, keeping the web preview consistent with the installed APK.

## Final result

passed
