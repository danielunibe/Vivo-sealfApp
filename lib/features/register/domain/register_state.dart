import '../../../data/models/device_model.dart';

class RegisterState {
  final bool loading;
  final List<DeviceModel> devices;
  final DeviceModel? selected;
  final int quantity;
  final DateTime saleDate;
  final int todayUnits;
  final double todayCommission;

  RegisterState({
    this.loading = true,
    this.devices = const [],
    this.selected,
    this.quantity = 1,
    DateTime? saleDate,
    this.todayUnits = 0,
    this.todayCommission = 0,
  }) : saleDate = saleDate ?? DateTime.now();

  RegisterState copyWith({
    bool? loading,
    List<DeviceModel>? devices,
    DeviceModel? selected,
    int? quantity,
    DateTime? saleDate,
    int? todayUnits,
    double? todayCommission,
    bool clearSelection = false,
  }) {
    return RegisterState(
      loading: loading ?? this.loading,
      devices: devices ?? this.devices,
      selected: clearSelection ? null : (selected ?? this.selected),
      quantity: quantity ?? this.quantity,
      saleDate: saleDate ?? this.saleDate,
      todayUnits: todayUnits ?? this.todayUnits,
      todayCommission: todayCommission ?? this.todayCommission,
    );
  }
}
