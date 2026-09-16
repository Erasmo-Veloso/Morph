# Morph UI design QA

## Reference and scope

- Visual contract: `docs/mvp-visual-spec.md`.
- Primary Morph reference: `docs/morph-white-editorial.png`.
- Competitive benchmark inspected live: `https://sabiaa.gabrielrichard.dev/#painel-professor`.
- Preview verified at `http://localhost:3001/teacher` on 2026-09-16.

## Acceptance checks

| Check | Evidence | Result |
| --- | --- | --- |
| Brand lockup and editorial white system | Teacher Studio uses the supplied Morph lockup, navy type, quiet neutral canvas and blue interaction accent. | PASS |
| Capsule is visible before configuration | The selected reference-aligned Teacher Studio exposes `Criar a Cápsula`, pedagogical intent, four phases and the changing Android proof. | PASS |
| Teacher flow is executable | Browser interaction verified `Gerar Cápsula` → `Configurar a Cápsula` → `Confirmar Cápsula` → presentation view → `Iniciar simulação` → `AO VIVO`. | PASS |
| Device transformation is legible | Presentation view changes from `Compreender` to `Medir` with a different Android product screen and phase role. | PASS |
| Measure is concrete | The Android `measure.png` screen exposes the accelerometer and the teacher view labels the device as the measuring instrument. | PASS |
| Analyse is not a duplicate of Measure | Native Android `ActivePhaseState` now includes a local analysis summary; the teacher preview has a distinct analysis layout with graph and deterministic values. | PASS |
| Reflect closes the learning loop | Presentation view uses the finished Android screen and the `Refletir` phase copy. | PASS |
| No false live-device claim | When no handset is connected, the UI shows `SIMULAÇÃO`, `A AGUARDAR DEVICE` and `SEM DISPOSITIVO`. | PASS |
| Motion communicates state change | GSAP entrance transitions run on view/phase changes and are skipped when `prefers-reduced-motion` is enabled. | PASS |
| Competitive first-viewport proof | Against Sabiá's live-class dashboard, Morph now uses the stronger product-specific visual anchor: the same lesson changing device function across three real Android screens. | PASS |
| Motion proof for deck and web | The landing first viewport embeds the rendered Morph transformation video: the three device functions move from Compreender through Shield to Medir. The Android app has a separate native Compose metamorphosis splash. | PASS |
| Primary engineering gates | Web typecheck/build and root validation passed; Android unit tests remain green from the implementation pass. | PASS |
| Groq provider boundary | `.env.example` contains no credential, local `.env` is ignored, and the server-only planner loaded the local key without exposing it. The live batch validated Física, História, Inglês and Artes with `source: groq`, four phases, catalogue recommendations and zero applications authorised by default. | PASS |
| School Bubble small spaces | The editor accepts and persists a 25 m radius, restores the configured 180 m value, keeps the map editor visible and exposes direct navigation to Teacher Studio. | PASS |

## Known boundary

The browser preview is verified against the local bridge and the Android source;
physical-handset rendering and accessibility-service behaviour still require a
connected Android device. The preview intentionally labels that state instead
of presenting it as hardware evidence. The Groq credential remains local-only;
the provider responses were verified without persisting or echoing the secret.

## Final result: passed
