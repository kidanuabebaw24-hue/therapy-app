class EmergencyResource {
  final String id;
  final String title;
  final String description;
  final String phoneNumber;
  final String type; // 'hotline', 'hospital', 'app'

  const EmergencyResource({
    required this.id,
    required this.title,
    required this.description,
    required this.phoneNumber,
    required this.type,
  });
}

class SafetyPlan {
  final List<String> warningSigns;
  final List<String> copingStrategies;
  final List<String> socialContacts;
  final List<String> professionalContacts;

  const SafetyPlan({
    this.warningSigns = const [],
    this.copingStrategies = const [],
    this.socialContacts = const [],
    this.professionalContacts = const [],
  });
}
