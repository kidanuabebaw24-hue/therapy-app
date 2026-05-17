import '../../../../models/session_model.dart';
import '../../domain/repositories/session_repository.dart';
import '../datasources/session_remote_data_source.dart';

class SessionRepositoryImpl implements SessionRepository {
  final SessionRemoteDataSource _remoteDataSource;

  SessionRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<SessionModel>> getSessions() async {
    final data = await _remoteDataSource.getSessions();
    return data.map((e) => SessionModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<SessionModel> bookSession({
    required String therapistId,
    required DateTime date,
    required int duration,
    required String type,
  }) async {
    final data = await _remoteDataSource.bookSession(
      therapistId: therapistId,
      date: date,
      duration: duration,
      type: type,
    );
    return SessionModel.fromJson(data);
  }
}
