import 'dart:convert';
import 'emergency_contact_model.dart';

class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? phone;
  // Client profile fields (from Patient relation)
  final int? age;
  final String? gender;
  final bool hasCompletedInitialCBT;
  final bool requiresCBT;
  final int? currentAnxietyLevel;
  final String? primaryPhobia;
  final List<EmergencyContactModel> emergencyContacts;
  // Therapist profile fields
  final String? specialization;
  final String? licenseNumber;
  final int? yearsOfExperience;
  final double? hourlyRate;
  final bool isVerified;
  // Auth
  final String? token;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
    this.age,
    this.gender,
    this.hasCompletedInitialCBT = false,
    this.requiresCBT = false,
    this.currentAnxietyLevel,
    this.primaryPhobia,
    this.specialization,
    this.licenseNumber,
    this.yearsOfExperience,
    this.hourlyRate,
    this.isVerified = false,
    this.token,
    this.emergencyContacts = const [],
  });

  bool get isClient => role == 'client';
  bool get isTherapist => role == 'therapist';
  bool get isAdmin => role == 'admin';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    // The new backend returns nested patientProfile / therapistProfile
    final patient = json['patientProfile'] as Map<String, dynamic>?;
    final therapist = json['therapistProfile'] as Map<String, dynamic>?;

    final contactsList = patient?['emergencyContacts'] as List?;
    final emergencyContacts = contactsList != null
        ? contactsList
            .map((c) => EmergencyContactModel.fromJson(c as Map<String, dynamic>))
            .toList()
        : const <EmergencyContactModel>[];

    return UserModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? 'client',
      phone: json['phone'] as String?,
      isVerified: therapist?['isVerified'] as bool? ?? false,
      // Patient profile
      age: patient?['age'] as int?,
      gender: patient?['gender'] as String?,
      hasCompletedInitialCBT:
          patient?['hasCompletedInitialCBT'] as bool? ??
          json['hasCompletedInitialCBT'] as bool? ??
          false,
      requiresCBT: json['requiresCBT'] as bool? ?? false,
      currentAnxietyLevel: patient?['currentAnxietyLevel'] as int?,
      primaryPhobia: patient?['primaryPhobia'] as String?,
      emergencyContacts: emergencyContacts,
      // Therapist profile
      specialization: therapist?['specialization'] as String?,
      licenseNumber: therapist?['licenseNumber'] as String?,
      yearsOfExperience: therapist?['yearsOfExperience'] as int?,
      hourlyRate: (therapist?['hourlyRate'] as num?)?.toDouble(),
      token: json['token'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'role': role,
        'phone': phone,
        'isVerified': isVerified,
        'hasCompletedInitialCBT': hasCompletedInitialCBT,
        'requiresCBT': requiresCBT,
        'token': token,
        'patientProfile': isClient
            ? {
                'age': age,
                'gender': gender,
                'currentAnxietyLevel': currentAnxietyLevel,
                'primaryPhobia': primaryPhobia,
                'emergencyContacts': emergencyContacts.map((c) => c.toJson()).toList(),
              }
            : null,
        'therapistProfile': isTherapist
            ? {
                'specialization': specialization,
                'licenseNumber': licenseNumber,
                'yearsOfExperience': yearsOfExperience,
                'hourlyRate': hourlyRate,
                'isVerified': isVerified,
              }
            : null,
      };

  String toJsonString() => jsonEncode(toJson());

  factory UserModel.fromJsonString(String jsonString) =>
      UserModel.fromJson(jsonDecode(jsonString) as Map<String, dynamic>);

  UserModel copyWith({
    String? name,
    String? phone,
    int? age,
    String? gender,
    bool? hasCompletedInitialCBT,
    bool? requiresCBT,
    int? currentAnxietyLevel,
    String? primaryPhobia,
    List<EmergencyContactModel>? emergencyContacts,
  }) {
    return UserModel(
      id: id,
      name: name ?? this.name,
      email: email,
      role: role,
      phone: phone ?? this.phone,
      age: age ?? this.age,
      gender: gender ?? this.gender,
      hasCompletedInitialCBT:
          hasCompletedInitialCBT ?? this.hasCompletedInitialCBT,
      requiresCBT: requiresCBT ?? this.requiresCBT,
      currentAnxietyLevel: currentAnxietyLevel ?? this.currentAnxietyLevel,
      primaryPhobia: primaryPhobia ?? this.primaryPhobia,
      specialization: specialization,
      licenseNumber: licenseNumber,
      yearsOfExperience: yearsOfExperience,
      hourlyRate: hourlyRate,
      isVerified: isVerified,
      token: token,
      emergencyContacts: emergencyContacts ?? this.emergencyContacts,
    );
  }
}
