import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/network_providers.dart';
import '../../../../models/assessment_model.dart';
import '../../domain/repositories/assessment_repository.dart';
import '../../data/datasources/assessment_remote_data_source.dart';
import '../../data/repositories/assessment_repository_impl.dart';

// --- Repositories ---
final assessmentRemoteDataSourceProvider = Provider<AssessmentRemoteDataSource>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AssessmentRemoteDataSource(apiClient);
});

final assessmentRepositoryProvider = Provider<AssessmentRepository>((ref) {
  final remoteDataSource = ref.watch(assessmentRemoteDataSourceProvider);
  return AssessmentRepositoryImpl(remoteDataSource);
});

// --- State ---
class AssessmentState {
  final List<AssessmentResult> assessments;
  final bool isLoading;
  final bool isSubmitting;
  final String? error;

  const AssessmentState({
    this.assessments = const [],
    this.isLoading = false,
    this.isSubmitting = false,
    this.error,
  });

  AssessmentState copyWith({
    List<AssessmentResult>? assessments,
    bool? isLoading,
    bool? isSubmitting,
    String? error,
  }) {
    return AssessmentState(
      assessments: assessments ?? this.assessments,
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: error,
    );
  }
}

// --- Notifier ---
class AssessmentNotifier extends StateNotifier<AssessmentState> {
  final AssessmentRepository _repository;

  AssessmentNotifier(this._repository) : super(const AssessmentState());

  Future<void> fetchAssessments() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final assessments = await _repository.getAssessments();
      state = state.copyWith(assessments: assessments, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<AssessmentResult?> submitAssessment({
    required String type,
    required List<Map<String, dynamic>> responses,
  }) async {
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      final payload = {
        'type': type,
        'responses': responses,
        'notes': '',
      };
      final newAssessment = await _repository.submitAssessment(payload);
      
      state = state.copyWith(
        assessments: [newAssessment, ...state.assessments],
        isSubmitting: false,
      );
      return newAssessment;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return null;
    }
  }
}

// --- Provider ---
final assessmentProvider = StateNotifierProvider<AssessmentNotifier, AssessmentState>((ref) {
  final repository = ref.watch(assessmentRepositoryProvider);
  return AssessmentNotifier(repository);
});
