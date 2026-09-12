package com.morph.runtime.sensor

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.sqrt

class AccelerometerEngine(context: Context) : SensorEventListener {
    private val manager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val sensor = manager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val _samples = MutableStateFlow<List<Float>>(emptyList())
    private val _magnitude = MutableStateFlow(0f)
    private val _active = MutableStateFlow(false)
    val samples: StateFlow<List<Float>> = _samples.asStateFlow()
    val magnitude: StateFlow<Float> = _magnitude.asStateFlow()
    val active: StateFlow<Boolean> = _active.asStateFlow()

    fun start() {
        if (_active.value || sensor == null) return
        manager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_GAME)
        _active.value = true
    }

    fun stop() {
        manager.unregisterListener(this)
        _active.value = false
    }

    override fun onSensorChanged(event: SensorEvent) {
        val x = event.values.getOrNull(0) ?: return
        val y = event.values.getOrNull(1) ?: return
        val z = event.values.getOrNull(2) ?: return
        val value = sqrt(x * x + y * y + z * z)
        _magnitude.value = value
        _samples.value = (_samples.value + value).takeLast(90)
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
}

