import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_constants.dart';
import '../../../../models/mood_model.dart';

class MoodRemoteDataSource {
  final ApiClient _apiClient;

  MoodRemoteDataSource(this._apiClient);

  Future<List<dynamic>> getMoodHistory() async {
    final response = await _apiClient.get(ApiConstants.moods);
    final data = response.data['data'];
    return (data as List<dynamic>?) ?? [];
  }

  Future<Map<String, dynamic>> submitMood(MoodModel mood) async {
    final response = await _apiClient.post(
      ApiConstants.moods,
      data: mood.toJson(),
    );
    return response.data['data'] as Map<String, dynamic>;
  }
}
