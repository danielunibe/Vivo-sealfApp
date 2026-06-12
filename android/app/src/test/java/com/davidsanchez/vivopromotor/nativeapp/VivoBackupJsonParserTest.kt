package com.davidsanchez.vivopromotor.nativeapp

import com.davidsanchez.vivopromotor.nativeapp.data.backup.VivoBackupJsonParser
import org.junit.Assert.assertEquals
import org.junit.Test

class VivoBackupJsonParserTest {
    @Test
    fun parsesBackupJsonV1() {
        val json = """
            {
              "app": "vivo-promotor",
              "version": 1,
              "exportedAt": "2026-06-06T00:00:00.000Z",
              "source": "hybrid",
              "payload": {
                "sales": [
                  {
                    "id": "sale-1",
                    "date": "2026-06-06",
                    "deviceId": "v60-lite",
                    "deviceName": "V60 LITE",
                    "deviceColor": "Rosa Pop",
                    "amountEarned": 500,
                    "createdAt": 1780700000000,
                    "day": 6
                  }
                ],
                "movements": [
                  {
                    "id": "movement-1",
                    "type": "income",
                    "source": "sale",
                    "title": "Venta de V60 LITE",
                    "amount": 500,
                    "date": "06 jun 2026, 10:00",
                    "effectiveDate": "2026-06-06",
                    "createdAt": 1780700000000,
                    "saleId": "sale-1"
                  }
                ],
                "devices": [
                  {
                    "id": "v60-lite",
                    "name": "V60 LITE",
                    "margin": 500,
                    "active": true
                  }
                ],
                "goals": {
                  "daily": 300,
                  "weekly": 1500,
                  "monthly": 6500,
                  "yearly": 78000,
                  "dailyDeviceGoal": 3
                },
                "profile": {
                  "name": "Daniel",
                  "store": "Zona Centro"
                },
                "settings": {
                  "manualDayRecords": {}
                },
                "theme": "dark",
                "raw": {
                  "vivo_userName": "Daniel",
                  "vivo_userStore": "Zona Centro"
                }
              }
            }
        """.trimIndent()

        val snapshot = VivoBackupJsonParser.parse(json)

        assertEquals(1, snapshot.sales.size)
        assertEquals("V60 LITE", snapshot.sales.first().deviceName)
        assertEquals("2026-06-06", snapshot.movements.first().effectiveDate)
        assertEquals(1, snapshot.devices.size)
        assertEquals("dark", snapshot.theme)
        assertEquals("Daniel", snapshot.userProfile.name)
        assertEquals(true, snapshot.migrationState.nativeMigrationDone)
    }
}
