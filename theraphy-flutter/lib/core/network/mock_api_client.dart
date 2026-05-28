import 'package:dio/dio.dart';
import 'api_client.dart';
import 'api_constants.dart';
import '../../mock_data/mock_data_source.dart';

class MockApiClient extends ApiClient {
  MockApiClient({required super.storageService});

  @override
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    await Future.delayed(const Duration(milliseconds: 500));

    if (path == ApiConstants.profile) {
      return Response(
        requestOptions: RequestOptions(path: path),
        data: {'user': MockData.mockUser.toJson()},
        statusCode: 200,
      );
    }

    if (path == ApiConstants.moods) {
      return Response(
        requestOptions: RequestOptions(path: path),
        data: MockData.mockMoods.map((m) => m.toJson()).toList(),
        statusCode: 200,
      );
    }

    if (path == ApiConstants.therapists) {
      return Response(
        requestOptions: RequestOptions(path: path),
        data: MockData.therapists.map((t) => t.toJson()).toList(),
        statusCode: 200,
      );
    }

    if (path == ApiConstants.assessmentQuestions) {
      return Response(
        requestOptions: RequestOptions(path: path),
        data: MockData.assessmentQuestions.map((q) => q.toJson()).toList(),
        statusCode: 200,
      );
    }

    return super.get(path, queryParameters: queryParameters);
  }

  @override
  Future<Response> post(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    await Future.delayed(const Duration(milliseconds: 800));

    if (path == ApiConstants.login || path == ApiConstants.register) {
      return Response(
        requestOptions: RequestOptions(path: path),
        data: {
          'user': MockData.mockUser.toJson(),
          'token': 'mock_token_123',
        },
        statusCode: 200,
      );
    }

    if (path == ApiConstants.moods) {
      return Response(
        requestOptions: RequestOptions(path: path),
        data: {
          ...data as Map<String, dynamic>,
          'id': 'm_new_${DateTime.now().millisecondsSinceEpoch}',
          'user': MockData.mockUser.id,
          'createdAt': DateTime.now().toIso8601String(),
        },
        statusCode: 201,
      );
    }

    return Response(
      requestOptions: RequestOptions(path: path),
      data: {'message': 'Mock success'},
      statusCode: 200,
    );
  }

  @override
  Future<Response> put(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return Response(
      requestOptions: RequestOptions(path: path),
      data: data ?? {'message': 'Mock success'},
      statusCode: 200,
    );
  }

  @override
  Future<Response> delete(String path, {Map<String, dynamic>? queryParameters}) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return Response(
      requestOptions: RequestOptions(path: path),
      data: {'message': 'Mock deleted'},
      statusCode: 200,
    );
  }
}
