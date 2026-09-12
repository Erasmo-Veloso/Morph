package com.morph.runtime.domain

class CapsuleRepository {
    fun parse(raw: String): LessonCapsule = CapsuleParser.parse(raw)
}

