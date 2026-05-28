import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_constants.dart';
import '../../../core/network/chat_socket_service.dart';
import '../../../core/network/network_providers.dart';
import '../../../models/chat_message_model.dart';
import '../../auth/presentation/providers/auth_provider.dart';

class AssignedTherapistChat {
  final String userId;
  final String name;
  final String specialization;
  final String conversationId;

  const AssignedTherapistChat({
    required this.userId,
    required this.name,
    required this.specialization,
    required this.conversationId,
  });
}

class TherapistChatState {
  final AssignedTherapistChat? therapist;
  final List<ChatMessageModel> messages;
  final bool isLoading;
  final bool isSending;
  final bool otherTyping;
  final bool socketReady;
  final String? error;

  const TherapistChatState({
    this.therapist,
    this.messages = const [],
    this.isLoading = false,
    this.isSending = false,
    this.otherTyping = false,
    this.socketReady = false,
    this.error,
  });

  TherapistChatState copyWith({
    AssignedTherapistChat? therapist,
    List<ChatMessageModel>? messages,
    bool? isLoading,
    bool? isSending,
    bool? otherTyping,
    bool? socketReady,
    String? error,
  }) {
    return TherapistChatState(
      therapist: therapist ?? this.therapist,
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isSending: isSending ?? this.isSending,
      otherTyping: otherTyping ?? this.otherTyping,
      socketReady: socketReady ?? this.socketReady,
      error: error,
    );
  }
}

class TherapistChatNotifier extends StateNotifier<TherapistChatState> {
  final Ref _ref;
  ChatSocketService? _socketService;

  TherapistChatNotifier(this._ref) : super(const TherapistChatState());

  Future<void> initialize() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final authUser = _ref.read(authProvider).user;
      if (authUser == null) {
        state = state.copyWith(isLoading: false, error: 'Not signed in');
        return;
      }

      final api = _ref.read(apiClientProvider);
      final assignmentRes =
          await api.get(ApiConstants.myTherapistAssignment);
      final assignment = assignmentRes.data['data'] ?? assignmentRes.data;
      final therapistProfile = assignment['therapist'];
      final therapistUser = therapistProfile?['user'];

      if (therapistProfile == null || therapistUser == null) {
        state = state.copyWith(
          isLoading: false,
          error: 'No therapist assigned yet. Book a session or ask admin to assign one.',
        );
        return;
      }

      final therapistUserId = therapistUser['id'] as String;
      final conversationId = '${authUser.id}_$therapistUserId';

      final therapist = AssignedTherapistChat(
        userId: therapistUserId,
        name: therapistUser['name'] as String? ?? 'Therapist',
        specialization:
            therapistProfile['specialization'] as String? ?? 'Therapist',
        conversationId: conversationId,
      );

      _socketService = _ref.read(chatSocketServiceProvider);
      final token = await _ref.read(secureStorageProvider).getToken();
      if (token != null) {
        await _socketService!.connect(token, authUser.id);
      }

      _setupSocketListeners(conversationId);

      _socketService!.joinConversation(conversationId);

      final messagesRes =
          await api.get(ApiConstants.chatMessages(conversationId));
      final payload = messagesRes.data['data'] ?? messagesRes.data;
      final rawMessages = (payload['messages'] as List? ?? [])
          .map((e) => ChatMessageModel.fromJson(e as Map<String, dynamic>))
          .toList();

      try {
        await api.put(ApiConstants.chatMarkRead(conversationId));
      } catch (_) {}

      state = state.copyWith(
        therapist: therapist,
        messages: rawMessages,
        isLoading: false,
        socketReady: _socketService?.isConnected ?? false,
      );

      if (!(_socketService?.isConnected ?? false)) {
        _startRestPolling(conversationId);
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString().replaceAll('Exception:', '').trim(),
      );
    }
  }

  void _setupSocketListeners(String conversationId) {
    final socket = _socketService;
    if (socket == null) return;

    socket.off('new-message');
    socket.off('message-sent');
    socket.off('user-typing');

    socket.onNewMessage((data) {
      final msg = ChatMessageModel.fromJson(data as Map<String, dynamic>);
      if (msg.conversationId != conversationId) return;
      if (state.messages.any((m) => m.id == msg.id)) return;
      state = state.copyWith(messages: [...state.messages, msg]);
      socket.markRead(conversationId);
    });

    socket.onMessageSent((data) {
      final msg = ChatMessageModel.fromJson(data as Map<String, dynamic>);
      if (msg.conversationId != conversationId) return;
      if (state.messages.any((m) => m.id == msg.id)) return;
      state = state.copyWith(messages: [...state.messages, msg]);
    });

    socket.onUserTyping((data) {
      final map = data as Map<String, dynamic>;
      if (map['conversationId'] != conversationId) return;
      state = state.copyWith(otherTyping: map['isTyping'] == true);
    });
  }

  Future<void> sendMessage(String text) async {
    final therapist = state.therapist;
    if (therapist == null || text.trim().isEmpty) return;

    state = state.copyWith(isSending: true);

    try {
      final socket = _socketService;
      if (socket != null && socket.isConnected) {
        socket.sendMessage(
          receiverId: therapist.userId,
          message: text.trim(),
          conversationId: therapist.conversationId,
        );
      } else {
        final api = _ref.read(apiClientProvider);
        final res = await api.post(
          ApiConstants.chatSendMessage,
          data: {
            'receiverId': therapist.userId,
            'message': text.trim(),
            'conversationId': therapist.conversationId,
          },
        );
        final sent = res.data['data'] ?? res.data;
        final msg = ChatMessageModel.fromJson(sent as Map<String, dynamic>);
        if (!state.messages.any((m) => m.id == msg.id)) {
          state = state.copyWith(messages: [...state.messages, msg]);
        }
      }
    } finally {
      state = state.copyWith(isSending: false);
    }
  }

  void _startRestPolling(String conversationId) {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 4));
      if (state.therapist?.conversationId != conversationId) return false;
      if (_socketService?.isConnected ?? false) return false;
      try {
        final api = _ref.read(apiClientProvider);
        final messagesRes =
            await api.get(ApiConstants.chatMessages(conversationId));
        final payload = messagesRes.data['data'] ?? messagesRes.data;
        final rawMessages = (payload['messages'] as List? ?? [])
            .map((e) => ChatMessageModel.fromJson(e as Map<String, dynamic>))
            .toList();
        state = state.copyWith(messages: rawMessages);
      } catch (_) {}
      return state.therapist?.conversationId == conversationId &&
          !(_socketService?.isConnected ?? false);
    });
  }

  void setTyping(bool typing) {
    final therapist = state.therapist;
    if (therapist == null) return;
    _socketService?.sendTyping(therapist.conversationId, typing);
  }

  @override
  void dispose() {
    _socketService?.off('new-message');
    _socketService?.off('message-sent');
    _socketService?.off('user-typing');
    super.dispose();
  }
}

final therapistChatProvider =
    StateNotifierProvider<TherapistChatNotifier, TherapistChatState>((ref) {
  return TherapistChatNotifier(ref);
});
