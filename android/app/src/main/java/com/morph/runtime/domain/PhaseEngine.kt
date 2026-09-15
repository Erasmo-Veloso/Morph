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
        val receivedSchoolContext = when {
            _state.value.enrollment != DeviceEnrollment.ENROLLED -> SchoolContext.OUTSIDE_SCHOOL
            capsule.schoolBubble == null -> SchoolContext.SCHOOL_VERIFIED
            else -> SchoolContext.OUTSIDE_SCHOOL
        }
        _state.value = RuntimeState(
            stage = RuntimeStage.CAPSULE_RECEIVED,
            capsuleId = capsule.id,
            connectivity = Connectivity.ISOLATED,
            integrity = Integrity.WARNING,
            enrollment = _state.value.enrollment,
            schoolContext = receivedSchoolContext,
            authority = if (receivedSchoolContext == SchoolContext.SCHOOL_VERIFIED) AuthorityState.SCHOOL_IDLE else AuthorityState.PASSIVE,
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
        if (!isSchoolVerified()) {
            _state.value = _state.value.copy(status = "A aguardar confirmação da School Bubble")
            return
        }
        transitionTo(currentCapsule.phases.first().type)
    }

    fun transitionTo(phaseType: PhaseType) {
        val currentCapsule = capsule ?: return
        if (_state.value.enrollment != DeviceEnrollment.ENROLLED || _state.value.schoolContext == SchoolContext.OUTSIDE_SCHOOL) {
            if (_state.value.running) leaveSchoolContext()
            else _state.value = _state.value.copy(status = "A aula só pode iniciar dentro da School Bubble")
            return
        }
        if (_state.value.schoolContext != SchoolContext.SCHOOL_VERIFIED && !_state.value.running) {
            _state.value = _state.value.copy(status = "A aguardar confirmação da School Bubble")
            return
        }
        val phase = currentCapsule.phases.firstOrNull { it.type == phaseType } ?: return
        val previous = _state.value.currentPhase
        previous?.let { PolicyState.clear(); capabilityManager.clear() }
        PolicyState.apply(currentCapsule, phase)
        capabilityManager.activate(phase.capabilities)
        _state.value = _state.value.copy(
            stage = RuntimeStage.valueOf(phase.type.name),
            currentPhase = phase,
            running = true,
            authority = AuthorityState.CAPSULE_ACTIVE,
            integrity = if (_state.value.schoolContext == SchoolContext.SCHOOL_UNVERIFIED) Integrity.WARNING else Integrity.VERIFIED,
            status = phase.title,
            monotonicStartedAtMs = _state.value.monotonicStartedAtMs ?: monotonicClock()
        )
    }

    fun end() {
        suspendedPhaseType = null
        PolicyState.clear()
        capabilityManager.clear()
        _state.value = _state.value.copy(
            stage = RuntimeStage.BREAK,
            currentPhase = null,
            running = false,
            authority = if (_state.value.schoolContext == SchoolContext.SCHOOL_VERIFIED) AuthorityState.BREAK else AuthorityState.PASSIVE,
            schoolContextExpiresAtMs = null,
            status = "Intervalo · política limpa",
            monotonicStartedAtMs = null
        )
    }

    fun finishBreak() {
        PolicyState.clear()
        capabilityManager.clear()
        _state.value = _state.value.copy(
            stage = RuntimeStage.FINISHED,
            authority = if (_state.value.schoolContext == SchoolContext.SCHOOL_VERIFIED) AuthorityState.SCHOOL_IDLE else AuthorityState.PASSIVE,
            schoolContextExpiresAtMs = null,
            status = "Sessão concluída · telefone disponível"
        )
    }

    fun expireUnverifiedContext(): Boolean {
        val deadline = _state.value.schoolContextExpiresAtMs ?: return false
        if (_state.value.schoolContext != SchoolContext.SCHOOL_UNVERIFIED || !_state.value.running || monotonicClock() < deadline) return false
        end()
        _state.value = _state.value.copy(
            schoolContextExpiresAtMs = null,
            integrity = Integrity.WARNING,
            status = "Contexto escolar não confirmado · Capsule encerrada em segurança"
        )
        return true
    }

    fun setConnectivity(value: Connectivity) { _state.value = _state.value.copy(connectivity = value) }

    fun setEnrollment(value: DeviceEnrollment) {
        if (_state.value.enrollment == value && value != DeviceEnrollment.UNENROLLED) return
        if (value == DeviceEnrollment.UNENROLLED) {
            PolicyState.clear()
            capabilityManager.clear()
            _state.value = _state.value.copy(
                enrollment = value,
                schoolContext = SchoolContext.OUTSIDE_SCHOOL,
                authority = AuthorityState.PASSIVE,
                stage = RuntimeStage.IDLE,
                currentPhase = null,
                running = false,
                status = "Dispositivo sem associação escolar"
            )
            return
        }
        _state.value = _state.value.copy(enrollment = value, status = "Dispositivo associado · a confirmar contexto escolar")
        applySchoolContextFromBubble(_state.value.bubbleStatus)
    }

    fun currentSchoolBubble(): SchoolBubble? = capsule?.schoolBubble

    fun setBubbleStatus(value: BubbleStatus) {
        val previous = _state.value.bubbleStatus
        if (previous == value) return
        _state.value = _state.value.copy(bubbleStatus = value)
        applySchoolContextFromBubble(value)
    }

    fun setSchoolContext(value: SchoolContext) {
        if (_state.value.schoolContext == value) return
        _state.value = _state.value.copy(schoolContext = value)
        when (value) {
            SchoolContext.OUTSIDE_SCHOOL -> leaveSchoolContext()
            SchoolContext.SCHOOL_UNVERIFIED -> {
                val graceMs = (capsule?.schoolBubble?.unknownLocationGraceSeconds?.toLong() ?: DEFAULT_UNVERIFIED_GRACE_SECONDS) * 1_000L
                _state.value = _state.value.copy(
                    integrity = Integrity.WARNING,
                    schoolContextExpiresAtMs = monotonicClock() + graceMs,
                    status = "Contexto escolar não verificado · Capsule continua temporariamente"
                )
            }
            SchoolContext.SCHOOL_VERIFIED -> {
                _state.value = _state.value.copy(schoolContextExpiresAtMs = null)
                val resume = suspendedPhaseType
                if (resume != null) {
                    suspendedPhaseType = null
                    transitionTo(resume)
                } else if (!_state.value.running) {
                    _state.value = _state.value.copy(authority = AuthorityState.SCHOOL_IDLE, integrity = Integrity.VERIFIED, status = "Na escola · sem Capsule activa")
                }
            }
        }
    }

    private fun isSchoolVerified() = _state.value.enrollment == DeviceEnrollment.ENROLLED && _state.value.schoolContext == SchoolContext.SCHOOL_VERIFIED

    private fun applySchoolContextFromBubble(value: BubbleStatus) {
        if (_state.value.enrollment != DeviceEnrollment.ENROLLED) return
        when (value) {
            BubbleStatus.INSIDE, BubbleStatus.DEMO_READY, BubbleStatus.NOT_REQUIRED -> setSchoolContext(SchoolContext.SCHOOL_VERIFIED)
            BubbleStatus.OUTSIDE -> setSchoolContext(SchoolContext.OUTSIDE_SCHOOL)
            BubbleStatus.CHECKING, BubbleStatus.UNKNOWN -> if (_state.value.running) setSchoolContext(SchoolContext.SCHOOL_UNVERIFIED) else setSchoolContext(SchoolContext.OUTSIDE_SCHOOL)
        }
    }

    private fun leaveSchoolContext() {
        suspendedPhaseType = _state.value.currentPhase?.type
        PolicyState.clear()
        capabilityManager.clear()
        _state.value = _state.value.copy(
            stage = RuntimeStage.IDLE,
            currentPhase = null,
            running = false,
            authority = AuthorityState.PASSIVE,
            integrity = Integrity.WARNING,
            schoolContextExpiresAtMs = null,
            status = "Fora do contexto escolar · política removida"
        )
    }

    companion object {
        private const val DEFAULT_UNVERIFIED_GRACE_SECONDS = 300L
    }

}
