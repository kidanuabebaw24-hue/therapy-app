class EmergencyContactModel {
  final String id;
  final String patientId;
  final String name;
  final String phone;
  final String? relationship;

  const EmergencyContactModel({
    required this.id,
    required this.patientId,
    required this.name,
    required this.phone,
    this.relationship,
  });

  factory EmergencyContactModel.fromJson(Map<String, dynamic> json) {
    return EmergencyContactModel(
      id: json['id'] as String? ?? '',
      patientId: json['patientId'] as String? ?? '',
      name: json['name'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      relationship: json['relationship'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'patientId': patientId,
        'name': name,
        'phone': phone,
        'relationship': relationship,
      };

  EmergencyContactModel copyWith({
    String? id,
    String? patientId,
    String? name,
    String? phone,
    String? relationship,
  }) {
    return EmergencyContactModel(
      id: id ?? this.id,
      patientId: patientId ?? this.patientId,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      relationship: relationship ?? this.relationship,
    );
  }
}
