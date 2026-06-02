import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/database/app_database.dart';
import '../models/device_model.dart';
import '../models/sale_model.dart';

class SalesRepository {
  SalesRepository(this._db);
  final AppDatabase _db;

  Future<String> insertSale({required DeviceModel device, required int quantity, DateTime? date}) =>
      _db.insertSale(device: device, quantity: quantity, date: date);

  Future<List<SaleModel>> getSalesByMonth(DateTime month) => _db.fetchSalesByMonth(month);
  Future<List<SaleModel>> getSalesByDate(DateTime date) => _db.fetchSalesByDate(date);
  Future<void> deleteSale(String id) => _db.deleteSale(id);
}

final salesRepositoryProvider = Provider<SalesRepository>((ref) {
  return SalesRepository(ref.watch(appDatabaseProvider));
});
