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
    private var suspendedPhaseType: PhaseType? = null

    fun receive(capsule: LessonCapsule) {
        this.capsule = capsule
        PolicyState.clear()
        capabilityManager.clear()
        suspendedPhaseType = null
        _state.value = RuntimeState(
            stage = RuntimeStage.CAPSULE_RECEIVED,
            capsuleId = capsule.id,
            connectivity = Connectivity.ISOLATED,
            integrity = Integrity.UNVERIFIED,
            bubbleStatus = if (capsule.schoolBubble == null) BubbleStatus.NOT_REQUIRED else BubbleStatus.CHECKING,
            schoolBubbleName = capsule.schoolBubble?.name,
            status = "Capsule recebida"
        )
    }

    fun markReady() {
        if (capsule != null && _state.value.stage == RuntimeStage.CAPSULE_RECEIVED) {
            _state.value = _state.value.copy(stage = RuntimeStage.READY, status = "Capsule pronta · à espera do professor")
        }
    }

    fun start() {
        val currentCapsule = capsule ?: return
        if (!isBubbleEligible()) {
            _state.value = _state.value.copy(status = "A aguardar confirmação da School Bubble")
            return
        }
        transitionTo(currentCapsule.phases.first().type)
    }

    fun transitionTo(phaseType: PhaseType) {
        val currentCapsule = capsule ?: return
        if (!isBubbleEligible()) {
            if (_state.value.running) suspendForBubble()
            else _state.value = _state.value.copy(status = "A aula só pode iniciar dentro da School Bubble")
            return
        }
        val phase = currentCapsule.phases.firstOrNull { it.type == phaseType } ?: return
        val previous = _state.value.currentPhase
        previous?.let { PolicyState.clear(); capabilityManager.clear() }
        PolicyState.apply(currentCapsule, phase)
        capabilityManager.activate(phase.capabilities)
        _state.value = _state.value.copy(stage = RuntimeStage.valueOf(phase.type.name), currentPhase = phase, running = true, status = phase.title, monotonicStartedAtMs = _state.value.monotonicStartedAtMs ?: monotonicClock())
    }

    fun end() {
        suspendedPhaseType = null
        PolicyState.clear()
        capabilityManager.clear()
        _state.value = _state.value.copy(stage = RuntimeStage.FINISHED, currentPhase = null, running = false, status = "Sessão terminada · policy limpa", monotonicStartedAtMs = null)
    }

    fun setConnectivity(value: Connectivity) { _state.value = _state.value.copy(connectivity = value) }

    fun currentSchoolBubble(): SchoolBubble? = capsule?.schoolBubble

    fun setBubbleStatus(value: BubbleStatus) {
        val previous = _state.value.bubbleStatus
        if (previous == value) return
        _state.value = _state.value.copy(bubbleStatus = value)
        if (value == BubbleStatus.OUTSIDE && _state.value.running) {
            suspendForBubble()
        } else if (value == BubbleStatus.INSIDE && suspendedPhaseType != null) {
            val phaseToResume = suspendedPhaseType ?: return
            suspendedPhaseType = null
            transitionTo(phaseToResume)
        }
    }

    private fun isBubbleEligible() = capsule?.schoolBubble == null || _state.value.bubbleStatus == BubbleStatus.INSIDE

    private fun suspendForBubble() {
        suspendedPhaseType = _state.value.currentPhase?.type
        PolicyState.clear()
        capabilityManager.clear()
        _state.value = _state.value.copy(
            stage = RuntimeStage.READY,
            currentPhase = null,
            running = false,
            status = "Fora da School Bubble · política suspensa"
        )
    }
}
