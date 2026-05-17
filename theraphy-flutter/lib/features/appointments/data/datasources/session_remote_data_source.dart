import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_constants.dart';

class SessionRemoteDataSource {
  final ApiClient _apiClient;

  SessionRemoteDataSource(this._apiClient);

  Future<List<dynamic>> getSessions() async {
    final response = await _apiClient.get(ApiConstants.appointments);
    return response.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> bookSession({
    required String therapistId,
    required DateTime date,
    required int duration,
    required String type,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.bookAppointment,
      data: {
        'therapist': therapistId,
        'date': date.toIso8601String(),
        'duration': duration,
        'type': type,
      },
    );
    return response.data;
  }
}
