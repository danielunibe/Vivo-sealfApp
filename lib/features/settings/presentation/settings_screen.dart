import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/utils/currency_utils.dart';
import '../../../core/widgets/glass_card.dart';
import '../../register/application/register_controller.dart';
import '../application/settings_controller.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(settingsControllerProvider);

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Ajustes', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          for (final d in state.devices)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _DeviceEditorCard(deviceId: d.id, initialName: d.name, initialCommission: d.commission, initialActive: d.isActive),
            ),
          const SizedBox(height: 10),
          const GlassCard(
            child: Text('Export CSV activo desde Calendario (copiar al portapapeles). Cambio de imagen por modelo queda preparado por imagePath.'),
          ),
        ],
      ),
    );
  }
}

class _DeviceEditorCard extends ConsumerStatefulWidget {
  const _DeviceEditorCard({
    required this.deviceId,
    required this.initialName,
    required this.initialCommission,
    required this.initialActive,
  });

  final String deviceId;
  final String initialName;
  final double initialCommission;
  final bool initialActive;

  @override
  ConsumerState<_DeviceEditorCard> createState() => _DeviceEditorCardState();
}

class _DeviceEditorCardState extends ConsumerState<_DeviceEditorCard> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _commissionCtrl;
  late bool _active;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.initialName);
    _commissionCtrl = TextEditingController(text: widget.initialCommission.toStringAsFixed(0));
    _active = widget.initialActive;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _commissionCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(widget.initialName, style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          TextField(
            controller: _nameCtrl,
            decoration: const InputDecoration(labelText: 'Nombre del modelo'),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _commissionCtrl,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(labelText: 'Comisión por unidad', hintText: formatCurrency(widget.initialCommission)),
          ),
          const SizedBox(height: 8),
          SwitchListTile(
            value: _active,
            onChanged: (v) => setState(() => _active = v),
            title: const Text('Modelo activo'),
            contentPadding: EdgeInsets.zero,
          ),
          const SizedBox(height: 8),
          FilledButton(
            onPressed: () async {
              final commission = double.tryParse(_commissionCtrl.text.trim());
              if (commission == null) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Comisión inválida')));
                return;
              }

              final msg = await ref.read(settingsControllerProvider.notifier).saveDevice(
                    id: widget.deviceId,
                    name: _nameCtrl.text,
                    commission: commission,
                    isActive: _active,
                  );

              if (!context.mounted) return;
              if (msg != null) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
                return;
              }
              await ref.read(registerControllerProvider.notifier).load();
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Modelo actualizado')));
            },
            child: const Text('Guardar cambios'),
          ),
        ],
      ),
    );
  }
}

