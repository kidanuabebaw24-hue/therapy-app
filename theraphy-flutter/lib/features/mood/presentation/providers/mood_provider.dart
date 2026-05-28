import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/network_providers.dart';
import '../../../../models/mood_model.dart';
import '../../data/datasources/mood_remote_data_source.dart';
import '../../../../core/network/api_exception.dart';
import 'package:fl_chart/fl_chart.dart';

// --- Simplified Providers ---
final moodDataSourceProvider = Provider<MoodRemoteDataSource>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return MoodRemoteDataSource(apiClient);
});

// --- State ---
class MoodState {
  final List<MoodModel> moods;
  final bool isLoading;
  final bool isSubmitting;
  final String? error;

  const MoodState({
    this.moods = const [],
    this.isLoading = false,
    this.isSubmitting = false,
    this.error,
  });

  MoodState copyWith({
    List<MoodModel>? moods,
    bool? isLoading,
    bool? isSubmitting,
    String? error,
  }) {
    return MoodState(
      moods: moods ?? this.moods,
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: error,
    );
  }

  // Helper for the chart
  List<FlSpot> get anxietySpots {
    if (moods.isEmpty) return const [FlSpot(0, 0)];
    
    // Reverse to get chronological order (0 is oldest, last is newest)
    final sortedMoods = moods.reversed.toList();
    final spots = <FlSpot>[];
    
    for (int i = 0; i < sortedMoods.length; i++) {
      spots.add(FlSpot(i.toDouble(), sortedMoods[i].anxietyLevel.toDouble()));
    }
    
    // If only one data point, we need at least two for a line
    if (spots.length == 1) {
      return [FlSpot(0, spots[0].y), FlSpot(1, spots[0].y)];
    }
    
    return spots;
  }
}

// --- Notifier ---
class MoodNotifier extends StateNotifier<MoodState> {
  final MoodRemoteDataSource _dataSource;

  MoodNotifier(this._dataSource) : super(const MoodState());

  Future<void> fetchMoods() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final rawData = await _dataSource.getMoodHistory();
      final moods = rawData.map((e) => MoodModel.fromJson(e as Map<String, dynamic>)).toList();
      state = state.copyWith(moods: moods, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> logMood({
    required int moodScore,
    required int anxietyLevel,
    required List<String> emotions,
    String? notes,
  }) async {
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      final newMoodRaw = await _dataSource.submitMood(MoodModel(
        id: '',
        patientId: '',
        moodScore: moodScore,
        anxietyLevel: anxietyLevel,
        emotions: emotions,
        notes: notes,
        createdAt: DateTime.now(),
      ));
      
      final newMood = MoodModel.fromJson(newMoodRaw);
      state = state.copyWith(moods: [newMood, ...state.moods], isSubmitting: false);
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      rethrow;
    }
  }
}

// --- Provider ---
final moodProvider = StateNotifierProvider<MoodNotifier, MoodState>((ref) {
  final dataSource = ref.watch(moodDataSourceProvider);
  return MoodNotifier(dataSource);
});
