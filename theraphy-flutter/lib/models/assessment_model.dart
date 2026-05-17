enum AssessmentSeverity { mild, moderate, severe }

class AssessmentQuestion {
  final String id;
  final String text;
  final List<String> options;
  final String type; // 'multiple_choice', 'rating', 'yes_no'

  const AssessmentQuestion({
    required this.id,
    required this.text,
    required this.options,
    this.type = 'multiple_choice',
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'text': text,
    'options': options,
    'type': type,
  };

  factory AssessmentQuestion.fromJson(Map<String, dynamic> json) => AssessmentQuestion(
    id: json['id'] as String? ?? '',
    text: json['text'] as String? ?? '',
    options: List<String>.from(json['options'] as List? ?? []),
    type: json['type'] as String? ?? 'multiple_choice',
  );
}

class AssessmentResult {
  final String id;
  final int score;
  final AssessmentSeverity severity;
  final DateTime completedAt;
  final Map<String, int> answers;

  const AssessmentResult({
    required this.id,
    required this.score,
    required this.severity,
    required this.completedAt,
    required this.answers,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'score': score,
    'severity': severity.name,
    'completedAt': completedAt.toIso8601String(),
    'answers': answers,
  };

  factory AssessmentResult.fromJson(Map<String, dynamic> json) {
    // Map responses list to answers map if available
    Map<String, int> mappedAnswers = {};
    if (json['responses'] != null && json['responses'] is List) {
      for (var r in json['responses']) {
        if (r['questionId'] != null) {
          mappedAnswers[r['questionId']] = r['score'] ?? 0;
        }
      }
    } else {
      mappedAnswers = Map<String, int>.from(json['answers'] as Map? ?? {});
    }

    return AssessmentResult(
      id: json['id'] as String? ?? '',
      score: json['score'] as int? ?? 0,
      severity: AssessmentSeverity.values.firstWhere(
        (e) => e.name == json['severity'],
        orElse: () => AssessmentSeverity.mild,
      ),
      completedAt: DateTime.tryParse(json['completedAt'] as String? ?? json['createdAt'] as String? ?? '') ?? DateTime.now(),
      answers: mappedAnswers,
    );
  }

  String get severityLabel {
    switch (severity) {
      case AssessmentSeverity.mild: return 'Mild';
      case AssessmentSeverity.moderate: return 'Moderate';
      case AssessmentSeverity.severe: return 'Severe';
    }
  }
}
