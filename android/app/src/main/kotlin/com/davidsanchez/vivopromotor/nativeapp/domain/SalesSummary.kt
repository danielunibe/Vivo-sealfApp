package com.davidsanchez.vivopromotor.nativeapp.domain

import com.davidsanchez.vivopromotor.nativeapp.data.model.NativePiggyGoals
import com.davidsanchez.vivopromotor.nativeapp.data.model.NativeSaleEntity

object SalesSummary {
    fun earningsForDate(sales: List<NativeSaleEntity>, date: String): Double {
        return sales.filter { it.date == date }.sumOf { it.amountEarned }
    }

    fun unitsForDate(sales: List<NativeSaleEntity>, date: String): Int {
        return sales.count { it.date == date }
    }

    fun dailyGoalStatus(sales: List<NativeSaleEntity>, date: String, goals: NativePiggyGoals): String {
        val units = unitsForDate(sales, date)
        return when {
            units <= 0 -> "no-sale"
            units < goals.dailyDeviceGoal -> "below-goal"
            units == goals.dailyDeviceGoal -> "goal-met"
            else -> "goal-exceeded"
        }
    }
}
