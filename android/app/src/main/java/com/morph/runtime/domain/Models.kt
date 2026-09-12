package com.morph.runtime.domain

enum class PhaseType { UNDERSTAND, MEASURE, ANALYSE, REFLECT }
enum class Capability { MATERIAL, NOTES, ACCELEROMETER, TIMER, CHART, CALCULATOR, REFLECTION }
enum class Connectivity { ONLINE, LOCAL, ISOLATED }
enum class Integrity { VERIFIED, UNVERIFIED }
enum class RuntimeStage { IDLE, CAPSULE_RECEIVED, READY, UNDERSTAND, MEASURE, ANALYSE, REFLECT, FINISHED }

data class Phase(
    val id: String,
    val type: PhaseType,
    val title: String,
    val durationMinutes: Int,
    val capabilities: Set<Capability>,
    val restrictedPackages: Set<String>,
    val restrictedCategories: Set<String>
)

data class LessonCapsule(
    val id: String,
    val version: Int,
    val subject: String,
    val topic: String,
    val classId: String,
    val teacherId: String,
    val durationMinutes: Int,
    val phases: List<Phase>,
    val integrityMonitoring: Boolean,
    val offlineExecution: Boolean,
    val issuedAt: String,
    val durationMs: Long
)

data class RuntimeState(
    val stage: RuntimeStage = RuntimeStage.IDLE,
    val capsuleId: String? = null,
    val currentPhase: Phase? = null,
    val connectivity: Connectivity = Connectivity.ISOLATED,
    val integrity: Integrity = Integrity.UNVERIFIED,
    val running: Boolean = false,
    val status: String = "À espera de Capsule",
    val monotonicStartedAtMs: Long? = null
)
