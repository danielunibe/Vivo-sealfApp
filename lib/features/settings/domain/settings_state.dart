import '../../../data/models/device_model.dart';

class SettingsState {
  final bool loading;
  final List<DeviceModel> devices;

  const SettingsState({this.loading = true, this.devices = const []});

  SettingsState copyWith({bool? loading, List<DeviceModel>? devices}) {
    return SettingsState(loading: loading ?? this.loading, devices: devices ?? this.devices);
  }
}
