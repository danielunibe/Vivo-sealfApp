package com.davidsanchez.vivopromotor.nativeapp.data.preferences

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.doublePreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativePiggyGoals
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeUserProfile
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.vivoDataStore by preferencesDataStore(name = "vivo_native_preferences")

class VivoNativePreferences(private val context: Context) {
    val snapshot: Flow<VivoPreferenceSnapshot> = context.vivoDataStore.data.map { preferences ->
        VivoPreferenceSnapshot(
            theme = preferences[Keys.theme] ?: "light",
            userProfile = NativeUserProfile(
                name = preferences[Keys.userName] ?: "",
                store = preferences[Keys.userStore] ?: ""
            ),
            goals = NativePiggyGoals(
                daily = preferences[Keys.goalDaily] ?: 300.0,
                weekly = preferences[Keys.goalWeekly] ?: 1500.0,
                monthly = preferences[Keys.goalMonthly] ?: 6500.0,
                yearly = preferences[Keys.goalYearly] ?: 78000.0,
                dailyDeviceGoal = preferences[Keys.dailyDeviceGoal] ?: 3
            ),
            soundsEnabled = preferences[Keys.soundsEnabled] ?: false,
            hapticsEnabled = preferences[Keys.hapticsEnabled] ?: true,
            reducedMotion = preferences[Keys.reducedMotion] ?: false,
            nativeMigrationDone = preferences[Keys.nativeMigrationDone] ?: false
        )
    }

    suspend fun saveSnapshot(snapshot: VivoPreferenceSnapshot) {
        context.vivoDataStore.edit { preferences ->
            preferences[Keys.theme] = snapshot.theme
            preferences[Keys.userName] = snapshot.userProfile.name
            preferences[Keys.userStore] = snapshot.userProfile.store
            preferences[Keys.goalDaily] = snapshot.goals.daily
            preferences[Keys.goalWeekly] = snapshot.goals.weekly
            preferences[Keys.goalMonthly] = snapshot.goals.monthly
            preferences[Keys.goalYearly] = snapshot.goals.yearly
            preferences[Keys.dailyDeviceGoal] = snapshot.goals.dailyDeviceGoal
            preferences[Keys.soundsEnabled] = snapshot.soundsEnabled
            preferences[Keys.hapticsEnabled] = snapshot.hapticsEnabled
            preferences[Keys.reducedMotion] = snapshot.reducedMotion
            preferences[Keys.nativeMigrationDone] = snapshot.nativeMigrationDone
        }
    }

    private object Keys {
        val theme = stringPreferencesKey("vivo_theme")
        val userName = stringPreferencesKey("vivo_userName")
        val userStore = stringPreferencesKey("vivo_userStore")
        val goalDaily = doublePreferencesKey("vivo_piggy_goals_daily")
        val goalWeekly = doublePreferencesKey("vivo_piggy_goals_weekly")
        val goalMonthly = doublePreferencesKey("vivo_piggy_goals_monthly")
        val goalYearly = doublePreferencesKey("vivo_piggy_goals_yearly")
        val dailyDeviceGoal = intPreferencesKey("vivo_piggy_goals_dailyDeviceGoal")
        val soundsEnabled = booleanPreferencesKey("vivo_sounds_enabled")
        val hapticsEnabled = booleanPreferencesKey("vivo_haptics_enabled")
        val reducedMotion = booleanPreferencesKey("vivo_reduced_motion")
        val nativeMigrationDone = booleanPreferencesKey("native_migration_done")
    }
}

data class VivoPreferenceSnapshot(
    val theme: String = "light",
    val userProfile: NativeUserProfile = NativeUserProfile(),
    val goals: NativePiggyGoals = NativePiggyGoals(),
    val soundsEnabled: Boolean = false,
    val hapticsEnabled: Boolean = true,
    val reducedMotion: Boolean = false,
    val nativeMigrationDone: Boolean = false
)
