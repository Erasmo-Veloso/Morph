package com.morph.runtime

import android.content.Context

class ReflectionStore(context: Context) {
    private val preferences = context.getSharedPreferences("morph-reflections", Context.MODE_PRIVATE)

    fun load(capsuleId: String?): String = capsuleId?.let { preferences.getString("reflection:$it", "") }.orEmpty()

    fun save(capsuleId: String?, value: String) {
        if (capsuleId.isNullOrBlank() || value.isBlank()) return
        preferences.edit().putString("reflection:$capsuleId", value.trim()).apply()
    }
}
