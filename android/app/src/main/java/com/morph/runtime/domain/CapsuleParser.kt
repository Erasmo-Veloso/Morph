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
        val schoolBubble = root.optJSONObject("school_bubble")?.let(::parseSchoolBubble)

        return LessonCapsule(
            id = id,
            version = root.getInt("version"),
            objective = root.requiredString("objective"),
            phases = phases,
            integrityMonitoring = integrityPolicy.getBoolean("enabled"),
            offlineExecution = offlinePolicy.getBoolean("enabled"),
            validFrom = root.requiredString("valid_from"),
            validUntil = root.requiredString("valid_until"),
            signature = root.optString("signature").takeIf { it.isNotBlank() },
            schoolBubble = schoolBubble
        )
    }

    private fun parseSchoolBubble(json: JSONObject): SchoolBubble {
        val boundary = json.getJSONObject("boundary")
        require(boundary.requiredString("type") == "CIRCLE") { "Boundary da School Bubble inválida" }
        val center = boundary.getJSONObject("center")
        val latitude = center.getDouble("latitude").also { require(it in -90.0..90.0) { "Latitude inválida" } }
        val longitude = center.getDouble("longitude").also { require(it in -180.0..180.0) { "Longitude inválida" } }
        val radius = boundary.positiveInt("radius_meters")
        val policy = json.getJSONObject("policy")
        require(policy.getBoolean("gps_required")) { "GPS é obrigatório para a School Bubble" }
        return SchoolBubble(
            id = json.requiredString("id"),
            name = json.requiredString("name"),
            center = GeoPoint(latitude, longitude),
            radiusMeters = radius,
            maxAccuracyMeters = policy.positiveInt("max_accuracy_meters"),
            unknownLocationGraceSeconds = policy.positiveInt("unknown_location_grace_seconds")
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
        PhaseType.MEASURE -> "Medir"
        PhaseType.ANALYSE -> "Analisar"
        PhaseType.REFLECT -> "Reflectir"
    }

    private val restrictionPackages = mapOf(
        "SOCIAL_APPS" to setOf("com.instagram.android", "com.zhiliaoapp.musically"),
        "MESSAGING" to setOf("com.whatsapp"),
        "UNRELATED_BROWSER" to setOf("com.android.chrome")
    )
}
