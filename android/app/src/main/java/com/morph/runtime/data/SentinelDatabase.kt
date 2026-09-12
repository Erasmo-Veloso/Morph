package com.morph.runtime.data

import android.content.Context
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "sentinel_events")
data class SentinelEventEntity(
    @androidx.room.PrimaryKey val id: String,
    val studentId: String,
    val capsuleId: String,
    val phaseId: String,
    val type: String,
    val occurredAt: Long,
    val payload: String,
    val synced: Boolean = false
)

@Dao
interface SentinelEventDao {
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(event: SentinelEventEntity)

    @Query("SELECT * FROM sentinel_events WHERE synced = 0 ORDER BY occurredAt ASC")
    suspend fun pending(): List<SentinelEventEntity>

    @Query("UPDATE sentinel_events SET synced = 1 WHERE id = :id")
    suspend fun markSynced(id: String)

    @Query("SELECT COUNT(*) FROM sentinel_events WHERE synced = 0")
    fun pendingCount(): Flow<Int>
}

@Database(entities = [SentinelEventEntity::class], version = 1, exportSchema = false)
abstract class SentinelDatabase : RoomDatabase() {
    abstract fun events(): SentinelEventDao

    companion object {
        @Volatile private var instance: SentinelDatabase? = null
        fun get(context: Context): SentinelDatabase = instance ?: synchronized(this) {
            instance ?: Room.databaseBuilder(context, SentinelDatabase::class.java, "morph-sentinel.db").build().also { instance = it }
        }
    }
}

