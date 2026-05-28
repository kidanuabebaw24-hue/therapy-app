import '../../domain/repositories/exposure_repository.dart';
import '../datasources/exposure_remote_data_source.dart';
import '../../../../models/exposure_model.dart';

class ExposureRepositoryImpl implements ExposureRepository {
  final ExposureRemoteDataSource _remoteDataSource;

  ExposureRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<ExposureLevel>> getExposureSessions() async {
    final rawList = await _remoteDataSource.getExposureSessions();
    return rawList.map((json) => ExposureLevel.fromJson(json as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<ExposureLevel>> createExposurePlan(Map<String, dynamic> payload) async {
    final rawList = await _remoteDataSource.createExposurePlan(payload);
    return rawList.map((json) => ExposureLevel.fromJson(json as Map<String, dynamic>)).toList();
  }

  @override
  Future<ExposureLevel> updateExposureSession(String id, Map<String, dynamic> payload) async {
    final rawMap = await _remoteDataSource.updateExposureSession(id, payload);
    return ExposureLevel.fromJson(rawMap);
  }
}
