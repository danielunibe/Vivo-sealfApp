class DeviceModel {
  final String id;
  final String name;
  final double commission;
  final String imagePath;
  final bool isActive;

  const DeviceModel({
    required this.id,
    required this.name,
    required this.commission,
    required this.imagePath,
    required this.isActive,
  });

  DeviceModel copyWith({
    String? id,
    String? name,
    double? commission,
    String? imagePath,
    bool? isActive,
  }) {
    return DeviceModel(
      id: id ?? this.id,
      name: name ?? this.name,
      commission: commission ?? this.commission,
      imagePath: imagePath ?? this.imagePath,
      isActive: isActive ?? this.isActive,
    );
  }
}
