package com.morph.runtime.domain

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import android.os.SystemClock

class PhaseEngine(private val monotonicClock: () -> Long = { SystemClock.elapsedRealtime() }) {
    private val _state = MutableStateFlow(RuntimeState())
    val state: StateFlow<RuntimeState> = _state.asStateFlow()
    private val capabilityManager = CapabilityManager()
    val activeCapabilities: StateFlow<Set<Capability>> = capabilityManager.active
    private var capsule: LessonCapsule? = null

    fun receive(capsule: LessonCapsule) {
        this.capsule = capsule
        PolicyState.clear()
        capabilityManager.clear()
        _state.value = RuntimeState(stage = RuntimeStage.CAPSULE_RECEIVED, capsuleId = capsule.id, connectivity = Connectivity.ISOLATED, integrity = Integrity.UNVERIFIED, status = "Capsule recebida")
    }

    fun markReady() {
        if (capsule != null && _state.value.stage == RuntimeStage.CAPSULE_RECEIVED) {
            _state.value = _state.value.copy(stage = RuntimeStage.READY, status = "Capsule pronta · à espera do professor")
        }
    }

    fun start() {
        val currentCapsule = capsule ?: return
        transitionTo(currentCapsule.phases.first().type)
    }

    fun transitionTo(phaseType: PhaseType) {
        val currentCapsule = capsule ?: return
        val phase = currentCapsule.phases.firstOrNull { it.type == phaseType } ?: return
        val previous = _state.value.currentPhase
        previous?.let { PolicyState.clear(); capabilityManager.clear() }
        PolicyState.apply(currentCapsule, phase)
        capabilityManager.activate(phase.capabilities)
        _state.value = _state.value.copy(stage = RuntimeStage.valueOf(phase.type.name), currentPhase = phase, running = true, status = phase.title, monotonicStartedAtMs = _state.value.monotonicStartedAtMs ?: monotonicClock())
    }

    fun end() {
        PolicyState.clear()
        capabilityManager.clear()
        _state.value = _state.value.copy(stage = RuntimeStage.FINISHED, currentPhase = null, running = false, status = "Sessão terminada · policy limpa", monotonicStartedAtMs = null)
    }

    fun setConnectivity(value: Connectivity) { _state.value = _state.value.copy(connectivity = value) }
}
