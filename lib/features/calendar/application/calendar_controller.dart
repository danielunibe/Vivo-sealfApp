import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/sale_model.dart';
import '../../../data/repositories/sales_repository.dart';
import '../domain/calendar_day_summary.dart';

class CalendarController extends StateNotifier<CalendarState> {
  CalendarController(this._ref)
      : super(CalendarState(month: DateTime(DateTime.now().year, DateTime.now().month, 1))) {
    load();
  }

  final Ref _ref;

  Future<void> load() async {
    final sales = await _ref.read(salesRepositoryProvider).getSalesByMonth(state.month);
    state = state.copyWith(loading: false, sales: sales);
  }

  Future<void> changeMonth(int delta) async {
    state = state.copyWith(
      loading: true,
      month: DateTime(state.month.year, state.month.month + delta, 1),
      clearSelectedDay: true,
    );
    await load();
  }

  void selectDay(DateTime day) {
    state = state.copyWith(selectedDay: DateTime(day.year, day.month, day.day));
  }

  Future<void> deleteSale(String id) async {
    await _ref.read(salesRepositoryProvider).deleteSale(id);
    await load();
  }

  Map<DateTime, List<SaleModel>> salesByDay() {
    final result = <DateTime, List<SaleModel>>{};
    for (final s in state.sales) {
      final key = DateTime(s.date.year, s.date.month, s.date.day);
      result.putIfAbsent(key, () => []).add(s);
    }
    return result;
  }

  CalendarMetrics metrics() {
    if (state.sales.isEmpty) {
      return const CalendarMetrics(
        totalUnits: 0,
        totalCommission: 0,
        totalSales: 0,
        topUnitsModel: '-',
        topCommissionModel: '-',
        bestDay: '-',
      );
    }

    var totalUnits = 0;
    var totalCommission = 0.0;
    final unitsByModel = <String, int>{};
    final commissionByModel = <String, double>{};
    final commissionByDay = <DateTime, double>{};

    for (final s in state.sales) {
      totalUnits += s.quantity;
      totalCommission += s.totalCommission;
      unitsByModel[s.deviceNameSnapshot] = (unitsByModel[s.deviceNameSnapshot] ?? 0) + s.quantity;
      commissionByModel[s.deviceNameSnapshot] = (commissionByModel[s.deviceNameSnapshot] ?? 0) + s.totalCommission;
      final day = DateTime(s.date.year, s.date.month, s.date.day);
      commissionByDay[day] = (commissionByDay[day] ?? 0) + s.totalCommission;
    }

    String topUnits = '-';
    var topUnitsValue = -1;
    unitsByModel.forEach((k, v) {
      if (v > topUnitsValue) {
        topUnits = k;
        topUnitsValue = v;
      }
    });

    String topCommission = '-';
    var topCommissionValue = -1.0;
    commissionByModel.forEach((k, v) {
      if (v > topCommissionValue) {
        topCommission = k;
        topCommissionValue = v;
      }
    });

    DateTime? bestDay;
    var bestValue = -1.0;
    commissionByDay.forEach((day, value) {
      if (value > bestValue) {
        bestDay = day;
        bestValue = value;
      }
    });

    final bestDayText = bestDay == null ? '-' : '${bestDay!.day}/${bestDay!.month}/${bestDay!.year}';

    return CalendarMetrics(
      totalUnits: totalUnits,
      totalCommission: totalCommission,
      totalSales: state.sales.length,
      topUnitsModel: topUnits,
      topCommissionModel: topCommission,
      bestDay: bestDayText,
    );
  }
}

final calendarControllerProvider = StateNotifierProvider<CalendarController, CalendarState>((ref) {
  return CalendarController(ref);
});
