package com.morph.runtime

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import com.morph.runtime.domain.PolicyState
import kotlinx.coroutines.launch

class PolicyAccessibilityService : AccessibilityService() {
    private var lastPackage: String? = null
    private var lastAttemptAt = 0L

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        val packageName = event?.packageName?.toString() ?: return
        val policy = PolicyState.current() ?: return
        if (packageName == packageNameForOwnApp() || packageName !in policy.restrictedPackages) return
        val now = System.currentTimeMillis()
        if (packageName == lastPackage && now - lastAttemptAt < 1500) return
        lastPackage = packageName
        lastAttemptAt = now
        MorphApplication.instance.scope.launch {
            MorphApplication.instance.sentinel.record(policy.capsuleId, policy.phaseId, "RESTRICTED_ACCESS_ATTEMPT", "package=$packageName")
            MorphApplication.instance.session.syncPending()
        }
        startActivity(Intent(this, ShieldActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            putExtra(ShieldActivity.PACKAGE_NAME, packageName)
            putExtra(ShieldActivity.PHASE_TYPE, policy.phaseType.name)
        })
    }

    private fun packageNameForOwnApp() = packageName
    override fun onInterrupt() = Unit
}
