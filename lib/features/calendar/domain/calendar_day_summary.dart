import '../../../data/models/sale_model.dart';

class CalendarMetrics {
  final int totalUnits;
  final double totalCommission;
  final int totalSales;
  final String topUnitsModel;
  final String topCommissionModel;
  final String bestDay;

  const CalendarMetrics({
    required this.totalUnits,
    required this.totalCommission,
    required this.totalSales,
    required this.topUnitsModel,
    required this.topCommissionModel,
    required this.bestDay,
  });
}

class CalendarState {
  final bool loading;
  final DateTime month;
  final DateTime? selectedDay;
  final List<SaleModel> sales;

  const CalendarState({
    this.loading = true,
    required this.month,
    this.selectedDay,
    this.sales = const [],
  });

  CalendarState copyWith({
    bool? loading,
    DateTime? month,
    DateTime? selectedDay,
    bool clearSelectedDay = false,
    List<SaleModel>? sales,
  }) {
    return CalendarState(
      loading: loading ?? this.loading,
      month: month ?? this.month,
      selectedDay: clearSelectedDay ? null : (selectedDay ?? this.selectedDay),
      sales: sales ?? this.sales,
    );
  }
}
