import '../../../../models/session_model.dart';

abstract class SessionRepository {
  Future<List<SessionModel>> getSessions();
  Future<SessionModel> bookSession({
    required String therapistId,
    required DateTime date,
    required int duration,
    required String type,
  });
}
