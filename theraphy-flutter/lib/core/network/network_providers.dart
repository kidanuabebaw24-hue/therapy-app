import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api_client.dart';
import 'mock_api_client.dart';
import '../storage/secure_storage_service.dart';
import '../constants/app_constants.dart';

final secureStorageProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

final apiClientProvider = Provider<ApiClient>((ref) {
  final storageService = ref.watch(secureStorageProvider);
  if (AppConstants.useMockData) {
    return MockApiClient(storageService: storageService);
  }
  return ApiClient(storageService: storageService);
});
