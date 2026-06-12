package com.davidsanchez.vivopromotor.nativeapp.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeDeviceEntity
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeManualDayRecordEntity
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeMigrationStateEntity
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeMovementEntity
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeSaleEntity

@Database(
    entities = [
        NativeDeviceEntity::class,
        NativeSaleEntity::class,
        NativeMovementEntity::class,
        NativeManualDayRecordEntity::class,
        NativeMigrationStateEntity::class
    ],
    version = 2,
    exportSchema = false
)
abstract class VivoNativeDatabase : RoomDatabase() {
    abstract fun vivoNativeDao(): VivoNativeDao

    companion object {
        private val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(database: SupportSQLiteDatabase) {
                database.execSQL("ALTER TABLE movements ADD COLUMN effectiveDate TEXT")
            }
        }

        @Volatile
        private var instance: VivoNativeDatabase? = null

        fun getInstance(context: Context): VivoNativeDatabase {
            return instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    VivoNativeDatabase::class.java,
                    "vivo-promotor-native.db"
                ).addMigrations(MIGRATION_1_2)
                    .build()
                    .also { instance = it }
            }
        }
    }
}
