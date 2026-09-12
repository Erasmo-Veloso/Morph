package com.morph.runtime

import android.util.Log
import com.morph.runtime.domain.Connectivity
import com.morph.runtime.domain.LessonRuntime
import com.morph.runtime.domain.PhaseEngine
import com.morph.runtime.domain.PhaseType
import com.morph.runtime.data.SentinelRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.util.concurrent.ConcurrentHashMap

class SessionClient(
    private val runtime: LessonRuntime,
    private val sentinel: SentinelRepository,
    private val scope: CoroutineScope,
    private val connectivityMonitor: ConnectivityMonitor,
    private val serverUrl: String = BuildConfig.MORPH_SERVER_URL
) {
    private val engine: PhaseEngine get() = runtime.phaseEngine
    private val client = OkHttpClient()
    private var socket: WebSocket? = null
    private var reconnectJob: Job? = null
    private var closed = false
    private var serverReachable = false
    private val inFlight = ConcurrentHashMap.newKeySet<String>()

    fun connect() {
        closed = false
        Log.i(TAG, "A ligar ao realtime: $serverUrl")
        connectivityMonitor.start { updateConnectivity() }
        socket = client.newWebSocket(Request.Builder().url(serverUrl).build(), object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) { Log.i(TAG, "Realtime ligado"); reconnectJob?.cancel(); serverReachable = true; updateConnectivity(); sendDeviceStatus(); flushPending(webSocket) }
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) { serverReachable = false; updateConnectivity(); Log.w(TAG, "Realtime indisponível", t); scheduleReconnect() }
            override fun onMessage(webSocket: WebSocket, text: String) { handle(webSocket, text) }
            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) { Log.i(TAG, "Realtime fechado: $code $reason"); serverReachable = false; updateConnectivity(); scheduleReconnect() }
        })
    }

    fun close() { closed = true; serverReachable = false; reconnectJob?.cancel(); connectivityMonitor.stop(); socket?.close(1000, "runtime closed") }

    private fun scheduleReconnect() {
        if (closed || reconnectJob?.isActive == true) return
        reconnectJob = scope.launch {
            delay(1500)
            if (!closed) connect()
        }
    }

    private fun handle(webSocket: WebSocket, raw: String) {
        runCatching {
            val message = JSONObject(raw)
            when (message.getString("type")) {
                "capsule:assigned" -> {
                    runtime.receive(message.getJSONObject("capsule").toString())
                    runtime.markReady()
                    updateConnectivity()
                    sendDeviceStatus()
                }
                "session:state" -> {
                    if (message.optBoolean("running")) {
                        engine.transitionTo(PhaseType.valueOf(message.getString("phase")))
                    } else if (message.optString("phase") == "FINISHED") {
                        engine.end()
                    }
                }
                "session:started" -> engine.start()
                "phase:changed" -> { engine.transitionTo(PhaseType.valueOf(message.getJSONObject("phase").getString("type"))); sendDeviceStatus() }
                "session:ended" -> engine.end()
                "session:ack" -> message.optString("eventId").takeIf { it.isNotBlank() }?.let { eventId ->
                    inFlight.remove(eventId)
                    scope.launch { sentinel.markSynced(eventId) }
                }
            }
        }.onFailure { Log.e(TAG, "Mensagem realtime inválida", it) }
    }

    private fun updateConnectivity() {
        val next = ConnectivityResolver.resolve(serverReachable, connectivityMonitor.hasValidatedInternet())
        if (engine.state.value.connectivity == next) return
        engine.setConnectivity(next)
        val state = engine.state.value
        val capsuleId = state.capsuleId ?: return
        scope.launch {
            sentinel.record(capsuleId, state.currentPhase?.id ?: "none", "CONNECTIVITY_CHANGED", "state=$next")
            syncPending()
        }
        sendDeviceStatus()
    }

    private fun sendDeviceStatus() {
        val state = engine.state.value
        socket?.send(JSONObject().put("type", "device:status").put("studentId", "demo-student")
            .put("capsuleId", state.capsuleId).put("phase", state.currentPhase?.type?.name)
            .put("connectivity", state.connectivity.name).put("integrity", state.integrity.name)
            .put("lastSeen", System.currentTimeMillis()).toString())
    }

    fun syncPending() {
        val webSocket = socket ?: return
        flushPending(webSocket)
    }

    private fun flushPending(webSocket: WebSocket) = scope.launch(Dispatchers.IO) {
        sentinel.pending().forEach { event ->
            if (!inFlight.add(event.id)) return@forEach
            val sent = webSocket.send(JSONObject().put("type", "sentinel:event").put("event", JSONObject()
                .put("id", event.id).put("studentId", event.studentId).put("capsuleId", event.capsuleId)
                .put("phaseId", event.phaseId).put("type", event.type).put("occurredAt", event.occurredAt)
                .put("payload", event.payload)).toString())
            if (!sent) inFlight.remove(event.id)
        }
    }

    companion object { private const val TAG = "MorphSession" }
}
