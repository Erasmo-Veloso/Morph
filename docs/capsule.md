# Learning Capsule

## Purpose

`LearningCapsule` is the canonical contract exchanged between the pedagogical/compiler side and the device runtime.

The Android runtime must not depend on the teacher's original natural-language input.

It executes the compiled Capsule.

---

## Conceptual Structure

```text
LearningCapsule
├── objective
├── phases[]
│   ├── id
│   ├── duration
│   ├── capabilities[]
│   ├── restrictions[]
│   ├── learning_assets[]
│   └── transitions[]
├── integrity_policy
├── offline_policy
├── valid_from
├── valid_until
└── signature
```

---

## Example

```json
{
  "id": "physics-accelerated-motion-001",
  "version": 1,

  "objective": "Understand accelerated motion",

  "phases": [
    {
      "id": "UNDERSTAND",
      "duration": 480,
      "capabilities": [
        "LEARNING_CONTENT"
      ],
      "restrictions": [],
      "learning_assets": [],
      "transitions": {
        "next": "MEASURE"
      }
    },

    {
      "id": "MEASURE",
      "duration": 720,
      "capabilities": [
        "ACCELEROMETER",
        "GYROSCOPE",
        "CAMERA",
        "CHRONOMETER"
      ],
      "restrictions": [],
      "learning_assets": [],
      "transitions": {
        "next": "ANALYSE"
      }
    },

    {
      "id": "ANALYSE",
      "duration": 600,
      "capabilities": [
        "GRAPH",
        "CALCULATOR"
      ],
      "restrictions": [],
      "learning_assets": [],
      "transitions": {
        "next": "REFLECT"
      }
    },

    {
      "id": "REFLECT",
      "duration": 300,
      "capabilities": [
        "EXIT_TICKET"
      ],
      "restrictions": [],
      "learning_assets": [],
      "transitions": {
        "next": null
      }
    }
  ],

  "integrity_policy": {
    "enabled": true
  },

  "offline_policy": {
    "enabled": true
  },

  "valid_from": "2026-09-12T00:00:00Z",
  "valid_until": "2026-09-12T23:59:59Z",

  "signature": "..."
}
```

---

## Rules

### 1. The Capsule is authoritative

The runtime executes the Capsule instead of independently interpreting the teacher's text.

### 2. Phases are ordered

The runtime must know the current phase and the valid next transition.

### 3. Capabilities are phase-specific

Capabilities available in one phase do not automatically remain available in another.

### 4. Capsule is temporary

A Capsule has a validity period and must expire.

### 5. Capsule is offline-ready

The runtime must be able to execute the lesson without continuous Internet access.

### 6. Integrity is explicit

The Capsule contains an integrity policy used by the runtime/Sentinel.

---

## State Machine

```text
UNDERSTAND
    │
    │ NEXT
    ▼
MEASURE
    │
    │ NEXT
    ▼
ANALYSE
    │
    │ NEXT
    ▼
REFLECT
    │
    │ END
    ▼
COMPLETED
```

Invalid transitions must be rejected.

---

## Compatibility

Changes to the Capsule contract must be versioned.

Do not silently change existing fields in a way that breaks the Android runtime.

The contract is shared between:

* Pedagogical Compiler
* Teacher Dashboard
* Backend
* Android Runtime
