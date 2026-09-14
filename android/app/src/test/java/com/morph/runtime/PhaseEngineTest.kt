package com.morph.runtime

import com.morph.runtime.domain.Capability
import com.morph.runtime.domain.BubbleStatus
import com.morph.runtime.domain.GeoPoint
import com.morph.runtime.domain.LessonCapsule
import com.morph.runtime.domain.Phase
import com.morph.runtime.domain.PhaseEngine
import com.morph.runtime.domain.PhaseType
import com.morph.runtime.domain.PolicyState
import com.morph.runtime.domain.RuntimeStage
import com.morph.runtime.domain.SchoolBubble
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class PhaseEngineTest {
    @Test
    fun `phase transition activates new capabilities and end clears policy`() {
        val engine = PhaseEngine { 1234L }
        engine.receive(capsule())
        assertEquals(RuntimeStage.CAPSULE_RECEIVED, engine.state.value.stage)
        engine.markReady()
        assertEquals(RuntimeStage.READY, engine.state.value.stage)

        engine.start()
        assertEquals(RuntimeStage.UNDERSTAND, engine.state.value.stage)
        assertTrue(engine.activeCapabilities.value.contains(Capability.GUIDED_EXPLANATION))

        engine.transitionTo(PhaseType.MEASURE)
        assertEquals(RuntimeStage.MEASURE, engine.state.value.stage)
        assertTrue(engine.activeCapabilities.value.contains(Capability.ACCELEROMETER))
        assertEquals(1234L, engine.state.value.monotonicStartedAtMs)

        engine.end()
        assertEquals(RuntimeStage.FINISHED, engine.state.value.stage)
        assertTrue(engine.activeCapabilities.value.isEmpty())
        assertEquals(null, PolicyState.current())
    }

    @Test
    fun `connectivity resolver distinguishes backend and internet reachability`() {
        assertEquals(com.morph.runtime.domain.Connectivity.ONLINE, ConnectivityResolver.resolve(true, true))
        assertEquals(com.morph.runtime.domain.Connectivity.LOCAL, ConnectivityResolver.resolve(true, false))
        assertEquals(com.morph.runtime.domain.Connectivity.ISOLATED, ConnectivityResolver.resolve(false, true))
    }

    @Test
    fun `school bubble only applies policy inside its boundary`() {
        val engine = PhaseEngine { 1234L }
        engine.receive(capsule(SchoolBubble("bubble", "Colégio Horizonte", GeoPoint(-8.83, 13.23), 180, 100, 300)))
        engine.markReady()

        engine.start()
        assertEquals(RuntimeStage.READY, engine.state.value.stage)
        assertTrue(engine.activeCapabilities.value.isEmpty())

        engine.setBubbleStatus(BubbleStatus.INSIDE)
        engine.start()
        assertEquals(RuntimeStage.UNDERSTAND, engine.state.value.stage)

        engine.setBubbleStatus(BubbleStatus.OUTSIDE)
        assertEquals(RuntimeStage.READY, engine.state.value.stage)
        assertTrue(engine.activeCapabilities.value.isEmpty())
        assertEquals(null, PolicyState.current())
    }

    private fun capsule(schoolBubble: SchoolBubble? = null) = LessonCapsule(
        id = "test", version = 1, objective = "Movimento acelerado", phases = listOf(
            Phase("understand", PhaseType.UNDERSTAND, "Compreender", 5, setOf(Capability.LEARNING_CONTENT, Capability.GUIDED_EXPLANATION), emptySet(), emptySet()),
            Phase("measure", PhaseType.MEASURE, "Experimentar", 10, setOf(Capability.ACCELEROMETER), setOf("com.example.distraction"), emptySet())
        ), integrityMonitoring = true, offlineExecution = true,
        validFrom = "2026-09-12T00:00:00Z", validUntil = "2026-09-13T00:00:00Z", signature = "demo", schoolBubble = schoolBubble
    )
}
