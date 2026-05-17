/// CBTExercise from the new PostgreSQL/Prisma backend.
/// Prisma schema: id, title, description, category, instructions,
/// isMandatory, estimatedTime, difficulty, isActive
class CbtExerciseModel {
  final String id;
  final String title;
  final String description;
  final String category;
  final String difficulty; // beginner | intermediate | advanced
  final int estimatedMinutes;
  final bool isMandatory;
  final bool isActive;
  final List<String> steps; // mapped from 'instructions' or questions

  const CbtExerciseModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.difficulty,
    required this.estimatedMinutes,
    required this.isMandatory,
    required this.isActive,
    required this.steps,
  });

  factory CbtExerciseModel.fromJson(Map<String, dynamic> json) {
    // New backend uses 'estimatedTime' and 'instructions'
    final instructions = json['instructions'] as String?;
    final steps = json['steps'] as List?;

    return CbtExerciseModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      category: json['category'] as String? ?? '',
      difficulty: json['difficulty'] as String? ?? 'beginner',
      estimatedMinutes: json['estimatedTime'] as int? ?? 15,
      isMandatory: json['isMandatory'] as bool? ?? false,
      isActive: json['isActive'] as bool? ?? true,
      // Convert instructions string to list, or use steps array
      steps: steps != null
          ? List<String>.from(steps)
          : instructions != null
              ? instructions
                  .split('\n')
                  .where((s) => s.trim().isNotEmpty)
                  .toList()
              : [],
    );
  }
}

class AssignedCbtExercise {
  final CbtExerciseModel exercise;
  final bool completed;
  final DateTime assignedAt;
  final DateTime? completedAt;

  const AssignedCbtExercise({
    required this.exercise,
    required this.completed,
    required this.assignedAt,
    this.completedAt,
  });

  factory AssignedCbtExercise.fromJson(Map<String, dynamic> json) {
    final exerciseData = json['exercise'] as Map<String, dynamic>?;
    return AssignedCbtExercise(
      exercise: CbtExerciseModel.fromJson(exerciseData ?? json),
      completed: json['completed'] as bool? ?? false,
      assignedAt: DateTime.parse(
          json['assignedAt'] as String? ??
              json['createdAt'] as String? ??
              DateTime.now().toIso8601String()),
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'] as String)
          : null,
    );
  }
}
