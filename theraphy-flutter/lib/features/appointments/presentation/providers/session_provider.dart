import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/network_providers.dart';
import '../../../../models/session_model.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_constants.dart';

// --- State ---
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

// --- Notifier ---
class SessionNotifier extends StateNotifier<SessionState> {
  final ApiClient _apiClient;

  SessionNotifier(this._apiClient) : super(const SessionState());

  Future<void> fetchSessions() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _apiClient.get(ApiConstants.appointments);
      final data = response.data['data'];
      if (data == null) {
        state = state.copyWith(sessions: [], isLoading: false);
        return;
      }
      final rawData = data as List<dynamic>;
      final sessions = rawData.map((e) => SessionModel.fromJson(e as Map<String, dynamic>)).toList();
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
  }) async {
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      final response = await _apiClient.post(ApiConstants.appointments, data: {
        'therapistId': therapistId,
        'date': date.toIso8601String(),
        'duration': duration,
        'type': type,
      });

      final session = SessionModel.fromJson(response.data);
      state = state.copyWith(
        sessions: [session, ...state.sessions],
        isSubmitting: false,
      );
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      rethrow;
    }
  }
}

// --- Provider ---
final sessionProvider = StateNotifierProvider<SessionNotifier, SessionState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return SessionNotifier(apiClient);
});

