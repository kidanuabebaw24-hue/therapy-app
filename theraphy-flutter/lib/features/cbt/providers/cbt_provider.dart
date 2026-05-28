import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/network_providers.dart';
import '../models/cbt_exercise_model.dart';
import '../domain/repositories/cbt_repository.dart';
import '../data/datasources/cbt_remote_data_source.dart';
import '../data/repositories/cbt_repository_impl.dart';

// --- Repositories ---
final cbtRemoteDataSourceProvider = Provider<CbtRemoteDataSource>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CbtRemoteDataSource(apiClient);
});

final cbtRepositoryProvider = Provider<CbtRepository>((ref) {
  final remoteDataSource = ref.watch(cbtRemoteDataSourceProvider);
  return CbtRepositoryImpl(remoteDataSource);
});

// --- State ---
enum CbtPhase { intro, breathing, steps, summary, celebration }

class CbtState {
  final List<CbtExerciseModel> exercises;
  final bool isLoading;
  final String? error;

  final CbtExerciseModel? activeExercise;
  final CbtPhase phase;
  final int currentStepIndex;
  final Map<int, dynamic> responses;
  final bool isSubmitting;
  final DateTime? startTime;
  final String? postExerciseEmotion;

  CbtState({
    this.exercises = const [],
    this.isLoading = false,
    this.error,
    this.activeExercise,
    this.phase = CbtPhase.intro,
    this.currentStepIndex = 0,
    this.responses = const {},
    this.isSubmitting = false,
    this.startTime,
    this.postExerciseEmotion,
  });

  CbtState copyWith({
    List<CbtExerciseModel>? exercises,
    bool? isLoading,
    String? error,
    CbtExerciseModel? activeExercise,
    CbtPhase? phase,
    int? currentStepIndex,
    Map<int, dynamic>? responses,
    bool? isSubmitting,
    DateTime? startTime,
    String? postExerciseEmotion,
  }) {
    return CbtState(
      exercises: exercises ?? this.exercises,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      activeExercise: activeExercise ?? this.activeExercise,
      phase: phase ?? this.phase,
      currentStepIndex: currentStepIndex ?? this.currentStepIndex,
      responses: responses ?? this.responses,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      startTime: startTime ?? this.startTime,
      postExerciseEmotion: postExerciseEmotion ?? this.postExerciseEmotion,
    );
  }
}

// --- Notifier ---
class CbtNotifier extends StateNotifier<CbtState> {
  final CbtRepository _repository;

  CbtNotifier(this._repository) : super(CbtState());

  Future<void> fetchExercises() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final exercises = await _repository.getAssignedExercises();
      state = state.copyWith(exercises: exercises, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void startExercise(String exerciseId) {
    try {
      final exercise = state.exercises.firstWhere((e) => e.id == exerciseId);
      state = state.copyWith(
        activeExercise: exercise,
        phase: CbtPhase.intro,
        startTime: DateTime.now(),
        currentStepIndex: 0,
        responses: {},
        postExerciseEmotion: null,
      );
    } catch (e) {
      // Exercise not found
    }
  }

  void startBreathing() {
    state = state.copyWith(phase: CbtPhase.breathing);
  }

  void startSteps() {
    state = state.copyWith(phase: CbtPhase.steps, currentStepIndex: 0);
  }

  void updateResponse(int stepIndex, dynamic value) {
    final newResponses = Map<int, dynamic>.from(state.responses);
    newResponses[stepIndex] = value;
    state = state.copyWith(responses: newResponses);
  }

  void nextStep() {
    if (state.activeExercise == null) return;
    
    if (state.currentStepIndex < state.activeExercise!.steps.length - 1) {
      state = state.copyWith(currentStepIndex: state.currentStepIndex + 1);
    } else {
      state = state.copyWith(phase: CbtPhase.summary);
    }
  }

  void previousStep() {
    if (state.currentStepIndex > 0) {
      state = state.copyWith(currentStepIndex: state.currentStepIndex - 1);
    } else if (state.phase == CbtPhase.steps) {
      state = state.copyWith(phase: CbtPhase.intro);
    }
  }

  void showCelebration() {
    state = state.copyWith(phase: CbtPhase.celebration);
  }

  void updatePostExerciseEmotion(String emotion) {
    state = state.copyWith(postExerciseEmotion: emotion);
  }

  Future<void> complete() async {
    if (state.activeExercise == null) return;
    
    state = state.copyWith(isSubmitting: true);
    try {
      final formattedResponses = state.responses.entries.map((entry) {
        final stepIndex = entry.key;
        final answer = entry.value;
        final step = state.activeExercise!.steps[stepIndex];
        return {
          'questionId': step.id ?? stepIndex.toString(),
          'answer': answer,
        };
      }).toList();

      await _repository.submitExercise(
        state.activeExercise!.id,
        formattedResponses,
      );
      state = state.copyWith(isSubmitting: false);
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
    }
  }

  void clearActiveExercise() {
    state = CbtState(
      exercises: state.exercises,
    );
  }
}

// --- Provider ---
final cbtProvider = StateNotifierProvider<CbtNotifier, CbtState>((ref) {
  final repository = ref.watch(cbtRepositoryProvider);
  return CbtNotifier(repository);
});
