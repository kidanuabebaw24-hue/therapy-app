import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_constants.dart';
import '../../../../models/assessment_model.dart';

class AssessmentRemoteDataSource {
  final ApiClient _apiClient;

  AssessmentRemoteDataSource(this._apiClient);

  Future<List<dynamic>> getAssessments() async {
    final response = await _apiClient.get(ApiConstants.assessmentHistory);
    return response.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> submitAssessment(Map<String, dynamic> payload) async {
    final response = await _apiClient.post(
      ApiConstants.submitAssessment,
      data: payload,
    );
    return response.data['data'] ?? response.data;
  }
}
