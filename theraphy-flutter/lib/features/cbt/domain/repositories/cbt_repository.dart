import '../../models/cbt_exercise_model.dart';

abstract class CbtRepository {
  Future<List<CbtExerciseModel>> getAssignedExercises();
  Future<List<dynamic>> getExercisesHistory();
  Future<void> submitExercise(String exerciseId, List<dynamic> responses);
}
