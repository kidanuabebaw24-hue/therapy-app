import '../../../../models/mood_model.dart';
import '../../domain/repositories/mood_repository.dart';
import '../datasources/mood_remote_data_source.dart';

class MoodRepositoryImpl implements MoodRepository {
  final MoodRemoteDataSource _remoteDataSource;

  MoodRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<MoodModel>> getMoodHistory() async {
    final data = await _remoteDataSource.getMoodHistory();
    return data.map((e) => MoodModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<MoodModel> submitMood(MoodModel mood) async {
    final data = await _remoteDataSource.submitMood(mood);
    return MoodModel.fromJson(data);
  }
}
