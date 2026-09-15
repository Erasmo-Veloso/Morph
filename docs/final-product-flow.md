# MORPH — final product flow

## The boundary of authority

Morph changes the device only for a declared learning interval. School context
permits a Capsule; it never creates a permanent school policy.

| Device association | School context | Capsule | Authority | Device behaviour |
| --- | --- | --- | --- | --- |
| `UNENROLLED` | `OUTSIDE_SCHOOL` | `IDLE` | `PASSIVE` | No policy. The Android screen asks for the pairing code. |
| `ENROLLED` | `SCHOOL_VERIFIED` | `IDLE` | `SCHOOL_IDLE` | At school, but unrestricted until a teacher starts a Capsule. |
| `ENROLLED` | `SCHOOL_VERIFIED` | `UNDERSTAND` → `REFLECT` | `CAPSULE_ACTIVE` | Only the active phase's capabilities and allowed apps are enabled. |
| `ENROLLED` | `SCHOOL_UNVERIFIED` | active | `CAPSULE_ACTIVE` temporarily | The Capsule continues, records `SCHOOL_CONTEXT_LOST`, and the teacher sees the warning. |
| `ENROLLED` | `SCHOOL_VERIFIED` | `BREAK` | `BREAK` | Policy is cleared; the learner regains autonomy. |
| any | `OUTSIDE_SCHOOL` | any | `PASSIVE` | Policy is cleared immediately and Morph becomes passive. |

The dimensions are independent in Android: `enrollment`, `schoolContext`,
`authority`, `stage`, `connectivity` and `integrity`. For example, a legitimate
state is `ENROLLED / SCHOOL_VERIFIED / CAPSULE_ACTIVE / MEASURE / LOCAL /
VERIFIED`.

## Enrollment

1. The school panel declares the demo student, class and one primary device.
2. It exposes the local pairing code `MORPH-2026` for the current demo run.
3. Android enters the code once. The runtime binds the device ID to `Aluno
   demo`, `10A-FISICA` and `Colégio Horizonte`.
4. The teacher panel exposes the association state before the session begins.

The current implementation is a local, single-device pairing authority for the
pitch. It is intentionally not a multi-school identity system or a production
authentication service.

## School Context Engine

The MVP uses two demonstrable signals: an enrolled device and a reachable local
Morph runtime. The configured School Bubble remains in the Capsule contract as
the future approximate-boundary signal. The APK does not request device
location during the pitch.

- `SCHOOL_VERIFIED`: enrolled device plus local school runtime context.
- `SCHOOL_UNVERIFIED`: context was previously valid but is temporarily not
  sufficient. The active Capsule is retained, Sentinel records the change and
  the configured Bubble grace period becomes a local safety TTL. If it expires,
  Morph enters policy-free Break.
- `OUTSIDE_SCHOOL`: the runtime clears `PolicyState` and capabilities; no
  restriction survives. Returning to a verified context leaves the device in
  `SCHOOL_IDLE` until the teacher explicitly starts a new Capsule.

The teacher may drive the demo context through the bridge. A production context
engine must add approximate location, timetable and trusted local-network
signals before presenting the Bubble as physical location verification.

## Capsule lifecycle

1. Teacher configures the pedagogical intent as an offline Capsule.
2. The device receives it but remains unrestricted until the teacher starts.
3. `UNDERSTAND` enables lesson content and applies the phase app policy.
4. `MEASURE` starts `TYPE_ACCELEROMETER`; leaving the phase stops the listener.
5. `ANALYSE` renders the actual local sample, mean, peak and deterministic
   insight.
6. `REFLECT` stores the learner's answer locally under the Capsule ID.
7. Teacher end enters `BREAK`, clears policy/capabilities and gives the learner
   a visible autonomy choice. The learner can then enter `FINISHED`.

## Offline and privacy

`ONLINE`, `LOCAL` and `ISOLATED` describe connectivity only. An active Capsule
and its local policy, sensor and Room queue continue in `LOCAL` or `ISOLATED`.
Sentinel writes before sending and becomes synced only after an ACK; duplicate
event IDs are ignored by the bridge.

Sentinel stores technical integrity events only: ID, student/Capsule/phase IDs,
event type, time, minimal technical payload and sync state. It does not record
messages, text in other apps, contacts, photos, screenshots, conversations or
personal history.

## Emergency boundary

Morph's Accessibility policy excludes the Android system UI and launcher. It
does not replace the operating system or claim MDM-level lockdown. Emergency
calling and critical system functions remain outside the Capsule policy. This
is an intentional MVP boundary and must be retained in the pitch.
