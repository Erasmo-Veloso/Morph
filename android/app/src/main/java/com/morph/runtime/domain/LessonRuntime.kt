package com.morph.runtime.domain

import kotlinx.coroutines.flow.StateFlow

class LessonRuntime(
    val phaseEngine: PhaseEngine = PhaseEngine(),
    private val capsuleRepository: CapsuleRepository = CapsuleRepository()
) {
    val state: StateFlow<RuntimeState> = phaseEngine.state
    val activeCapabilities: StateFlow<Set<Capability>> = phaseEngine.activeCapabilities

    fun receive(rawCapsule: String) { phaseEngine.receive(capsuleRepository.parse(rawCapsule)) }
    fun markReady() { phaseEngine.markReady() }
    fun start() { phaseEngine.start() }
    fun transitionTo(phase: PhaseType) { phaseEngine.transitionTo(phase) }
    fun end() { phaseEngine.end() }
    fun setConnectivity(value: Connectivity) { phaseEngine.setConnectivity(value) }
}
