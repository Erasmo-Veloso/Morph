# Morph visual QA

## Source visual truth

- Desktop create state: `/tmp/codex-clipboard-ecbb2c70-0faa-46db-ba73-4e31052c2c1c.png` — 1448 × 1086 px.
- Desktop configure state: `/tmp/codex-clipboard-5d00e24f-2782-456a-8b1c-9d314af86d18.png` — 1448 × 1086 px.
- Desktop live state: `/tmp/codex-clipboard-479736aa-8cc7-4d29-9260-a4c765a1d300.png` — 1448 × 1086 px.
- Mobile runtime references: `/tmp/codex-clipboard-e9caf551-0125-467b-8325-415c04842383.png`, `/tmp/codex-clipboard-980e90d7-5402-404b-9923-fbf27241ffcd.png` — 941 × 1672 px each.

## Implementation evidence

- Create state: `/tmp/morph-teacher-reference-final.png` — 1440 × 1100 px, Chrome headless, CSS viewport 1440 × 1100, device scale factor 1.
- Live state: `/tmp/morph-teacher-live-rendered.png` — 1440 × 1100 px, Chrome headless, CSS viewport 1440 × 1100, device scale factor 1.
- School state: `/tmp/morph-school-reference-final.png` — 1440 × 1100 px, Chrome headless, CSS viewport 1440 × 1100, device scale factor 1.
- Density normalization: screenshots were compared at their native pixel dimensions; no device frame was used for the desktop comparison. Mobile references were used to preserve the existing Android content direction, not compared against the desktop shell.

## State and interactions tested

- `/teacher` create state with editable lesson intent and working “Compilar a aula” action.
- `/teacher` live state after starting the bridge session; Android reported online and the live phase view was restored after reload.
- `/school` shell and School Bubble configuration rendered without layout regressions.
- Teacher navigation, primary action styles, responsive sidebar collapse and mobile bottom navigation were checked.

## Findings

- [P3] The supplied mock includes handwritten decorative illustration marks that are not present in the current asset set. Existing Morph media and the official Morph logo were retained instead of fabricating replacement artwork.
- [P3] The live Teacher Studio is intentionally denser and more operational than the supplied marketing-like live mock because it exposes the actual phase, Android runtime and Sentinel state required by the hackathon demo.

## Required fidelity surfaces

- Fonts and typography: large dark-indigo editorial headings, compact uppercase labels, readable body copy and strong numeric hierarchy are implemented with the existing system font stack and updated weights/letter spacing.
- Spacing and layout rhythm: shared 220 px desktop sidebar, 76 px topbar, 14 px surfaces, consistent card padding and responsive collapse rules are implemented as shared shell tokens.
- Colors and visual tokens: neutral light-blue canvas, white surfaces, indigo text, blue primary actions and green status indicators match the supplied direction while preserving Morph branding.
- Image quality and asset fidelity: the existing official Morph logo, Android screenshots and project media are used; no logo redraw or placeholder logo was introduced.
- Copy and content: the demo remains Physics-specific only inside the demo Capsule; the shell and navigation use neutral educational language.

## Comparison history

1. Initial shell comparison found the intent screen vertically mis-composed because legacy grid areas overrode the new two-column layout.
2. Fixed by adding explicit final-precedence grid areas for heading, Capsule summary, composer and live preview.
3. Re-captured `/tmp/morph-teacher-reference-final.png`; the source and implementation now share the intended hierarchy and responsive shell with no actionable P0/P1/P2 mismatch.

## Final result

passed
