class SaleModel {
  final String id;
  final DateTime date;
  final String deviceId;
  final String deviceNameSnapshot;
  final String deviceImagePathSnapshot;
  final int quantity;
  final double commissionPerUnit;
  final double totalCommission;

  const SaleModel({
    required this.id,
    required this.date,
    required this.deviceId,
    required this.deviceNameSnapshot,
    required this.deviceImagePathSnapshot,
    required this.quantity,
    required this.commissionPerUnit,
    required this.totalCommission,
  });
}
