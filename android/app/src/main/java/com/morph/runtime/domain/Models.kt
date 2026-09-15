package com.morph.runtime.domain

enum class PhaseType { UNDERSTAND, MEASURE, ANALYSE, REFLECT }
enum class Capability {
    LEARNING_CONTENT, GUIDED_EXPLANATION, ACCELEROMETER, GYROSCOPE, CAMERA,
    CHRONOMETER, COLLECTED_DATA, GRAPH, CALCULATOR, EXIT_TICKET
}
enum class Connectivity { ONLINE, LOCAL, ISOLATED }
enum class Integrity { VERIFIED, WARNING, NON_COMPLIANT }
enum class DeviceEnrollment { UNENROLLED, ENROLLED }
enum class SchoolContext { OUTSIDE_SCHOOL, SCHOOL_VERIFIED, SCHOOL_UNVERIFIED }
enum class AuthorityState { PASSIVE, SCHOOL_IDLE, CAPSULE_ACTIVE, BREAK }
enum class BubbleStatus { NOT_REQUIRED, DEMO_READY, CHECKING, INSIDE, OUTSIDE, UNKNOWN }
enum class RuntimeStage { IDLE, CAPSULE_RECEIVED, READY, UNDERSTAND, MEASURE, ANALYSE, REFLECT, BREAK, FINISHED }

data class GeoPoint(val latitude: Double, val longitude: Double)

data class SchoolBubble(
    val id: String,
    val name: String,
    val center: GeoPoint,
    val radiusMeters: Int,
    val maxAccuracyMeters: Int,
    val unknownLocationGraceSeconds: Int
)

data class AllowedApp(
    val id: String,
    val label: String,
    val packageNames: Set<String>,
    val preferredPackage: String? = null,
    val preferredActivity: String? = null
)

data class Phase(
    val id: String,
    val type: PhaseType,
    val title: String,
    val durationMinutes: Int,
    val capabilities: Set<Capability>,
    val restrictedPackages: Set<String>,
    val restrictedCategories: Set<String>,
    val allowedApps: List<AllowedApp> = emptyList(),
    /** False only for legacy in-memory fixtures; parsed Capsules always decide explicitly. */
    val allowedAppsConfigured: Boolean = false
)

data class LessonCapsule(
    val id: String,
    val version: Int,
    val objective: String,
    val phases: List<Phase>,
    val integrityMonitoring: Boolean,
    val offlineExecution: Boolean,
    val validFrom: String,
    val validUntil: String,
    val signature: String?,
    val schoolBubble: SchoolBubble? = null
)

data class RuntimeState(
    val stage: RuntimeStage = RuntimeStage.IDLE,
    val capsuleId: String? = null,
    val currentPhase: Phase? = null,
    val connectivity: Connectivity = Connectivity.ISOLATED,
    val integrity: Integrity = Integrity.WARNING,
    val enrollment: DeviceEnrollment = DeviceEnrollment.UNENROLLED,
    val schoolContext: SchoolContext = SchoolContext.OUTSIDE_SCHOOL,
    val authority: AuthorityState = AuthorityState.PASSIVE,
    val schoolContextExpiresAtMs: Long? = null,
    val bubbleStatus: BubbleStatus = BubbleStatus.NOT_REQUIRED,
    val schoolBubbleName: String? = null,
    val running: Boolean = false,
    val status: String = "À espera de Capsule",
    val monotonicStartedAtMs: Long? = null
)
