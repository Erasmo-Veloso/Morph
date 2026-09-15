import { LearningCapsule, PhaseId, compilePedagogicalIntent, getNextPhase } from "./capsule";

export type IntegrityEvent = {
  id: string;
  type:
    | "SESSION_STARTED"
    | "PHASE_CHANGED"
    | "RESTRICTED_CAPABILITY_REQUESTED"
    | "NETWORK_UNAVAILABLE"
    | "LOCAL_QUEUE_SYNCED"
    | "SESSION_COMPLETED";
  message: string;
  phase: PhaseId | "COMPLETED";
  queued: boolean;
  createdAt: string;
};

export type LessonSession = {
  id: string;
  capsule: LearningCapsule;
  status: "IDLE" | "RUNNING" | "COMPLETED";
  currentPhase: PhaseId | "COMPLETED";
  connectivity: "ONLINE" | "LOCAL_MODE";
  queuedEvents: number;
  events: IntegrityEvent[];
};

type Store = {
  lastCapsule: LearningCapsule | null;
  session: LessonSession | null;
};

const globalForStore = globalThis as typeof globalThis & {
  morphStore?: Store;
};

const store =
  globalForStore.morphStore ??
  (globalForStore.morphStore = {
    lastCapsule: compilePedagogicalIntent(
      "Teach accelerated motion with a short explanation, a practical experiment, analysis of results and reflection."
    ).capsule,
    session: null
  });

function createEvent(
  session: LessonSession,
  type: IntegrityEvent["type"],
  message: string,
  queued = session.connectivity === "LOCAL_MODE"
): IntegrityEvent {
  return {
    id: `${type.toLowerCase()}-${Date.now()}`,
    type,
    message,
    phase: session.currentPhase,
    queued,
    createdAt: new Date().toISOString()
  };
}

export function saveCapsule(capsule: LearningCapsule) {
  store.lastCapsule = capsule;
  return capsule;
}

export function getCapsule() {
  return store.lastCapsule;
}

export function getSession() {
  return store.session;
}

export function startSession(capsule = store.lastCapsule) {
  if (!capsule) {
    throw new Error("No capsule available. Compile the lesson first.");
  }

  const session: LessonSession = {
    id: "session-hkt-demo",
    capsule,
    status: "RUNNING",
    currentPhase: capsule.phases[0].id,
    connectivity: "ONLINE",
    queuedEvents: 0,
    events: []
  };

  session.events.push(createEvent(session, "SESSION_STARTED", "Capsule delivered to Android runtime."));
  store.session = session;
  return session;
}

export function advanceSession() {
  const session = requireSession();

  if (session.currentPhase === "COMPLETED") {
    return session;
  }

  const nextPhase = getNextPhase(session.capsule, session.currentPhase);
  if (!nextPhase) {
    session.currentPhase = "COMPLETED";
    session.status = "COMPLETED";
    session.events.unshift(createEvent(session, "SESSION_COMPLETED", "Runtime reached final state."));
    return session;
  }

  session.currentPhase = nextPhase;
  session.events.unshift(createEvent(session, "PHASE_CHANGED", `Android runtime changed to ${nextPhase}.`));
  return session;
}

export function endSession() {
  const session = requireSession();
  session.currentPhase = "COMPLETED";
  session.status = "COMPLETED";
  session.events.unshift(createEvent(session, "SESSION_COMPLETED", "Teacher ended the session."));
  return session;
}

export function triggerIntegrityEvent() {
  const session = requireSession();
  const event = createEvent(
    session,
    "RESTRICTED_CAPABILITY_REQUESTED",
    "Restricted capability requested. Shield state visible on Android runtime."
  );
  session.events.unshift(event);
  if (event.queued) {
    session.queuedEvents += 1;
  }
  return session;
}

export function setOfflineMode() {
  const session = requireSession();
  session.connectivity = "LOCAL_MODE";
  const event = createEvent(session, "NETWORK_UNAVAILABLE", "Network unavailable. Capsule remains active locally.", true);
  session.events.unshift(event);
  session.queuedEvents += 1;
  return session;
}

export function syncQueuedEvents() {
  const session = requireSession();
  const synced = session.queuedEvents;
  session.connectivity = "ONLINE";
  session.queuedEvents = 0;
  session.events.unshift(
    createEvent(session, "LOCAL_QUEUE_SYNCED", `${synced} queued events synchronized with backend.`, false)
  );
  return session;
}

function requireSession() {
  if (!store.session) {
    throw new Error("No active session. Start the lesson first.");
  }
  return store.session;
}
