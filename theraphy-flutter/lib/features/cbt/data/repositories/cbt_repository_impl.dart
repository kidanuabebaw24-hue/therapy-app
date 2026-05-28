import '../../models/cbt_exercise_model.dart';
import '../../domain/repositories/cbt_repository.dart';
import '../datasources/cbt_remote_data_source.dart';

class CbtRepositoryImpl implements CbtRepository {
  final CbtRemoteDataSource _remoteDataSource;

  CbtRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<CbtExerciseModel>> getAssignedExercises() async {
    final data = await _remoteDataSource.getAssignedExercises();
    return data.map((e) => CbtExerciseModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<dynamic>> getExercisesHistory() async {
    return await _remoteDataSource.getExercisesHistory();
  }

  @override
  Future<void> submitExercise(String exerciseId, List<dynamic> responses) async {
    await _remoteDataSource.submitExercise(exerciseId, responses);
  }
}
