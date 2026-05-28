enum CbtQuestionType { text, mood, anxietyScale, yesNo, multipleChoice }

class CbtStep {
  final String? id;
  final String prompt;
  final String? guidance;
  final CbtQuestionType type;
  final List<String>? options; // For multiple choice
  final String? placeholder;

  const CbtStep({
    this.id,
    required this.prompt,
    this.guidance,
    this.type = CbtQuestionType.text,
    this.options,
    this.placeholder,
  });

  factory CbtStep.fromJson(Map<String, dynamic> json) {
    return CbtStep(
      id: json['id'] as String?,
      prompt: json['prompt'] as String? ?? json['text'] as String? ?? '',
      guidance: json['guidance'] as String?,
      type: CbtQuestionType.values.firstWhere(
        (e) => e.name == (json['type'] as String?),
        orElse: () => CbtQuestionType.text,
      ),
      options: json['options'] != null ? List<String>.from(json['options'] as List) : null,
      placeholder: json['placeholder'] as String?,
    );
  }
}

class CbtExerciseModel {
  final String id;
  final String title;
  final String description;
  final String category;
  final String difficulty; // beginner, intermediate, advanced
  final int estimatedMinutes;
  final bool isMandatory;
  final List<CbtStep> steps;
  final String iconPath;
  final List<String> themeColors; // HEX strings for gradients

  const CbtExerciseModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.difficulty,
    required this.estimatedMinutes,
    required this.isMandatory,
    required this.steps,
    this.iconPath = 'assets/icons/cbt_brain.svg',
    this.themeColors = const ['#6366F1', '#A855F7'], // Default indigo to purple
  });

  factory CbtExerciseModel.fromJson(Map<String, dynamic> json) {
    return CbtExerciseModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      category: json['category'] as String? ?? '',
      difficulty: json['difficulty'] as String? ?? 'beginner',
      estimatedMinutes: json['estimatedMinutes'] as int? ?? 15,
      isMandatory: json['isMandatory'] as bool? ?? false,
      steps: ((json['questions'] ?? json['steps']) as List? ?? [])
          .map((s) => s is String ? CbtStep(prompt: s) : CbtStep.fromJson(s as Map<String, dynamic>))
          .toList(),
      iconPath: json['iconPath'] as String? ?? 'assets/icons/cbt_brain.svg',
      themeColors: json['themeColors'] != null ? List<String>.from(json['themeColors'] as List) : const ['#6366F1', '#A855F7'],
    );
  }
}

class AssignedCbtExercise {
  final CbtExerciseModel exercise;
  final bool completed;
  final DateTime assignedAt;
  final DateTime? completedAt;
  final Map<int, String>? responses;

  const AssignedCbtExercise({
    required this.exercise,
    required this.completed,
    required this.assignedAt,
    this.completedAt,
    this.responses,
  });

  factory AssignedCbtExercise.fromJson(Map<String, dynamic> json) {
    return AssignedCbtExercise(
      exercise: CbtExerciseModel.fromJson(json['exercise'] as Map<String, dynamic>? ?? {}),
      completed: json['completed'] as bool? ?? false,
      assignedAt: DateTime.parse(json['assignedAt'] as String? ?? DateTime.now().toIso8601String()),
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt'] as String) : null,
      responses: json['responses'] != null ? Map<int, String>.from(json['responses'] as Map) : null,
    );
  }
}
