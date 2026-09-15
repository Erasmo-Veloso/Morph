package com.morph.runtime

import com.morph.runtime.domain.Capability
import com.morph.runtime.domain.BubbleStatus
import com.morph.runtime.domain.DeviceEnrollment
import com.morph.runtime.domain.GeoPoint
import com.morph.runtime.domain.AuthorityState
import com.morph.runtime.domain.LessonCapsule
import com.morph.runtime.domain.Phase
import com.morph.runtime.domain.PhaseEngine
import com.morph.runtime.domain.PhaseType
import com.morph.runtime.domain.PolicyState
import com.morph.runtime.domain.RuntimeStage
import com.morph.runtime.domain.SchoolContext
import com.morph.runtime.domain.SchoolBubble
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class PhaseEngineTest {
    @Test
    fun `unenrolled device remains passive after receiving a Capsule`() {
        val engine = PhaseEngine { 1234L }
        engine.receive(capsule())
        engine.markReady()
        engine.setEnrollment(DeviceEnrollment.UNENROLLED)

        assertEquals(RuntimeStage.IDLE, engine.state.value.stage)
        assertEquals(SchoolContext.OUTSIDE_SCHOOL, engine.state.value.schoolContext)
        assertEquals(AuthorityState.PASSIVE, engine.state.value.authority)
        assertTrue(engine.activeCapabilities.value.isEmpty())
    }

    @Test
    fun `phase transition activates new capabilities and end clears policy`() {
        val engine = PhaseEngine { 1234L }
        engine.setEnrollment(DeviceEnrollment.ENROLLED)
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
        assertEquals(RuntimeStage.BREAK, engine.state.value.stage)
        assertTrue(engine.activeCapabilities.value.isEmpty())
        assertEquals(null, PolicyState.current())
        engine.finishBreak()
        assertEquals(RuntimeStage.FINISHED, engine.state.value.stage)
    }

    @Test
    fun `connectivity resolver distinguishes backend and internet reachability`() {
        assertEquals(com.morph.runtime.domain.Connectivity.ONLINE, ConnectivityResolver.resolve(true, true))
        assertEquals(com.morph.runtime.domain.Connectivity.LOCAL, ConnectivityResolver.resolve(true, false))
        assertEquals(com.morph.runtime.domain.Connectivity.ISOLATED, ConnectivityResolver.resolve(false, true))
    }

    @Test
    fun `demo-ready School Bubble starts immediately without location`() {
        val engine = PhaseEngine { 1234L }
        engine.setEnrollment(DeviceEnrollment.ENROLLED)
        engine.receive(capsule(SchoolBubble("bubble", "Colégio Horizonte", GeoPoint(-8.83, 13.23), 180, 100, 300)))
        engine.markReady()

        engine.start()
        assertEquals(RuntimeStage.READY, engine.state.value.stage)
        assertTrue(engine.activeCapabilities.value.isEmpty())

        engine.setBubbleStatus(BubbleStatus.DEMO_READY)
        engine.start()
        assertEquals(RuntimeStage.UNDERSTAND, engine.state.value.stage)

        engine.setBubbleStatus(BubbleStatus.OUTSIDE)
        assertEquals(RuntimeStage.IDLE, engine.state.value.stage)
        assertEquals(SchoolContext.OUTSIDE_SCHOOL, engine.state.value.schoolContext)
        assertEquals(AuthorityState.PASSIVE, engine.state.value.authority)
        assertTrue(engine.activeCapabilities.value.isEmpty())
        assertEquals(null, PolicyState.current())
    }

    @Test
    fun `verified context cancels the unverified expiry deadline`() {
        var now = 1234L
        val engine = PhaseEngine { now }
        engine.setEnrollment(DeviceEnrollment.ENROLLED)
        engine.receive(capsule(SchoolBubble("bubble", "Colégio Horizonte", GeoPoint(-8.83, 13.23), 180, 100, 300)))
        engine.markReady()
        engine.setBubbleStatus(BubbleStatus.DEMO_READY)
        engine.start()
        engine.setSchoolContext(SchoolContext.SCHOOL_UNVERIFIED)
        engine.setSchoolContext(SchoolContext.SCHOOL_VERIFIED)

        now += 300_000L
        assertTrue(!engine.expireUnverifiedContext())
        assertEquals(RuntimeStage.UNDERSTAND, engine.state.value.stage)
    }

    @Test
    fun `unverified context preserves an active capsule until safe expiry or end`() {
        var now = 1234L
        val engine = PhaseEngine { now }
        engine.setEnrollment(DeviceEnrollment.ENROLLED)
        engine.receive(capsule(SchoolBubble("bubble", "Colégio Horizonte", GeoPoint(-8.83, 13.23), 180, 100, 300)))
        engine.markReady()
        engine.setBubbleStatus(BubbleStatus.DEMO_READY)
        engine.start()

        engine.setSchoolContext(SchoolContext.SCHOOL_UNVERIFIED)

        assertEquals(RuntimeStage.UNDERSTAND, engine.state.value.stage)
        assertEquals(SchoolContext.SCHOOL_UNVERIFIED, engine.state.value.schoolContext)
        assertEquals(AuthorityState.CAPSULE_ACTIVE, engine.state.value.authority)
        assertTrue(engine.activeCapabilities.value.contains(Capability.GUIDED_EXPLANATION))

        engine.transitionTo(PhaseType.MEASURE)
        assertEquals(RuntimeStage.MEASURE, engine.state.value.stage)
        assertTrue(engine.activeCapabilities.value.contains(Capability.ACCELEROMETER))

        now += 300_000L
        assertTrue(engine.expireUnverifiedContext())
        assertEquals(RuntimeStage.BREAK, engine.state.value.stage)
        assertTrue(engine.activeCapabilities.value.isEmpty())
        assertEquals(null, PolicyState.current())
    }

    @Test
    fun `outside context stays passive when verified context returns`() {
        val engine = PhaseEngine { 1234L }
        engine.setEnrollment(DeviceEnrollment.ENROLLED)
        engine.receive(capsule(SchoolBubble("bubble", "Colégio Horizonte", GeoPoint(-8.83, 13.23), 180, 100, 300)))
        engine.markReady()
        engine.setBubbleStatus(BubbleStatus.DEMO_READY)
        engine.start()

        engine.setSchoolContext(SchoolContext.OUTSIDE_SCHOOL)
        assertEquals(RuntimeStage.IDLE, engine.state.value.stage)
        assertEquals(AuthorityState.PASSIVE, engine.state.value.authority)
        assertEquals(null, PolicyState.current())

        engine.setSchoolContext(SchoolContext.SCHOOL_VERIFIED)
        assertEquals(RuntimeStage.IDLE, engine.state.value.stage)
        assertEquals(AuthorityState.SCHOOL_IDLE, engine.state.value.authority)
        assertEquals(false, engine.state.value.running)
        assertEquals(null, PolicyState.current())
    }

    @Test
    fun `each phase exposes only its pedagogical applications`() {
        val engine = PhaseEngine { 1234L }
        engine.setEnrollment(DeviceEnrollment.ENROLLED)
        engine.receive(capsule())
        engine.markReady()
        engine.start()
        assertTrue(PolicyState.current()?.allowedPackages.orEmpty().isEmpty())

        engine.transitionTo(PhaseType.MEASURE)
        assertTrue(PolicyState.current()?.allowedPackages.orEmpty().contains("com.sec.android.app.popupcalculator"))
        assertTrue(PolicyState.current()?.allowedPackages.orEmpty().contains("com.samsung.android.app.notes"))

        engine.transitionTo(PhaseType.ANALYSE)
        assertEquals(setOf("com.android.chrome"), PolicyState.current()?.allowedPackages)
    }

    private fun capsule(schoolBubble: SchoolBubble? = null) = LessonCapsule(
        id = "test", version = 1, objective = "Movimento acelerado", phases = listOf(
            Phase("understand", PhaseType.UNDERSTAND, "Compreender", 5, setOf(Capability.LEARNING_CONTENT, Capability.GUIDED_EXPLANATION), emptySet(), emptySet()),
            Phase("measure", PhaseType.MEASURE, "Experimentar", 10, setOf(Capability.ACCELEROMETER), setOf("com.example.distraction"), emptySet()),
            Phase("analyse", PhaseType.ANALYSE, "Analisar", 10, setOf(Capability.GRAPH), emptySet(), emptySet())
        ), integrityMonitoring = true, offlineExecution = true,
        validFrom = "2026-09-12T00:00:00Z", validUntil = "2026-09-13T00:00:00Z", signature = "demo", schoolBubble = schoolBubble
    )
}
