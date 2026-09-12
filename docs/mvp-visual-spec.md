# Morph — MVP visual contract

## Purpose

This document defines the minimum visual language required for the Hacktudo
demonstration. It is a product contract, not a full rebrand or a replacement
for the teacher dashboard implementation.

## Product sentence

> O smartphone metamorfoseia-se conforme a aprendizagem.

The interface must make the device's change of function visible before it
explains the implementation.

## Brand system

- Brand name: `morph`, always lowercase.
- Supporting line: `AULAS QUE TRANSFORMAM`.
- The supplied logo gradient is identity only: purple → blue → cyan → green.
- White runtime surface: `#FFFFFF`.
- Soft content surface: `#F4F7FB`.
- Navy type: `#101B3A`.
- Blue interaction accent: `#287BEA`.
- Light teacher surface: white over a quiet neutral canvas.
- Do not apply a multi-colour phase palette to the runtime. The active phase is
  communicated by one blue node, the phase label and the device role.
- Prefer a clean sans-serif, high contrast and generous spacing.

## Phase language

| Phase | User-facing label | Device role | Visual cue |
| --- | --- | --- | --- |
| `UNDERSTAND` | Compreender | aprender e receber orientação | nó azul activo |
| `MEASURE` | Medir | experimentar com o acelerómetro | nó azul activo |
| `ANALYSE` | Analisar | interpretar dados locais | nó azul activo |
| `REFLECT` | Reflectir | concluir a aprendizagem | nó azul activo |

The same phase labels must be used by the teacher dashboard, Android runtime
and Shield. Technical enum names may remain visible only as secondary detail.

## Demonstration states

The primary visual proof is:

```text
Compreender → Shield → Medir
```

- `UNDERSTAND` must look like a learning surface, not an idle screen.
- `Shield` must be firm but non-punitive: the application is outside the
  current learning phase and the student is guided back to the lesson.
- `MEASURE` must visibly expose the real accelerometer and a live chart.
- Preview values must never be presented as physical sensor evidence.

## Chosen visual model

The Creative Production model used to align the composition is preserved at
[`docs/morph-white-editorial.png`](./morph-white-editorial.png). It is a
reference for the white runtime lockup, connected phase rail, learning card
and measurement instrument. The Android implementation is native Compose,
not a screenshot or generated interface.

## Scope boundary

For this MVP, design work includes the core teacher flow, Android runtime,
Shield, phase states and the recording narrative. It does not include a full
design system for all disciplines, a complete school administration product,
or a visual redesign of another contributor's dashboard without agreement.

## Acceptance test

Someone unfamiliar with Morph should understand within 20 seconds that the
phone changed from a learning surface into a measuring instrument. If the
screen only communicates that an application was blocked, the design has
failed the MVP test.
