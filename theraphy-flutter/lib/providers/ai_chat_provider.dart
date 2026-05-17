import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_constants.dart';
import '../core/network/api_exception.dart';
import '../core/network/network_providers.dart';
import '../models/ai_conversation_model.dart';

class AiChatState {
  final List<AiConversationModel> conversations;
  final AiConversationModel? activeConversation;
  final bool isLoading;
  final bool isSending;
  final String? error;

  const AiChatState({
    this.conversations = const [],
    this.activeConversation,
    this.isLoading = false,
    this.isSending = false,
    this.error,
  });

  AiChatState copyWith({
    List<AiConversationModel>? conversations,
    AiConversationModel? activeConversation,
    bool? isLoading,
    bool? isSending,
    String? error,
  }) {
    return AiChatState(
      conversations: conversations ?? this.conversations,
      activeConversation: activeConversation ?? this.activeConversation,
      isLoading: isLoading ?? this.isLoading,
      isSending: isSending ?? this.isSending,
      error: error,
    );
  }
}

class AiChatNotifier extends StateNotifier<AiChatState> {
  final Ref _ref;

  AiChatNotifier(this._ref) : super(const AiChatState());

  Future<void> fetchConversations() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final api = _ref.read(apiClientProvider);
      final res =
          await api.get(ApiConstants.aiChat);
      final rawData = res.data is Map ? (res.data as Map)['data'] ?? (res.data as Map)['conversations'] : res.data;
      final list = (rawData as List? ?? [])
          .map((c) => AiConversationModel.fromJson(c as Map<String, dynamic>))
          .toList();
      state = state.copyWith(conversations: list, isLoading: false);
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, error: e.message);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> startConversation(String initialMessage) async {
    state = state.copyWith(isSending: true, error: null);
    try {
      final api = _ref.read(apiClientProvider);
      final res = await api.post(
        ApiConstants.aiChat,
        data: {'initialMessage': initialMessage},
      );

      final rawData = res.data is Map ? (res.data as Map)['data'] ?? (res.data as Map)['conversation'] : res.data;
      final conversation = AiConversationModel.fromJson(
          rawData as Map<String, dynamic>);
      state = state.copyWith(
        conversations: [conversation, ...state.conversations],
        activeConversation: conversation,
        isSending: false,
      );
    } on ApiException catch (e) {
      state = state.copyWith(isSending: false, error: e.message);
      rethrow;
    } catch (e) {
      state = state.copyWith(isSending: false, error: e.toString());
      rethrow;
    }
  }

  Future<void> sendMessage(String conversationId, String message) async {
    // Optimistically add user message
    final userMsg = AiMessage(role: 'user', content: message);
    if (state.activeConversation != null) {
      final updated = AiConversationModel(
        id: state.activeConversation!.id,
        title: state.activeConversation!.title,
        messages: [...state.activeConversation!.messages, userMsg],
        messageCount: state.activeConversation!.messageCount + 1,
        createdAt: state.activeConversation!.createdAt,
        updatedAt: DateTime.now(),
      );
      state = state.copyWith(activeConversation: updated, isSending: true);
    }

    try {
      final api = _ref.read(apiClientProvider);
      final res = await api.post(
        '${ApiConstants.aiChat}/$conversationId/messages',
        data: {'message': message},
      );

      final rawData = res.data is Map ? (res.data as Map)['data'] ?? (res.data as Map)['message'] : res.data;
      final aiMsg =
          AiMessage.fromJson(rawData as Map<String, dynamic>);
      if (state.activeConversation != null) {
        final updated = AiConversationModel(
          id: state.activeConversation!.id,
          title: state.activeConversation!.title,
          messages: [...state.activeConversation!.messages, aiMsg],
          messageCount: state.activeConversation!.messageCount + 1,
          createdAt: state.activeConversation!.createdAt,
          updatedAt: DateTime.now(),
        );
        state = state.copyWith(activeConversation: updated, isSending: false);
      }
    } on ApiException catch (e) {
      state = state.copyWith(isSending: false, error: e.message);
      rethrow;
    } catch (e) {
      state = state.copyWith(isSending: false, error: e.toString());
      rethrow;
    }
  }

  Future<void> loadConversation(String conversationId) async {
    state = state.copyWith(isLoading: true);
    try {
      final api = _ref.read(apiClientProvider);
      final res = await api.get(
        '${ApiConstants.aiChat}/$conversationId',
      );
      final rawData = res.data is Map ? (res.data as Map)['data'] ?? (res.data as Map)['conversation'] : res.data;
      final conversation = AiConversationModel.fromJson(
          rawData as Map<String, dynamic>);
      state =
          state.copyWith(activeConversation: conversation, isLoading: false);
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, error: e.message);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void clearActive() {
    state = state.copyWith(activeConversation: null);
  }
}

final aiChatProvider =
    StateNotifierProvider<AiChatNotifier, AiChatState>((ref) {
  return AiChatNotifier(ref);
});
