package com.morph.runtime

import android.content.Context
import android.provider.Settings
import com.morph.runtime.domain.DeviceEnrollment

/** Local identity only. The pairing code is never persisted. */
class DeviceEnrollmentStore(context: Context) {
    private val preferences = context.getSharedPreferences("morph-enrollment", Context.MODE_PRIVATE)
    val deviceId: String = preferences.getString("device_id", null)
        ?: (Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: "morph-demo-android").also {
            preferences.edit().putString("device_id", it).apply()
        }

    fun state(): DeviceEnrollment = if (preferences.getBoolean("paired", false)) DeviceEnrollment.ENROLLED else DeviceEnrollment.UNENROLLED
    fun studentId(): String = preferences.getString("student_id", "demo-student") ?: "demo-student"

    fun markPaired(studentId: String) {
        preferences.edit().putBoolean("paired", true).putString("student_id", studentId).apply()
    }

    fun clear() {
        preferences.edit().putBoolean("paired", false).remove("student_id").apply()
    }
}
