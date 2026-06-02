import '../../data/models/sale_model.dart';

String salesToCsv(List<SaleModel> sales) {
  final b = StringBuffer();
  b.writeln('fecha,modelo,cantidad,comision_por_unidad,comision_total,created_at');
  for (final s in sales) {
    final date = '${s.date.year}-${s.date.month.toString().padLeft(2, '0')}-${s.date.day.toString().padLeft(2, '0')}';
    b.writeln('$date,${s.deviceNameSnapshot},${s.quantity},${s.commissionPerUnit},${s.totalCommission},$date');
  }
  return b.toString();
}

String monthlySummaryToCsv(Map<String, ({int units, double commission})> summary, DateTime month) {
  final b = StringBuffer();
  final monthText = '${month.year}-${month.month.toString().padLeft(2, '0')}';
  b.writeln('mes,modelo,piezas,comision_total');
  summary.forEach((model, data) {
    b.writeln('$monthText,$model,${data.units},${data.commission}');
  });
  return b.toString();
}
