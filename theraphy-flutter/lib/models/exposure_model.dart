class ExposurePlan {
  final String id;
  final String title;
  final String description;
  final List<ExposureLevel> levels;
  final double overallProgress;

  const ExposurePlan({
    required this.id,
    required this.title,
    required this.description,
    required this.levels,
    this.overallProgress = 0.0,
  });
}

class ExposureLevel {
  final String id;
  final String title;
  final String description;
  final int targetAnxietyScore;
  final bool isLocked;
  final bool isCompleted;
  
  // Backend direct fields
  final int exposureLevel;
  final String status;
  final int? anxietyBefore;
  final int? anxietyAfter;
  final String? clientNotes;
  final String phobiaType;

  const ExposureLevel({
    required this.id,
    required this.title,
    required this.description,
    required this.targetAnxietyScore,
    this.isLocked = true,
    this.isCompleted = false,
    this.exposureLevel = 1,
    this.status = 'planned',
    this.anxietyBefore,
    this.anxietyAfter,
    this.clientNotes,
    this.phobiaType = 'Public Speaking',
  });

  factory ExposureLevel.fromJson(Map<String, dynamic> json) {
    final levelNum = json['exposureLevel'] as int? ?? 1;
    final statusVal = json['status'] as String? ?? 'planned';
    
    // Parse target anxiety score (or use a sensible default based on level)
    final targetAnxiety = levelNum * 2; 

    return ExposureLevel(
      id: json['id'] as String? ?? '',
      title: json['notes'] as String? ?? 'Level $levelNum',
      description: 'Confront your fear gradually. Focus on steady breathing.',
      targetAnxietyScore: targetAnxiety,
      isCompleted: statusVal == 'completed',
      isLocked: statusVal == 'planned', // Managed dynamically by provider later
      exposureLevel: levelNum,
      status: statusVal,
      anxietyBefore: json['anxietyBefore'] as int?,
      anxietyAfter: json['anxietyAfter'] as int?,
      clientNotes: json['clientNotes'] as String?,
      phobiaType: json['phobiaType'] as String? ?? 'Public Speaking',
    );
  }

  ExposureLevel copyWith({
    bool? isLocked,
    bool? isCompleted,
    String? status,
    int? anxietyBefore,
    int? anxietyAfter,
    String? clientNotes,
  }) {
    return ExposureLevel(
      id: id,
      title: title,
      description: description,
      targetAnxietyScore: targetAnxietyScore,
      isLocked: isLocked ?? this.isLocked,
      isCompleted: isCompleted ?? this.isCompleted,
      exposureLevel: exposureLevel,
      status: status ?? this.status,
      anxietyBefore: anxietyBefore ?? this.anxietyBefore,
      anxietyAfter: anxietyAfter ?? this.anxietyAfter,
      clientNotes: clientNotes ?? this.clientNotes,
      phobiaType: phobiaType,
    );
  }
}
