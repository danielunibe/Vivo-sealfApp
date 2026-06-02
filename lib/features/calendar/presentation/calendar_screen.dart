import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/utils/csv_utils.dart';
import '../../../core/utils/currency_utils.dart';
import '../../../core/widgets/glass_card.dart';
import '../../../data/models/sale_model.dart';
import '../../navigation/navigation_controller.dart';
import '../../register/application/register_controller.dart';
import '../application/calendar_controller.dart';

class CalendarScreen extends ConsumerWidget {
  const CalendarScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(calendarControllerProvider);
    final ctrl = ref.read(calendarControllerProvider.notifier);

    final byDay = ctrl.salesByDay();
    final metrics = ctrl.metrics();

    final monthName = DateFormat('MMMM yyyy', 'es_MX').format(state.month);
    final daysInMonth = DateUtils.getDaysInMonth(state.month.year, state.month.month);
    final today = DateTime.now();

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              IconButton(onPressed: () => ctrl.changeMonth(-1), icon: const Icon(Icons.chevron_left)),
              Expanded(child: Center(child: Text(monthName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)))),
              IconButton(onPressed: () => ctrl.changeMonth(1), icon: const Icon(Icons.chevron_right)),
            ],
          ),
          const SizedBox(height: 8),
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${metrics.totalUnits} equipos · ${formatCurrency(metrics.totalCommission)} · ${metrics.totalSales} ventas'),
                const SizedBox(height: 8),
                Text('Top por piezas: ${metrics.topUnitsModel}'),
                Text('Top por comisión: ${metrics.topCommissionModel}'),
                Text('Mejor día: ${metrics.bestDay}'),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: [
                    OutlinedButton(
                      onPressed: () async {
                        final csv = salesToCsv(state.sales);
                        await Clipboard.setData(ClipboardData(text: csv));
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('CSV de ventas copiado')));
                        }
                      },
                      child: const Text('Copiar CSV ventas'),
                    ),
                    OutlinedButton(
                      onPressed: () async {
                        final summary = _summaryByModel(state.sales);
                        final csv = monthlySummaryToCsv(summary, state.month);
                        await Clipboard.setData(ClipboardData(text: csv));
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('CSV mensual copiado')));
                        }
                      },
                      child: const Text('Copiar CSV mensual'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          if (state.sales.isEmpty)
            const GlassCard(
              child: Text('Aún no hay ventas en este mes. Registra una venta para verla reflejada aquí.'),
            )
          else
            GlassCard(
              child: GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: daysInMonth,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 7, crossAxisSpacing: 6, mainAxisSpacing: 6),
                itemBuilder: (_, i) {
                  final day = DateTime(state.month.year, state.month.month, i + 1);
                  final sales = byDay[day] ?? const <SaleModel>[];
                  final qty = sales.fold<int>(0, (p, s) => p + s.quantity);
                  final isToday = day.year == today.year && day.month == today.month && day.day == today.day;
                  final isSelected = state.selectedDay != null && day == state.selectedDay;

                  return InkWell(
                    onTap: () {
                      ctrl.selectDay(day);
                      if (sales.isNotEmpty) _openDayDetail(context, ref, day, sales);
                    },
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        color: sales.isEmpty ? Colors.white10 : Colors.lightBlueAccent.withOpacity(0.2),
                        border: Border.all(
                          color: isSelected
                              ? Colors.cyanAccent
                              : isToday
                                  ? Colors.white70
                                  : (sales.isEmpty ? Colors.white12 : Colors.lightBlueAccent),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${i + 1}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11)),
                          const SizedBox(height: 2),
                          _miniatures(sales),
                          const Spacer(),
                          if (qty > 0)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(10)),
                              child: Text('$qty', style: const TextStyle(fontSize: 11)),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }

  Widget _miniatures(List<SaleModel> sales) {
    if (sales.isEmpty) return const SizedBox.shrink();
    final top = sales.take(3).toList();
    return Wrap(
      spacing: 2,
      runSpacing: 2,
      children: [
        for (final s in top)
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.asset(
              s.deviceImagePathSnapshot,
              width: 16,
              height: 16,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(8)),
                child: const Icon(Icons.smartphone, size: 10),
              ),
            ),
          ),
        if (sales.length > 3) Text('+${sales.length - 3}', style: const TextStyle(fontSize: 9)),
      ],
    );
  }

  Future<void> _openDayDetail(BuildContext context, WidgetRef ref, DateTime day, List<SaleModel> sales) async {
    final ctrl = ref.read(calendarControllerProvider.notifier);
    final totalUnits = sales.fold<int>(0, (p, s) => p + s.quantity);
    final totalCommission = sales.fold<double>(0, (p, s) => p + s.totalCommission);

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text('Detalle ${day.day}/${day.month}/${day.year}', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('$totalUnits equipos · ${formatCurrency(totalCommission)}'),
            const SizedBox(height: 8),
            for (final s in sales)
              ListTile(
                leading: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.asset(
                    s.deviceImagePathSnapshot,
                    width: 28,
                    height: 28,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const Icon(Icons.smartphone),
                  ),
                ),
                title: Text('${s.deviceNameSnapshot} x${s.quantity}'),
                subtitle: Text(formatCurrency(s.totalCommission)),
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline),
                  onPressed: () async {
                    Navigator.pop(context);
                    await ctrl.deleteSale(s.id);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Venta eliminada')));
                    }
                  },
                ),
              ),
            const SizedBox(height: 8),
            FilledButton(
              onPressed: () {
                Navigator.pop(context);
                ref.read(navigationIndexProvider.notifier).state = 1;
                ref.read(registerControllerProvider.notifier).setSaleDate(day);
              },
              child: const Text('Registrar otra venta en esta fecha'),
            )
          ],
        ),
      ),
    );
  }

  Map<String, ({int units, double commission})> _summaryByModel(List<SaleModel> sales) {
    final map = <String, ({int units, double commission})>{};
    for (final s in sales) {
      final current = map[s.deviceNameSnapshot];
      if (current == null) {
        map[s.deviceNameSnapshot] = (units: s.quantity, commission: s.totalCommission);
      } else {
        map[s.deviceNameSnapshot] = (units: current.units + s.quantity, commission: current.commission + s.totalCommission);
      }
    }
    return map;
  }
}
