import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/repositories/device_repository.dart';
import '../domain/settings_state.dart';

class SettingsController extends StateNotifier<SettingsState> {
  SettingsController(this._ref) : super(const SettingsState()) {
    load();
  }

  final Ref _ref;

  Future<void> load() async {
    final devices = await _ref.read(deviceRepositoryProvider).getAll();
    state = state.copyWith(loading: false, devices: devices);
  }

  Future<String?> saveDevice({required String id, required String name, required double commission, required bool isActive}) async {
    final cleanName = name.trim();
    if (cleanName.isEmpty) return 'El nombre no puede estar vacío';
    if (commission < 0) return 'La comisión no puede ser negativa';

    await _ref.read(deviceRepositoryProvider).updateDevice(
          id: id,
          name: cleanName,
          commission: commission,
          isActive: isActive,
        );
    await load();
    return null;
  }
}

final settingsControllerProvider = StateNotifierProvider<SettingsController, SettingsState>((ref) {
  return SettingsController(ref);
});
