package com.morph.runtime.domain

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class CapabilityManager {
    private val _active = MutableStateFlow<Set<Capability>>(emptySet())
    val active: StateFlow<Set<Capability>> = _active.asStateFlow()

    fun activate(capabilities: Set<Capability>) { _active.value = capabilities }
    fun clear() { _active.value = emptySet() }
}

