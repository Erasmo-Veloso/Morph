package com.morph.runtime.domain

/**
 * Small, explicit allowlist used by the hackathon runtime.
 *
 * Package names are device-specific infrastructure, while the decision remains
 * pedagogical: each phase exposes only the tools that serve its activity.
 */
object PedagogicalAppPolicy {
    private const val SAMSUNG_CALCULATOR = "com.sec.android.app.popupcalculator"
    private const val GOOGLE_CALCULATOR = "com.google.android.calculator"
    private const val AOSP_CALCULATOR = "com.android.calculator2"
    private const val SAMSUNG_NOTES = "com.samsung.android.app.notes"
    private const val CHROME = "com.android.chrome"

    /** Capsules compiled before the school catalogue remain demonstrable. */
    private fun fallbackApps(phase: PhaseType): List<AllowedApp> = when (phase) {
        PhaseType.UNDERSTAND, PhaseType.REFLECT -> emptyList()
        PhaseType.MEASURE -> listOf(
            AllowedApp(
                "calculator",
                "Calculadora",
                setOf(SAMSUNG_CALCULATOR, GOOGLE_CALCULATOR, AOSP_CALCULATOR),
                SAMSUNG_CALCULATOR,
                ".Calculator"
            ),
            AllowedApp("samsung-notes", "Samsung Notes", setOf(SAMSUNG_NOTES), SAMSUNG_NOTES, ".memolist.MemoListActivity")
        )
        PhaseType.ANALYSE -> listOf(AllowedApp("chrome", "Google Chrome", setOf(CHROME), CHROME))
    }

    fun allowedApps(phase: Phase): List<AllowedApp> = if (phase.allowedAppsConfigured) phase.allowedApps else fallbackApps(phase.type)

    fun allowedPackages(phase: Phase): Set<String> = allowedApps(phase).flatMapTo(mutableSetOf()) { it.packageNames }

    fun allowedToolNames(phase: Phase): String = allowedApps(phase).joinToString { it.label }.ifBlank { "apenas Morph" }
}
