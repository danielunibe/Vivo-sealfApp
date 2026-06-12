package com.davidsanchez.vivopromotor.nativeapp.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "devices")
data class NativeDeviceEntity(
    @PrimaryKey val id: String,
    val name: String,
    val margin: Double,
    val active: Boolean = true,
    val series: String? = null,
    val description: String? = null,
    val specs: String? = null,
    val colorsJson: String? = null,
    val imageDataUrl: String? = null,
    val imageUrl: String? = null,
    val knowledgeJson: String? = null,
    val createdAt: Long? = null,
    val updatedAt: Long? = null
)

@Entity(tableName = "sales")
data class NativeSaleEntity(
    @PrimaryKey val id: String,
    val date: String,
    val deviceId: String,
    val deviceName: String,
    val deviceColor: String? = null,
    val amountEarned: Double,
    val createdAt: Long,
    val day: Int
)

@Entity(tableName = "movements")
data class NativeMovementEntity(
    @PrimaryKey val id: String,
    val type: String,
    val source: String,
    val title: String,
    val amount: Double,
    val date: String,
    val effectiveDate: String? = null,
    val createdAt: Long,
    val saleId: String? = null
)

@Entity(tableName = "manual_day_records")
data class NativeManualDayRecordEntity(
    @PrimaryKey val date: String,
    val workDayStatus: String,
    val salesDayStatus: String,
    val manualStatus: Boolean = false,
    val totalEarned: Double,
    val soldDevicesJson: String,
    val updatedAt: String
)

@Entity(tableName = "native_migration_state")
data class NativeMigrationStateEntity(
    @PrimaryKey val id: String = "current",
    val nativeMigrationDone: Boolean,
    val source: String,
    val migratedAt: String,
    val warningsJson: String = "[]"
)

data class NativePiggyGoals(
    val daily: Double = 300.0,
    val weekly: Double = 1500.0,
    val monthly: Double = 6500.0,
    val yearly: Double = 78000.0,
    val dailyDeviceGoal: Int = 3
)

data class NativeUserProfile(
    val name: String = "",
    val store: String = ""
)
