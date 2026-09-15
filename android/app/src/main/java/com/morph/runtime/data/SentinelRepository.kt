package com.morph.runtime.data

import android.content.Context
import com.morph.runtime.domain.SentinelEventType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.util.UUID

class SentinelRepository(context: Context, private val studentId: () -> String) {
    private val dao = SentinelDatabase.get(context).events()
    val pendingCount: Flow<Int> = dao.pendingCount()

    suspend fun record(capsuleId: String, phaseId: String, type: SentinelEventType, payload: String): String = withContext(Dispatchers.IO) {
        val event = SentinelEventEntity(UUID.randomUUID().toString(), studentId(), capsuleId, phaseId, type.name, System.currentTimeMillis(), payload)
        dao.insert(event)
        event.id
    }

    suspend fun markSynced(id: String) = withContext(Dispatchers.IO) { dao.markSynced(id) }
    suspend fun pending() = withContext(Dispatchers.IO) { dao.pending() }
}
