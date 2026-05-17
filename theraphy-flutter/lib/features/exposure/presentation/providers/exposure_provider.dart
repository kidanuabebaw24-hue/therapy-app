import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/network_providers.dart';
import '../../../../models/exposure_model.dart';
import '../../domain/repositories/exposure_repository.dart';
import '../../data/datasources/exposure_remote_data_source.dart';
import '../../data/repositories/exposure_repository_impl.dart';

// --- Repositories & Data Sources ---
final exposureRemoteDataSourceProvider = Provider<ExposureRemoteDataSource>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ExposureRemoteDataSource(apiClient);
});

final exposureRepositoryProvider = Provider<ExposureRepository>((ref) {
  final remoteDataSource = ref.watch(exposureRemoteDataSourceProvider);
  return ExposureRepositoryImpl(remoteDataSource);
});

// --- State Class ---
class ExposureState {
  final List<ExposurePlan> plans;
  final bool isLoading;
  final bool isSubmitting;
  final String? error;

  const ExposureState({
    this.plans = const [],
    this.isLoading = false,
    this.isSubmitting = false,
    this.error,
  });

  ExposureState copyWith({
    List<ExposurePlan>? plans,
    bool? isLoading,
    bool? isSubmitting,
    String? error,
  }) {
    return ExposureState(
      plans: plans ?? this.plans,
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: error,
    );
  }
}

// --- Notifier ---
class ExposureNotifier extends StateNotifier<ExposureState> {
  final ExposureRepository _repository;

  ExposureNotifier(this._repository) : super(const ExposureState());

  Future<void> fetchPlans() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final levels = await _repository.getExposureSessions();
      final plans = _groupLevelsIntoPlans(levels);
      state = state.copyWith(plans: plans, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> createSelfGuidedPlan(String phobiaType) async {
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      // Basic 3-level staircase template
      final payload = {
        'phobiaType': phobiaType,
        'levels': [
          {
            'level': 1,
            'notes': 'Imagining the Situation',
            'description': 'Close your eyes and visualize the feared scenario in detail. Focus on deep breathing.',
          },
          {
            'level': 2,
            'notes': 'Simulated Confrontation',
            'description': 'Confront the fear in a safe, controlled environment (e.g. practicing in front of a mirror).',
          },
          {
            'level': 3,
            'notes': 'Real Life Exposure',
            'description': 'Take a gradual step into the real situation for a short, planned duration.',
          }
        ]
      };

      await _repository.createExposurePlan(payload);
      await fetchPlans();
      state = state.copyWith(isSubmitting: false);
      return true;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return false;
    }
  }

  Future<bool> submitSession({
    required String sessionId,
    required int anxietyBefore,
    required int anxietyAfter,
    required String clientNotes,
  }) async {
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      await _repository.updateExposureSession(sessionId, {
        'anxietyBefore': anxietyBefore,
        'anxietyAfter': anxietyAfter,
        'clientNotes': clientNotes,
        'status': 'completed',
      });
      await fetchPlans();
      state = state.copyWith(isSubmitting: false);
      return true;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return false;
    }
  }

  List<ExposurePlan> _groupLevelsIntoPlans(List<ExposureLevel> rawLevels) {
    if (rawLevels.isEmpty) return [];

    // Group by phobiaType
    final Map<String, List<ExposureLevel>> groups = {};
    for (var level in rawLevels) {
      final key = level.phobiaType;
      if (!groups.containsKey(key)) {
        groups[key] = [];
      }
      groups[key]!.add(level);
    }

    final List<ExposurePlan> plansList = [];

    groups.forEach((phobiaType, list) {
      // Sort by exposureLevel ascending
      list.sort((a, b) => a.exposureLevel.compareTo(b.exposureLevel));

      // Calculate locked states dynamically (Staircase unlocking mechanism)
      final List<ExposureLevel> processedLevels = [];
      bool previousCompleted = true; // Level 1 is always unlocked

      for (int i = 0; i < list.length; i++) {
        final current = list[i];
        final isLocked = !previousCompleted;
        
        processedLevels.add(current.copyWith(
          isLocked: isLocked,
          isCompleted: current.status == 'completed',
        ));

        // For the next iteration, check if this one was completed
        previousCompleted = current.status == 'completed';
      }

      // Calculate progress
      final completedCount = processedLevels.where((l) => l.isCompleted).length;
      final progress = processedLevels.isEmpty ? 0.0 : completedCount / processedLevels.length;

      plansList.add(ExposurePlan(
        id: phobiaType.replaceAll(' ', '_').toLowerCase(),
        title: phobiaType,
        description: 'Step-by-step gradual exposure hierarchy for $phobiaType.',
        levels: processedLevels,
        overallProgress: progress,
      ));
    });

    return plansList;
  }
}

// --- Provider ---
final exposureProvider = StateNotifierProvider<ExposureNotifier, ExposureState>((ref) {
  final repository = ref.watch(exposureRepositoryProvider);
  return ExposureNotifier(repository);
});
