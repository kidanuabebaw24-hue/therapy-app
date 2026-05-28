import '../../../../models/assessment_model.dart';
import '../../domain/repositories/assessment_repository.dart';
import '../datasources/assessment_remote_data_source.dart';

class AssessmentRepositoryImpl implements AssessmentRepository {
  final AssessmentRemoteDataSource _remoteDataSource;

  AssessmentRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<AssessmentResult>> getAssessments() async {
    final data = await _remoteDataSource.getAssessments();
    return data.map((e) => AssessmentResult.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<AssessmentResult> submitAssessment(Map<String, dynamic> payload) async {
    final data = await _remoteDataSource.submitAssessment(payload);
    return AssessmentResult.fromJson(data);
  }
}
