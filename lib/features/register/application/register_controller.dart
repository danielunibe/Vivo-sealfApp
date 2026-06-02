import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/device_model.dart';
import '../../../data/repositories/device_repository.dart';
import '../../../data/repositories/sales_repository.dart';
import '../domain/register_state.dart';

class RegisterController extends StateNotifier<RegisterState> {
  RegisterController(this._ref) : super(RegisterState()) {
    load();
  }

  final Ref _ref;

  Future<void> load() async {
    final devices = await _ref.read(deviceRepositoryProvider).getActive();
    final selected = _keepCurrentSelection(devices);
    state = state.copyWith(loading: false, devices: devices, selected: selected);
    await refreshTodaySummary();
  }

  DeviceModel? _keepCurrentSelection(List<DeviceModel> devices) {
    if (devices.isEmpty) return null;
    final current = state.selected;
    if (current == null) return devices.first;
    for (final d in devices) {
      if (d.id == current.id) return d;
    }
    return devices.first;
  }

  void selectDevice(String id) {
    for (final d in state.devices) {
      if (d.id == id) {
        state = state.copyWith(selected: d);
        break;
      }
    }
  }

  void changeQuantity(int next) {
    final value = next.clamp(1, 50);
    state = state.copyWith(quantity: value);
  }

  void setSaleDate(DateTime date) {
    state = state.copyWith(saleDate: DateTime(date.year, date.month, date.day));
  }

  Future<void> refreshTodaySummary() async {
    final sales = await _ref.read(salesRepositoryProvider).getSalesByDate(state.saleDate);
    var units = 0;
    var commission = 0.0;
    for (final s in sales) {
      units += s.quantity;
      commission += s.totalCommission;
    }
    state = state.copyWith(todayUnits: units, todayCommission: commission);
  }

  Future<String?> registerSale() async {
    final selected = state.selected;
    if (selected == null) return null;

    final saleId = await _ref.read(salesRepositoryProvider).insertSale(
          device: selected,
          quantity: state.quantity,
          date: state.saleDate,
        );

    state = state.copyWith(quantity: 1);
    await refreshTodaySummary();
    return saleId;
  }

  Future<void> undoSale(String saleId) async {
    await _ref.read(salesRepositoryProvider).deleteSale(saleId);
    await refreshTodaySummary();
  }
}

final registerControllerProvider = StateNotifierProvider<RegisterController, RegisterState>((ref) {
  return RegisterController(ref);
});
