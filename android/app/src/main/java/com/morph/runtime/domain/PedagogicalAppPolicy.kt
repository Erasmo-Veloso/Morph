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

    fun allowedPackages(phase: PhaseType): Set<String> = when (phase) {
        PhaseType.UNDERSTAND, PhaseType.REFLECT -> emptySet()
        PhaseType.MEASURE -> setOf(SAMSUNG_CALCULATOR, GOOGLE_CALCULATOR, AOSP_CALCULATOR, SAMSUNG_NOTES)
        PhaseType.ANALYSE -> setOf(CHROME)
    }

    fun allowedToolNames(phase: PhaseType): String = when (phase) {
        PhaseType.UNDERSTAND, PhaseType.REFLECT -> "apenas Morph"
        PhaseType.MEASURE -> "Calculadora e Samsung Notes"
        PhaseType.ANALYSE -> "Google Chrome"
    }
}
