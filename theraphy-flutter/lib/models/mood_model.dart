class MoodModel {
  final String id;
  final String patientId;
  final int moodScore;
  final int anxietyLevel; // non-nullable, defaults to 5
  final List<String> emotions;
  final String? notes;
  final DateTime createdAt;

  const MoodModel({
    required this.id,
    required this.patientId,
    required this.moodScore,
    this.anxietyLevel = 5,
    required this.emotions,
    this.notes,
    required this.createdAt,
  });

  factory MoodModel.fromJson(Map<String, dynamic> json) {
    return MoodModel(
      id: json['id'] as String? ?? '',
      patientId: json['patientId'] as String? ?? '',
      moodScore: json['moodScore'] as int? ?? 5,
      anxietyLevel: json['anxietyLevel'] as int? ?? 5,
      emotions: List<String>.from(json['emotions'] as List? ?? []),
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(
          json['createdAt'] as String? ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() => {
        'moodScore': moodScore,
        'anxietyLevel': anxietyLevel,
        'emotions': emotions,
        'notes': notes,
      };
}
