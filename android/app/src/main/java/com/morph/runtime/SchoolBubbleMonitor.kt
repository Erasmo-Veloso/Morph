package com.morph.runtime

import com.morph.runtime.domain.BubbleStatus
import com.morph.runtime.domain.SchoolBubble
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Pitch-safe School Bubble adapter.
 *
 * The production contract continues to carry the Bubble, but the hackathon APK
 * does not request, read or wait for device location. Receiving a configured
 * Bubble immediately makes the demo session eligible and reports that fact as
 * DEMO_READY. A GPS evaluator can replace this adapter after the pitch.
 */
class SchoolBubbleMonitor {
    private val _status = MutableStateFlow(BubbleStatus.NOT_REQUIRED)
    val status: StateFlow<BubbleStatus> = _status.asStateFlow()

    fun updateBubble(value: SchoolBubble?) {
        _status.value = if (value == null) BubbleStatus.NOT_REQUIRED else BubbleStatus.DEMO_READY
    }

    fun refresh() = Unit
    fun stop() = Unit
}
