import '../../../../core/storage/secure_storage_service.dart';
import '../../../../models/user_model.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;
  final SecureStorageService _storageService;

  AuthRepositoryImpl(this._remoteDataSource, this._storageService);

  @override
  Future<UserModel> login(String email, String password) async {
    final data = await _remoteDataSource.login(email, password);
    final user = UserModel.fromJson(data['user'] ?? data);
    
    final token = data['token'] as String?;
    if (token != null) {
      await _storageService.saveToken(token);
    }
    
    return user;
  }

  @override
  Future<UserModel> register(String name, String email, String password) async {
    final data = await _remoteDataSource.register(name, email, password);
    final user = UserModel.fromJson(data['user'] ?? data);
    
    final token = data['token'] as String?;
    if (token != null) {
      await _storageService.saveToken(token);
    }
    
    return user;
  }

  @override
  Future<UserModel> getProfile() async {
    final data = await _remoteDataSource.getProfile();
    return UserModel.fromJson(data['user'] ?? data);
  }

  @override
  Future<void> logout() async {
    await _storageService.deleteToken();
  }

  @override
  Future<void> forgotPassword(String email) async {
    await _remoteDataSource.forgotPassword(email);
  }

  @override
  Future<void> resetPassword(String token, String newPassword) async {
    await _remoteDataSource.resetPassword(token, newPassword);
  }
}
