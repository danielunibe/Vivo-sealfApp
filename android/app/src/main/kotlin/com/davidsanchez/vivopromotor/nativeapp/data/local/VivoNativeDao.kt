package com.davidsanchez.vivopromotor.nativeapp.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeDeviceEntity
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeManualDayRecordEntity
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeMigrationStateEntity
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeMovementEntity
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeSaleEntity

@Dao
interface VivoNativeDao {
    @Query("SELECT * FROM sales ORDER BY createdAt DESC")
    suspend fun getSales(): List<NativeSaleEntity>

    @Query("SELECT * FROM movements ORDER BY createdAt DESC")
    suspend fun getMovements(): List<NativeMovementEntity>

    @Query("SELECT * FROM devices ORDER BY name ASC")
    suspend fun getDevices(): List<NativeDeviceEntity>

    @Query("SELECT * FROM manual_day_records")
    suspend fun getManualDayRecords(): List<NativeManualDayRecordEntity>

    @Query("SELECT * FROM native_migration_state WHERE id = 'current' LIMIT 1")
    suspend fun getMigrationState(): NativeMigrationStateEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertSales(items: List<NativeSaleEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertMovements(items: List<NativeMovementEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertDevices(items: List<NativeDeviceEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertManualDayRecords(items: List<NativeManualDayRecordEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertMigrationState(state: NativeMigrationStateEntity)

    @Transaction
    suspend fun importBackupSnapshot(
        sales: List<NativeSaleEntity>,
        movements: List<NativeMovementEntity>,
        devices: List<NativeDeviceEntity>,
        manualDayRecords: List<NativeManualDayRecordEntity>,
        migrationState: NativeMigrationStateEntity
    ) {
        upsertSales(sales)
        upsertMovements(movements)
        upsertDevices(devices)
        upsertManualDayRecords(manualDayRecords)
        upsertMigrationState(migrationState)
    }
}
