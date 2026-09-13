package com.morph.runtime.domain

import java.util.concurrent.atomic.AtomicReference

data class ActivePolicy(
    val capsuleId: String,
    val phaseId: String,
    val phaseType: PhaseType,
    val restrictedPackages: Set<String>
)

object PolicyState {
    private val active = AtomicReference<ActivePolicy?>(null)

    fun apply(capsule: LessonCapsule, phase: Phase) {
        active.set(ActivePolicy(capsule.id, phase.id, phase.type, phase.restrictedPackages))
    }

    fun current(): ActivePolicy? = active.get()
    fun clear() { active.set(null) }
}

