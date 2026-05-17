import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_constants.dart';

class ExposureRemoteDataSource {
  final ApiClient _apiClient;

  ExposureRemoteDataSource(this._apiClient);

  Future<List<dynamic>> getExposureSessions() async {
    final response = await _apiClient.get(ApiConstants.exposureSessions);
    // Backend formats return as { success: true, data: [...] }
    return response.data['data'] as List<dynamic>? ?? [];
  }

  Future<List<dynamic>> createExposurePlan(Map<String, dynamic> payload) async {
    final response = await _apiClient.post(
      ApiConstants.exposurePlan,
      data: payload,
    );
    final responseData = response.data['data'];
    if (responseData is List) {
      return responseData;
    } else if (responseData is Map) {
      return [responseData];
    }
    return [];
  }

  Future<Map<String, dynamic>> updateExposureSession(String id, Map<String, dynamic> payload) async {
    final response = await _apiClient.patch(
      '${ApiConstants.exposureUpdate}/$id',
      data: payload,
    );
    return response.data['data'] as Map<String, dynamic>? ?? {};
  }
}
