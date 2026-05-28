import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../constants/app_constants.dart';
import '../storage/secure_storage_service.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';

class ChatSocketService {
  io.Socket? _socket;
  bool _connected = false;

  bool get isConnected => _connected;
  io.Socket? get socket => _socket;

  String get _socketBaseUrl {
    final api = AppConstants.baseUrl;
    if (api.endsWith('/api')) {
      return api.substring(0, api.length - 4);
    }
    return api.replaceAll(RegExp(r'/api/?$'), '');
  }

  Future<void> connect(String token, String userId) async {
    if (_socket != null && _connected) return;

    _socket?.dispose();

    _socket = io.io(
      _socketBaseUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );

    _socket!.onConnect((_) {
      _connected = true;
      _socket!.emit('join', userId);
    });

    _socket!.onDisconnect((_) {
      _connected = false;
    });

    _socket!.connect();
  }

  void joinConversation(String conversationId) {
    _socket?.emit('join-conversation', {'conversationId': conversationId});
  }

  void sendMessage({
    required String receiverId,
    required String message,
    required String conversationId,
  }) {
    _socket?.emit('send-message', {
      'receiverId': receiverId,
      'message': message,
      'conversationId': conversationId,
    });
  }

  void sendTyping(String conversationId, bool isTyping) {
    _socket?.emit('typing', {
      'conversationId': conversationId,
      'isTyping': isTyping,
    });
  }

  void markRead(String conversationId) {
    _socket?.emit('mark-read', {'conversationId': conversationId});
  }

  void onNewMessage(void Function(dynamic) handler) {
    _socket?.on('new-message', handler);
  }

  void onMessageSent(void Function(dynamic) handler) {
    _socket?.on('message-sent', handler);
  }

  void onUserTyping(void Function(dynamic) handler) {
    _socket?.on('user-typing', handler);
  }

  void off(String event) {
    _socket?.off(event);
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _connected = false;
  }
}

final chatSocketServiceProvider = Provider<ChatSocketService>((ref) {
  final service = ChatSocketService();
  ref.onDispose(() => service.disconnect());
  return service;
});

final chatSocketConnectProvider = FutureProvider<void>((ref) async {
  final auth = ref.watch(authProvider);
  final user = auth.user;
  if (user == null) return;

  final token = await SecureStorageService().getToken();
  if (token == null || token.isEmpty) return;

  await ref.read(chatSocketServiceProvider).connect(token, user.id);
});
