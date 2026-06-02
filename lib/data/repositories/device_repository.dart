import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/database/app_database.dart';
import '../models/device_model.dart';

class DeviceRepository {
  DeviceRepository(this._db);
  final AppDatabase _db;

  Future<List<DeviceModel>> getActive() => _db.fetchActiveDevices();
  Future<List<DeviceModel>> getAll() => _db.fetchAllDevices();

  Future<void> updateDevice({required String id, required String name, required double commission, required bool isActive}) {
    return _db.updateDevice(id: id, name: name, commission: commission, isActive: isActive);
  }
}

final deviceRepositoryProvider = Provider<DeviceRepository>((ref) {
  return DeviceRepository(ref.watch(appDatabaseProvider));
});
