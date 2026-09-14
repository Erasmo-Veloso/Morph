# Morph UI design QA

## Reference and scope

- Visual contract: `docs/mvp-visual-spec.md`.
- Primary Morph reference: `docs/morph-white-editorial.png`.
- Competitive benchmark inspected live: `https://sabiaa.gabrielrichard.dev/#painel-professor`.
- Preview verified at `http://localhost:3001/` on 2026-09-14.

## Acceptance checks

| Check | Evidence | Result |
| --- | --- | --- |
| Brand lockup and editorial white system | Teacher Studio uses the supplied Morph lockup, navy type, quiet neutral canvas and blue interaction accent. | PASS |
| Capsule is visible before configuration | First view exposes `Criar Capsule`, pedagogical intent, four phases and the real Android learning screen. | PASS |
| Teacher flow is executable | `Compilar a aula` → phase capability configuration → `Confirmar Cápsula` → presentation view. | PASS |
| Device transformation is legible | Presentation view changes from `Compreender` to `Medir` with a different Android product screen and phase role. | PASS |
| Measure is concrete | The Android `measure.png` screen exposes the accelerometer and the teacher view labels the device as the measuring instrument. | PASS |
| Analyse is not a duplicate of Measure | Native Android `ActivePhaseState` now includes a local analysis summary; the teacher preview has a distinct analysis layout with graph and deterministic values. | PASS |
| Reflect closes the learning loop | Presentation view uses the finished Android screen and the `Refletir` phase copy. | PASS |
| No false live-device claim | When no handset is connected, the UI shows `SIMULAÇÃO`, `A AGUARDAR DEVICE` and `SEM DISPOSITIVO`. | PASS |
| Motion communicates state change | GSAP entrance transitions run on view/phase changes and are skipped when `prefers-reduced-motion` is enabled. | PASS |
| Primary engineering gates | Web typecheck/build, root validation and Android unit tests were executed during this pass. | PASS |

## Known boundary

The browser preview is verified against the local bridge and the Android source;
physical-handset rendering and accessibility-service behaviour still require a
connected Android device. The preview intentionally labels that state instead
of presenting it as hardware evidence.

## Final result: passed
