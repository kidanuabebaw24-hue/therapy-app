import '../../../../models/mood_model.dart';

abstract class MoodRepository {
  Future<List<MoodModel>> getMoodHistory();
  Future<MoodModel> submitMood(MoodModel mood);
}
