/// ChatMessage from the new PostgreSQL/Prisma backend.
/// Fields: id (UUID), conversationId, senderId, receiverId, content, isRead, readAt

String _asString(dynamic value) {
  if (value == null) return '';
  return value.toString();
}

DateTime? _parseDateTime(dynamic value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  return DateTime.tryParse(value.toString());
}

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
      id: _asString(json['id']),
      conversationId: _asString(json['conversationId']),
      sender: SenderInfo.fromJson(
          json['sender'] as Map<String, dynamic>? ?? {'id': json['senderId'] ?? ''}),
      receiver: SenderInfo.fromJson(
          json['receiver'] as Map<String, dynamic>? ?? {'id': json['receiverId'] ?? ''}),
      message: _asString(json['content'] ?? json['message']),
      read: json['isRead'] as bool? ?? false,
      readAt: _parseDateTime(json['readAt']),
      createdAt: _parseDateTime(json['createdAt']) ?? DateTime.now(),
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
      id: _asString(json['id'] ?? json['userId']),
      name: _asString(user?['name'] ?? json['name']),
      role: _asString(user?['role'] ?? json['role']),
    );
  }
}
