package com.morph.runtime.domain

import org.json.JSONArray
import org.json.JSONObject

object CapsuleParser {
    fun parse(raw: String): LessonCapsule {
        val root = JSONObject(raw)
        require(root.optInt("version") == 1) { "Versão de Capsule não suportada" }
        val id = root.requiredString("id")
        val lesson = root.getJSONObject("lesson")
        val phasesJson = root.getJSONArray("phases")
        require(phasesJson.length() > 0) { "A Capsule precisa de fases" }
        val phases = (0 until phasesJson.length()).map { parsePhase(phasesJson.getJSONObject(it)) }
        require(phases.map { it.type }.distinct().size == phases.size) { "Tipos de fase duplicados" }
        val policy = root.getJSONObject("policy")
        require(policy.has("integrityMonitoring") && policy.has("offlineExecution")) { "Policy incompleta" }

        return LessonCapsule(
            id = id,
            version = root.getInt("version"),
            subject = lesson.requiredString("subject"),
            topic = lesson.requiredString("topic"),
            classId = lesson.requiredString("classId"),
            teacherId = lesson.requiredString("teacherId"),
            durationMinutes = lesson.positiveInt("durationMinutes"),
            phases = phases,
            integrityMonitoring = policy.getBoolean("integrityMonitoring"),
            offlineExecution = policy.getBoolean("offlineExecution"),
            issuedAt = root.requiredString("issuedAt"),
            durationMs = root.positiveLong("durationMs")
        )
    }

    private fun parsePhase(json: JSONObject): Phase {
        val type = runCatching { PhaseType.valueOf(json.requiredString("type")) }
            .getOrElse { error("Tipo de fase inválido") }
        val restrictions = json.getJSONObject("restrictions")
        return Phase(
            id = json.requiredString("id"),
            type = type,
            title = json.requiredString("title"),
            durationMinutes = json.positiveInt("durationMinutes"),
            capabilities = json.getJSONArray("capabilities").toCapabilitySet(),
            restrictedPackages = restrictions.getJSONArray("packages").toStringSet(),
            restrictedCategories = restrictions.getJSONArray("categories").toStringSet()
        )
    }

    private fun JSONArray.toStringSet(): Set<String> = (0 until length()).map { getString(it).also { value -> require(value.isNotBlank()) } }.toSet()

    private fun JSONArray.toCapabilitySet(): Set<Capability> = (0 until length()).map {
        runCatching { Capability.valueOf(getString(it)) }.getOrElse { error("Capability inválida") }
    }.toSet()

    private fun JSONObject.requiredString(name: String): String = getString(name).trim().also { require(it.isNotEmpty()) }
    private fun JSONObject.positiveInt(name: String): Int = getInt(name).also { require(it > 0) }
    private fun JSONObject.positiveLong(name: String): Long = getLong(name).also { require(it > 0) }
}

