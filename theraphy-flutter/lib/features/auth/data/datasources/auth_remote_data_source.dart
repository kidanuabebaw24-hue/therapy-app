import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_constants.dart';

class AuthRemoteDataSource {
  final ApiClient _apiClient;

  AuthRemoteDataSource(this._apiClient);

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _apiClient.post(
      ApiConstants.login,
      data: {'email': email, 'password': password},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> register(String name, String email, String password) async {
    final response = await _apiClient.post(
      ApiConstants.register,
      data: {'name': name, 'email': email, 'password': password},
    );
    return response.data;
  }

  Future<Map<String, dynamic>> getProfile() async {
    final response = await _apiClient.get(ApiConstants.profile);
    return response.data;
  }

  Future<void> forgotPassword(String email) async {
    await _apiClient.post(
      ApiConstants.forgotPassword,
      data: {'email': email},
    );
  }

  Future<void> resetPassword(String token, String newPassword) async {
    await _apiClient.post(
      ApiConstants.resetPassword,
      data: {'token': token, 'password': newPassword},
    );
  }
}
