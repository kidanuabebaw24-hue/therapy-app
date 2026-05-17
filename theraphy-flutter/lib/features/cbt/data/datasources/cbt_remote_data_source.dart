import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_constants.dart';

class CbtRemoteDataSource {
  final ApiClient _apiClient;

  CbtRemoteDataSource(this._apiClient);

  Future<List<dynamic>> getAssignedExercises() async {
    final response = await _apiClient.get(ApiConstants.cbtExercises);
    return response.data['data'] as List<dynamic>? ?? [];
  }

  Future<List<dynamic>> getExercisesHistory() async {
    final response = await _apiClient.get(ApiConstants.cbtHistory);
    return response.data['data'] as List<dynamic>? ?? [];
  }

  Future<void> submitExercise(String exerciseId, List<dynamic> responses) async {
    await _apiClient.post(
      ApiConstants.submitCbt,
      data: {
        'exerciseId': exerciseId,
        'completed': true,
        'responses': responses,
      },
    );
  }
}
