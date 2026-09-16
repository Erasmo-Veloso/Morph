package com.morph.runtime

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PolicyDecisionTest {
    private val systemPackages = setOf("android", "com.android.systemui", "com.android.launcher3")

    @Test
    fun `allows Morph authorised apps and Android essentials`() {
        assertTrue(PolicyDecision.isAllowed("com.morph.runtime", "com.morph.runtime", setOf(), systemPackages))
        assertTrue(PolicyDecision.isAllowed("com.example.school-tool", "com.morph.runtime", setOf("com.example.school-tool"), systemPackages))
        assertTrue(PolicyDecision.isAllowed("com.android.launcher3", "com.morph.runtime", setOf(), systemPackages))
    }

    @Test
    fun `denies unknown games and unapproved applications by default`() {
        assertFalse(PolicyDecision.isAllowed("com.example.game", "com.morph.runtime", setOf("com.example.school-tool"), systemPackages))
        assertFalse(PolicyDecision.isAllowed("com.android.settings", "com.morph.runtime", setOf(), systemPackages))
    }
}
