import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_endpoints.dart';
import '../core/network/network_providers.dart';
import '../models/session_model.dart';
import '../features/auth/presentation/providers/auth_provider.dart';

class SessionState {
  final List<SessionModel> sessions;
  final bool isLoading;
  final bool isSubmitting;
  final String? error;

  const SessionState({
    this.sessions = const [],
    this.isLoading = false,
    this.isSubmitting = false,
    this.error,
  });

  SessionState copyWith({
    List<SessionModel>? sessions,
    bool? isLoading,
    bool? isSubmitting,
    String? error,
  }) {
    return SessionState(
      sessions: sessions ?? this.sessions,
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: error,
    );
  }

  List<SessionModel> get upcoming => sessions
      .where((s) => s.isScheduled && s.date.isAfter(DateTime.now()))
      .toList()
    ..sort((a, b) => a.date.compareTo(b.date));

  List<SessionModel> get past => sessions
      .where((s) => s.isCompleted || s.date.isBefore(DateTime.now()))
      .toList()
    ..sort((a, b) => b.date.compareTo(a.date));
}

class SessionNotifier extends StateNotifier<SessionState> {
  final Ref _ref;

  SessionNotifier(this._ref) : super(const SessionState());

  Future<void> fetchSessions() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final api = _ref.read(apiClientProvider);
      final user = _ref.read(currentUserProvider);
      final endpoint = user?.isTherapist == true
          ? ApiEndpoints.therapistAppointments
          : ApiEndpoints.myAppointments;

      final response = await api.get(endpoint);
      final data = response.data as List? ?? [];
      final sessions = data
          .map((s) => SessionModel.fromJson(s as Map<String, dynamic>))
          .toList();
      state = state.copyWith(sessions: sessions, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> bookSession({
    required String therapistId,
    required DateTime date,
    required int duration,
    required String type,
    String? notes,
  }) async {
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      final api = _ref.read(apiClientProvider);
      final response = await api.post(
        ApiEndpoints.appointments,
        data: {
          'therapistId': therapistId,
          'date': date.toIso8601String(),
          'duration': duration,
          'type': type,
          if (notes != null) 'notes': notes,
        },
      );
      final session = SessionModel.fromJson(
          response.data as Map<String, dynamic>);
      state = state.copyWith(
        sessions: [session, ...state.sessions],
        isSubmitting: false,
      );
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      rethrow;
    }
  }

  Future<void> cancelSession(String sessionId) async {
    try {
      final api = _ref.read(apiClientProvider);
      await api.put(ApiEndpoints.cancelAppointment(sessionId));
      state = state.copyWith(
        sessions: state.sessions.map((s) {
          if (s.id != sessionId) return s;
          final updated = Map<String, dynamic>.from(s.toJson());
          updated['status'] = 'cancelled';
          return SessionModel.fromJson(updated);
        }).toList(),
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }
}

final sessionProvider =
    StateNotifierProvider<SessionNotifier, SessionState>((ref) {
  return SessionNotifier(ref);
});
