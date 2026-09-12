package com.morph.runtime

import android.app.Application
import com.morph.runtime.data.SentinelRepository
import com.morph.runtime.domain.PhaseEngine
import com.morph.runtime.domain.LessonRuntime
import com.morph.runtime.sensor.AccelerometerEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel

class MorphApplication : Application() {
    val scope = CoroutineScope(SupervisorJob())
    val sentinel by lazy { SentinelRepository(this) }
    val runtime by lazy { LessonRuntime() }
    val engine get() = runtime.phaseEngine
    val accelerometer by lazy { AccelerometerEngine(this) }
    val connectivityMonitor by lazy { ConnectivityMonitor(this) }
    val session by lazy { SessionClient(runtime, sentinel, scope, connectivityMonitor) }

    override fun onCreate() {
        super.onCreate()
        instance = this
        session.connect()
    }

    override fun onTerminate() {
        accelerometer.stop()
        connectivityMonitor.stop()
        session.close()
        scope.cancel()
        super.onTerminate()
    }

    companion object { lateinit var instance: MorphApplication; private set }
}
