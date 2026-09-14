package com.morph.runtime

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent
import com.morph.runtime.domain.PolicyState
import com.morph.runtime.domain.PedagogicalAppPolicy
import kotlinx.coroutines.launch

class PolicyAccessibilityService : AccessibilityService() {
    private var lastPackage: String? = null
    private var lastAttemptAt = 0L
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        val packageName = event?.packageName?.toString() ?: return
        val policy = PolicyState.current() ?: return
        if (packageName == packageNameForOwnApp() || packageName in policy.allowedPackages || packageName in systemPackages) return
        val now = System.currentTimeMillis()
        // Chrome emits several window events while it is booting. Keep one
        // shield response per package window so a late BACK event cannot
        // dismiss the Shield we just opened.
        if (packageName == lastPackage && now - lastAttemptAt < 5000) return
        lastPackage = packageName
        lastAttemptAt = now
        MorphApplication.instance.scope.launch {
            MorphApplication.instance.sentinel.record(policy.capsuleId, policy.phaseId, "RESTRICTED_ACCESS_ATTEMPT", "package=$packageName")
            MorphApplication.instance.session.syncPending()
        }
        mainHandler.postDelayed({
            startActivity(Intent(this, ShieldActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                putExtra(ShieldActivity.PACKAGE_NAME, packageName)
                putExtra(ShieldActivity.PHASE_TYPE, policy.phaseType.name)
                putExtra(ShieldActivity.ALLOWED_TOOLS, PedagogicalAppPolicy.allowedToolNames(policy.phaseType))
            })
        }, 700L)
    }

    private fun packageNameForOwnApp() = packageName
    override fun onInterrupt() = Unit

    companion object {
        // These are Android UI surfaces, not student applications. The launcher
        // is neutral: pupils may see it, but every app opened from it is still
        // checked against the phase allowlist. Settings remains restricted.
        private val systemPackages = setOf(
            "android",
            "com.android.systemui",
            "com.sec.android.app.launcher",
            "com.samsung.android.launcher",
            "com.android.launcher3"
        )
    }
}
