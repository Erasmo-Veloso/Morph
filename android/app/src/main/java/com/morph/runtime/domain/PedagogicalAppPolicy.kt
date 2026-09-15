package com.morph.runtime.domain

/**
 * Small, explicit allowlist used by the hackathon runtime.
 *
 * Package names are device-specific infrastructure, while the decision remains
 * pedagogical: each phase exposes only the tools that serve its activity.
 */
data class AllowedApp(
    val label: String,
    val packageNames: Set<String>,
    val preferredPackage: String? = null,
    val preferredActivity: String? = null
)

object PedagogicalAppPolicy {
    private const val SAMSUNG_CALCULATOR = "com.sec.android.app.popupcalculator"
    private const val GOOGLE_CALCULATOR = "com.google.android.calculator"
    private const val AOSP_CALCULATOR = "com.android.calculator2"
    private const val SAMSUNG_NOTES = "com.samsung.android.app.notes"
    private const val CHROME = "com.android.chrome"

    fun allowedApps(phase: PhaseType): List<AllowedApp> = when (phase) {
        PhaseType.UNDERSTAND, PhaseType.REFLECT -> emptyList()
        PhaseType.MEASURE -> listOf(
            AllowedApp(
                "Calculadora",
                setOf(SAMSUNG_CALCULATOR, GOOGLE_CALCULATOR, AOSP_CALCULATOR),
                SAMSUNG_CALCULATOR,
                ".Calculator"
            ),
            AllowedApp("Samsung Notes", setOf(SAMSUNG_NOTES), SAMSUNG_NOTES, ".memolist.MemoListActivity")
        )
        PhaseType.ANALYSE -> listOf(AllowedApp("Chrome", setOf(CHROME)))
    }

    fun allowedPackages(phase: PhaseType): Set<String> = allowedApps(phase).flatMapTo(mutableSetOf()) { it.packageNames }

    fun allowedToolNames(phase: PhaseType): String = when (phase) {
        PhaseType.UNDERSTAND, PhaseType.REFLECT -> "apenas Morph"
        PhaseType.MEASURE -> "Calculadora e Samsung Notes"
        PhaseType.ANALYSE -> "Google Chrome"
    }
}
