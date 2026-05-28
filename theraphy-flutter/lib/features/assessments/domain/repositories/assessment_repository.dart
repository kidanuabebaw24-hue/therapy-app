import '../../../../models/assessment_model.dart';

abstract class AssessmentRepository {
  Future<List<AssessmentResult>> getAssessments();
  Future<AssessmentResult> submitAssessment(Map<String, dynamic> payload);
}
