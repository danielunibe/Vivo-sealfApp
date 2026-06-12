package com.davidsanchez.vivopromotor.nativeapp.data.backup

import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeDeviceEntity
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeManualDayRecordEntity
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeMigrationStateEntity
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeMovementEntity
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativePiggyGoals
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeSaleEntity
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeUserProfile
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant

object VivoBackupJsonParser {
    fun parse(json: String): NativeBackupSnapshot {
        val root = JSONObject(json)
        require(root.optString("app") == "vivo-promotor") {
            "Este respaldo no pertenece a Vivo Promotor."
        }
        require(root.optInt("version") == 1) {
            "Version de respaldo no soportada."
        }

        val payload = root.optJSONObject("payload") ?: JSONObject()
        val raw = payload.optJSONObject("raw")
        val settings = payload.optJSONObject("settings")

        return NativeBackupSnapshot(
            exportedAt = root.optString("exportedAt"),
            source = root.optString("source", "backup-json"),
            sales = payload.optJSONArray("sales").toSales(),
            movements = payload.optJSONArray("movements").toMovements(),
            devices = payload.optJSONArray("devices").toDevices(),
            manualDayRecords = settings?.optJSONObject("manualDayRecords").toManualDayRecords(),
            goals = payload.optJSONObject("goals").toPiggyGoals(),
            userProfile = payload.optJSONObject("profile").toUserProfile(
                fallbackName = raw?.optString("vivo_userName").orEmpty(),
                fallbackStore = raw?.optString("vivo_userStore").orEmpty()
            ),
            theme = payload.optStringOrNull("theme")
                ?: raw?.optString("vivo_theme")
                ?: "light",
            migrationState = NativeMigrationStateEntity(
                nativeMigrationDone = true,
                source = "backup-json-v1",
                migratedAt = Instant.now().toString()
            )
        )
    }

    private fun JSONArray?.toSales(): List<NativeSaleEntity> {
        if (this == null) return emptyList()
        return (0 until length()).mapNotNull { index ->
            optJSONObject(index)?.let { item ->
                NativeSaleEntity(
                    id = item.optString("id"),
                    date = item.optString("date"),
                    deviceId = item.optString("deviceId"),
                    deviceName = item.optString("deviceName"),
                    deviceColor = item.optStringOrNull("deviceColor"),
                    amountEarned = item.optDouble("amountEarned", 0.0),
                    createdAt = item.optLong("createdAt", 0L),
                    day = item.optInt("day", 0)
                )
            }
        }.filter { it.id.isNotBlank() }
    }

    private fun JSONArray?.toMovements(): List<NativeMovementEntity> {
        if (this == null) return emptyList()
        return (0 until length()).mapNotNull { index ->
            optJSONObject(index)?.let { item ->
                NativeMovementEntity(
                    id = item.optString("id"),
                    type = item.optString("type"),
                    source = item.optString("source"),
                    title = item.optString("title"),
                    amount = item.optDouble("amount", 0.0),
                    date = item.optString("date"),
                    effectiveDate = item.optStringOrNull("effectiveDate"),
                    createdAt = item.optLong("createdAt", 0L),
                    saleId = item.optStringOrNull("saleId")
                )
            }
        }.filter { it.id.isNotBlank() }
    }

    private fun JSONArray?.toDevices(): List<NativeDeviceEntity> {
        if (this == null) return emptyList()
        return (0 until length()).mapNotNull { index ->
            optJSONObject(index)?.let { item ->
                NativeDeviceEntity(
                    id = item.optString("id"),
                    name = item.optString("name"),
                    margin = item.optDouble("margin", 0.0),
                    active = item.optBoolean("active", true),
                    series = item.optStringOrNull("series"),
                    description = item.optStringOrNull("description"),
                    specs = item.optStringOrNull("specs"),
                    colorsJson = item.optJSONArray("colors")?.toString(),
                    imageDataUrl = item.optStringOrNull("imageDataUrl"),
                    imageUrl = item.optStringOrNull("imageUrl"),
                    knowledgeJson = item.optJSONObject("knowledge")?.toString(),
                    createdAt = item.optNullableLong("createdAt"),
                    updatedAt = item.optNullableLong("updatedAt")
                )
            }
        }.filter { it.id.isNotBlank() }
    }

    private fun JSONObject?.toPiggyGoals(): NativePiggyGoals {
        if (this == null) return NativePiggyGoals()
        return NativePiggyGoals(
            daily = optDouble("daily", 300.0),
            weekly = optDouble("weekly", 1500.0),
            monthly = optDouble("monthly", 6500.0),
            yearly = optDouble("yearly", 78000.0),
            dailyDeviceGoal = optInt("dailyDeviceGoal", 3)
        )
    }

    private fun JSONObject?.toUserProfile(fallbackName: String, fallbackStore: String): NativeUserProfile {
        if (this == null) {
            return NativeUserProfile(name = fallbackName, store = fallbackStore)
        }
        return NativeUserProfile(
            name = optString("name", fallbackName),
            store = optString("store", fallbackStore)
        )
    }

    private fun JSONObject?.toManualDayRecords(): List<NativeManualDayRecordEntity> {
        if (this == null) return emptyList()
        return keys().asSequence().mapNotNull { date ->
            optJSONObject(date)?.let { item ->
                NativeManualDayRecordEntity(
                    date = date,
                    workDayStatus = item.optString("workDayStatus"),
                    salesDayStatus = item.optString("salesDayStatus"),
                    manualStatus = item.optBoolean("manualStatus", false),
                    totalEarned = item.optDouble("totalEarned", 0.0),
                    soldDevicesJson = item.optJSONArray("soldDevices")?.toString() ?: "[]",
                    updatedAt = item.optString("updatedAt")
                )
            }
        }.toList()
    }

    private fun JSONObject.optStringOrNull(name: String): String? {
        if (!has(name) || isNull(name)) return null
        return optString(name).takeIf { it.isNotBlank() }
    }

    private fun JSONObject.optNullableLong(name: String): Long? {
        if (!has(name) || isNull(name)) return null
        return optLong(name)
    }
}

data class NativeBackupSnapshot(
    val exportedAt: String,
    val source: String,
    val sales: List<NativeSaleEntity>,
    val movements: List<NativeMovementEntity>,
    val devices: List<NativeDeviceEntity>,
    val manualDayRecords: List<NativeManualDayRecordEntity>,
    val goals: NativePiggyGoals,
    val userProfile: NativeUserProfile,
    val theme: String,
    val migrationState: NativeMigrationStateEntity
)
