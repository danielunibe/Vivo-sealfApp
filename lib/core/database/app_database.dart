import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';

import '../../data/models/device_model.dart';
import '../../data/models/sale_model.dart';
import '../../data/seed/initial_devices_seed.dart';

part 'app_database.g.dart';

class Devices extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  RealColumn get commission => real()();
  TextColumn get imagePath => text().named('image_path')();
  BoolColumn get isActive => boolean().named('is_active').withDefault(const Constant(true))();
  DateTimeColumn get createdAt => dateTime().named('created_at')();
  DateTimeColumn get updatedAt => dateTime().named('updated_at')();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class Sales extends Table {
  TextColumn get id => text()();
  DateTimeColumn get saleDate => dateTime().named('sale_date')();
  TextColumn get deviceId => text().named('device_id')();
  TextColumn get deviceNameSnapshot => text().named('device_name_snapshot')();
  TextColumn get deviceImagePathSnapshot => text().named('device_image_path_snapshot')();
  IntColumn get quantity => integer()();
  RealColumn get commissionPerUnit => real().named('commission_per_unit')();
  RealColumn get totalCommission => real().named('total_commission')();
  DateTimeColumn get createdAt => dateTime().named('created_at')();
  DateTimeColumn get updatedAt => dateTime().named('updated_at')();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

@DriftDatabase(tables: [Devices, Sales])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration => MigrationStrategy(
        onCreate: (m) async {
          await m.createAll();
          await seedDevicesIfEmpty();
        },
      );

  Future<void> seedDevicesIfEmpty() async {
    final existing = await select(devices).get();
    if (existing.isNotEmpty) return;

    final now = DateTime.now();
    await batch((b) {
      b.insertAll(
        devices,
        initialDevicesSeed
            .map(
              (d) => DevicesCompanion.insert(
                id: d.id,
                name: d.name,
                commission: d.commission,
                imagePath: d.imagePath,
                isActive: Value(d.isActive),
                createdAt: now,
                updatedAt: now,
              ),
            )
            .toList(),
      );
    });
  }

  Future<List<DeviceModel>> fetchActiveDevices() async {
    final rows = await (select(devices)..where((t) => t.isActive.equals(true))).get();
    return rows
        .map((r) => DeviceModel(id: r.id, name: r.name, commission: r.commission, imagePath: r.imagePath, isActive: r.isActive))
        .toList();
  }

  Future<List<DeviceModel>> fetchAllDevices() async {
    final rows = await select(devices).get();
    return rows
        .map((r) => DeviceModel(id: r.id, name: r.name, commission: r.commission, imagePath: r.imagePath, isActive: r.isActive))
        .toList();
  }

  Future<void> updateDevice({required String id, required String name, required double commission, required bool isActive}) async {
    await (update(devices)..where((t) => t.id.equals(id))).write(
      DevicesCompanion(
        name: Value(name),
        commission: Value(commission),
        isActive: Value(isActive),
        updatedAt: Value(DateTime.now()),
      ),
    );
  }

  Future<String> insertSale({required DeviceModel device, required int quantity, DateTime? date}) async {
    final now = DateTime.now();
    final saleDate = date ?? now;
    final id = const Uuid().v4();
    await into(sales).insert(
      SalesCompanion.insert(
        id: id,
        saleDate: DateTime(saleDate.year, saleDate.month, saleDate.day),
        deviceId: device.id,
        deviceNameSnapshot: device.name,
        deviceImagePathSnapshot: device.imagePath,
        quantity: quantity,
        commissionPerUnit: device.commission,
        totalCommission: device.commission * quantity,
        createdAt: now,
        updatedAt: now,
      ),
    );
    return id;
  }

  Future<List<SaleModel>> fetchSalesByMonth(DateTime month) async {
    final from = DateTime(month.year, month.month, 1);
    final to = DateTime(month.year, month.month + 1, 1);
    final rows = await (select(sales)..where((t) => t.saleDate.isBiggerOrEqualValue(from) & t.saleDate.isSmallerThanValue(to))).get();
    return rows
        .map((s) => SaleModel(
              id: s.id,
              date: s.saleDate,
              deviceId: s.deviceId,
              deviceNameSnapshot: s.deviceNameSnapshot,
              deviceImagePathSnapshot: s.deviceImagePathSnapshot,
              quantity: s.quantity,
              commissionPerUnit: s.commissionPerUnit,
              totalCommission: s.totalCommission,
            ))
        .toList();
  }

  Future<List<SaleModel>> fetchSalesByDate(DateTime date) async {
    final day = DateTime(date.year, date.month, date.day);
    final next = day.add(const Duration(days: 1));
    final rows = await (select(sales)..where((t) => t.saleDate.isBiggerOrEqualValue(day) & t.saleDate.isSmallerThanValue(next))).get();
    return rows
        .map((s) => SaleModel(
              id: s.id,
              date: s.saleDate,
              deviceId: s.deviceId,
              deviceNameSnapshot: s.deviceNameSnapshot,
              deviceImagePathSnapshot: s.deviceImagePathSnapshot,
              quantity: s.quantity,
              commissionPerUnit: s.commissionPerUnit,
              totalCommission: s.totalCommission,
            ))
        .toList();
  }

  Future<void> deleteSale(String id) async {
    await (delete(sales)..where((t) => t.id.equals(id))).go();
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dir = await getApplicationDocumentsDirectory();
    final file = File(p.join(dir.path, 'registro_ventas.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}

final appDatabaseProvider = Provider<AppDatabase>((ref) {
  final db = AppDatabase();
  ref.onDispose(db.close);
  return db;
});
