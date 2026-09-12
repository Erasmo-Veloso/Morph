package com.morph.runtime.domain

import org.json.JSONArray
import org.json.JSONObject

object CapsuleParser {
    fun parse(raw: String): LessonCapsule {
        val root = JSONObject(raw)
        require(root.optInt("version") == 1) { "Versão de Capsule não suportada" }
        val id = root.requiredString("id")
        val phasesJson = root.getJSONArray("phases")
        require(phasesJson.length() > 0) { "A Capsule precisa de fases" }
        val phases = (0 until phasesJson.length()).map { parsePhase(phasesJson.getJSONObject(it)) }
        require(phases.map { it.type }.distinct().size == phases.size) { "Tipos de fase duplicados" }
        val integrityPolicy = root.getJSONObject("integrity_policy")
        val offlinePolicy = root.getJSONObject("offline_policy")
        require(integrityPolicy.has("enabled") && offlinePolicy.has("enabled")) { "Policy incompleta" }

        return LessonCapsule(
            id = id,
            version = root.getInt("version"),
            objective = root.requiredString("objective"),
            phases = phases,
            integrityMonitoring = integrityPolicy.getBoolean("enabled"),
            offlineExecution = offlinePolicy.getBoolean("enabled"),
            validFrom = root.requiredString("valid_from"),
            validUntil = root.requiredString("valid_until"),
            signature = root.optString("signature").takeIf { it.isNotBlank() }
        )
    }

    private fun parsePhase(json: JSONObject): Phase {
        val type = runCatching { PhaseType.valueOf(json.requiredString("id")) }
            .getOrElse { error("Tipo de fase inválido") }
        val restrictions = json.getJSONArray("restrictions").toStringSet()
        return Phase(
            id = type.name.lowercase(),
            type = type,
            title = type.title(),
            durationMinutes = (json.positiveInt("duration") + 59) / 60,
            capabilities = json.getJSONArray("capabilities").toCapabilitySet(),
            restrictedPackages = restrictions.flatMapTo(mutableSetOf()) { restrictionPackages[it].orEmpty() },
            restrictedCategories = restrictions
        )
    }

    private fun JSONArray.toStringSet(): Set<String> = (0 until length()).map { getString(it).also { value -> require(value.isNotBlank()) } }.toSet()

    private fun JSONArray.toCapabilitySet(): Set<Capability> = (0 until length()).map {
        runCatching { Capability.valueOf(getString(it)) }.getOrElse { error("Capability inválida") }
    }.toSet()

    private fun JSONObject.requiredString(name: String): String = getString(name).trim().also { require(it.isNotEmpty()) }
    private fun JSONObject.positiveInt(name: String): Int = getInt(name).also { require(it > 0) }
    private fun PhaseType.title() = when (this) {
        PhaseType.UNDERSTAND -> "Compreender"
        PhaseType.MEASURE -> "Experimentar"
        PhaseType.ANALYSE -> "Analisar"
        PhaseType.REFLECT -> "Reflectir"
    }

    private val restrictionPackages = mapOf(
        "SOCIAL_APPS" to setOf("com.instagram.android", "com.zhiliaoapp.musically"),
        "MESSAGING" to setOf("com.whatsapp"),
        "UNRELATED_BROWSER" to setOf("com.android.chrome")
    )
}
