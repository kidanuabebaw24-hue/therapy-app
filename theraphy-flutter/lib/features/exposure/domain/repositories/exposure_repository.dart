import '../../../../models/exposure_model.dart';

abstract class ExposureRepository {
  Future<List<ExposureLevel>> getExposureSessions();
  Future<List<ExposureLevel>> createExposurePlan(Map<String, dynamic> payload);
  Future<ExposureLevel> updateExposureSession(String id, Map<String, dynamic> payload);
}
