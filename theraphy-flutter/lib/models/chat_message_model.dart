/// ChatMessage from the new PostgreSQL/Prisma backend.
/// Fields: id (UUID), conversationId, senderId, receiverId, content, isRead, readAt
class ChatMessageModel {
  final String id;
  final String conversationId;
  final SenderInfo sender;
  final SenderInfo receiver;
  final String message;
  final bool read;
  final DateTime? readAt;
  final DateTime createdAt;

  const ChatMessageModel({
    required this.id,
    required this.conversationId,
    required this.sender,
    required this.receiver,
    required this.message,
    required this.read,
    this.readAt,
    required this.createdAt,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageModel(
      id: json['id'] as String? ?? '',
      conversationId: json['conversationId'] as String? ?? '',
      sender: SenderInfo.fromJson(
          json['sender'] as Map<String, dynamic>? ?? {'id': json['senderId'] ?? ''}),
      receiver: SenderInfo.fromJson(
          json['receiver'] as Map<String, dynamic>? ?? {'id': json['receiverId'] ?? ''}),
      message: json['content'] as String? ?? '',
      read: json['isRead'] as bool? ?? false,
      readAt: json['readAt'] != null
          ? DateTime.parse(json['readAt'] as String)
          : null,
      createdAt: DateTime.parse(
          json['createdAt'] as String? ?? DateTime.now().toIso8601String()),
    );
  }
}

class SenderInfo {
  final String id;
  final String name;
  final String role;

  const SenderInfo({
    required this.id,
    required this.name,
    required this.role,
  });

  factory SenderInfo.fromJson(Map<String, dynamic> json) {
    // New backend nests user info inside sender object
    final user = json['user'] as Map<String, dynamic>?;
    return SenderInfo(
      id: json['id'] as String? ?? '',
      name: user?['name'] as String? ?? json['name'] as String? ?? '',
      role: user?['role'] as String? ?? json['role'] as String? ?? '',
    );
  }
}
