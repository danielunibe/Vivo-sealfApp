import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/utils/currency_utils.dart';
import '../../../core/widgets/glass_card.dart';
import '../../calendar/application/calendar_controller.dart';
import '../application/register_controller.dart';

class RegisterScreen extends ConsumerWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(registerControllerProvider);
    final ctrl = ref.read(registerControllerProvider.notifier);

    final selected = state.selected;
    final total = (selected?.commission ?? 0) * state.quantity;

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Registro rápido', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text('Ventas del día - ${state.saleDate.day}/${state.saleDate.month}/${state.saleDate.year}'),
          const SizedBox(height: 8),
          GlassCard(child: Text('Hoy: ${state.todayUnits} equipos · ${formatCurrency(state.todayCommission)}')),
          const SizedBox(height: 12),
          if (state.devices.isEmpty)
            const GlassCard(
              child: Text('No hay modelos activos. Activa al menos un modelo en Ajustes para registrar ventas.'),
            )
          else
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Selecciona un dispositivo'),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final d in state.devices)
                        InkWell(
                          onTap: () => ctrl.selectDevice(d.id),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            width: 150,
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: selected?.id == d.id ? Colors.cyanAccent : Colors.white24,
                                width: selected?.id == d.id ? 1.6 : 1,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(child: Text(d.name, style: const TextStyle(fontWeight: FontWeight.w700))),
                                    if (selected?.id == d.id) const Icon(Icons.check_circle, size: 16, color: Colors.cyanAccent),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(formatCurrency(d.commission)),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          const SizedBox(height: 12),
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Carrito de registro'),
                const SizedBox(height: 8),
                Text('Modelo: ${selected?.name ?? 'Sin seleccionar'}'),
                Text('Comisión x unidad: ${formatCurrency(selected?.commission ?? 0)}'),
                const SizedBox(height: 8),
                Row(
                  children: [
                    IconButton(onPressed: () => ctrl.changeQuantity(state.quantity - 1), icon: const Icon(Icons.remove_circle_outline)),
                    Text('${state.quantity}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    IconButton(onPressed: () => ctrl.changeQuantity(state.quantity + 1), icon: const Icon(Icons.add_circle_outline)),
                    const Spacer(),
                    Text('Estimado: ${formatCurrency(total)}'),
                  ],
                ),
                const SizedBox(height: 10),
                FilledButton(
                  onPressed: state.loading || state.devices.isEmpty
                      ? null
                      : () async {
                          final saleId = await ctrl.registerSale();
                          if (!context.mounted) return;
                          if (saleId == null) {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Selecciona un dispositivo')));
                            return;
                          }
                          await ref.read(calendarControllerProvider.notifier).load();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Text('Venta registrada'),
                              action: SnackBarAction(
                                label: 'Deshacer',
                                onPressed: () async {
                                  await ctrl.undoSale(saleId);
                                  await ref.read(calendarControllerProvider.notifier).load();
                                },
                              ),
                            ),
                          );
                        },
                  child: const SizedBox(height: 48, child: Center(child: Text('Registrar venta'))),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
