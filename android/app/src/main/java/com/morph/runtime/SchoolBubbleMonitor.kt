package com.morph.runtime

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Looper
import android.os.Handler
import com.morph.runtime.domain.BubbleStatus
import com.morph.runtime.domain.SchoolBubble
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Local-only campus eligibility monitor. It deliberately retains no locations:
 * the runtime only receives the derived inside/outside/unknown state.
 */
class SchoolBubbleMonitor(private val context: Context) : LocationListener {
    private val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    private val _status = MutableStateFlow(BubbleStatus.NOT_REQUIRED)
    val status: StateFlow<BubbleStatus> = _status.asStateFlow()

    private var bubble: SchoolBubble? = null
    private var lastConfirmedInsideAtMs: Long? = null
    private val handler = Handler(Looper.getMainLooper())
    private var graceExpiry: Runnable? = null

    fun updateBubble(value: SchoolBubble?) {
        bubble = value
        lastConfirmedInsideAtMs = null
        clearGraceExpiry()
        if (value == null) {
            stop()
            _status.value = BubbleStatus.NOT_REQUIRED
            return
        }
        refresh()
    }

    fun refresh() {
        val currentBubble = bubble ?: run { _status.value = BubbleStatus.NOT_REQUIRED; return }
        if (!hasLocationPermission()) {
            _status.value = BubbleStatus.UNKNOWN
            return
        }
        if (providers().isEmpty()) {
            markUnknown()
            return
        }
        _status.value = BubbleStatus.CHECKING
        evaluateBestLastKnown(currentBubble)
        requestUpdates()
    }

    fun stop() {
        clearGraceExpiry()
        runCatching { locationManager.removeUpdates(this) }
    }

    override fun onLocationChanged(location: Location) {
        bubble?.let { evaluate(it, location) }
    }

    override fun onProviderDisabled(provider: String) = markUnknown()

    private fun hasLocationPermission() =
        context.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            context.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

    @SuppressLint("MissingPermission")
    private fun evaluateBestLastKnown(currentBubble: SchoolBubble) {
        val location = providers().mapNotNull { provider -> runCatching { locationManager.getLastKnownLocation(provider) }.getOrNull() }
            .minByOrNull { it.accuracy }
        if (location != null && System.currentTimeMillis() - location.time <= 5 * 60 * 1000L) evaluate(currentBubble, location)
        else markUnknown()
    }

    @SuppressLint("MissingPermission")
    private fun requestUpdates() {
        providers().forEach { provider ->
            runCatching {
                locationManager.requestLocationUpdates(provider, 30_000L, 15f, this, Looper.getMainLooper())
            }
        }
    }

    private fun providers() = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)
        .filter { runCatching { locationManager.isProviderEnabled(it) }.getOrDefault(false) }

    private fun evaluate(currentBubble: SchoolBubble, location: Location) {
        if (!location.hasAccuracy() || location.accuracy > currentBubble.maxAccuracyMeters) {
            markUnknown()
            return
        }
        val campus = Location("school-bubble").apply {
            latitude = currentBubble.center.latitude
            longitude = currentBubble.center.longitude
        }
        // Accuracy is considered only at the perimeter, avoiding false exits near it.
        val allowedRadius = currentBubble.radiusMeters + minOf(location.accuracy, 35f)
        if (location.distanceTo(campus) <= allowedRadius) {
            lastConfirmedInsideAtMs = System.currentTimeMillis()
            clearGraceExpiry()
            _status.value = BubbleStatus.INSIDE
        } else {
            clearGraceExpiry()
            _status.value = BubbleStatus.OUTSIDE
        }
    }

    private fun markUnknown() {
        val graceMs = (bubble?.unknownLocationGraceSeconds ?: 0) * 1000L
        val lastInside = lastConfirmedInsideAtMs
        val elapsed = lastInside?.let { System.currentTimeMillis() - it } ?: Long.MAX_VALUE
        if (elapsed <= graceMs) {
            _status.value = BubbleStatus.INSIDE
            clearGraceExpiry()
            val expiry = Runnable { markUnknown() }
            graceExpiry = expiry
            handler.postDelayed(expiry, graceMs - elapsed + 1L)
        } else {
            clearGraceExpiry()
            _status.value = BubbleStatus.UNKNOWN
        }
    }

    private fun clearGraceExpiry() {
        graceExpiry?.let(handler::removeCallbacks)
        graceExpiry = null
    }
}
