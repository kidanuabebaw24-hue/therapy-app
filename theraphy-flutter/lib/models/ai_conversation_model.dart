/// AIConversation from the new PostgreSQL/Prisma backend.
/// Prisma schema: id (UUID), userId, title, messages (Json), isActive
class AiConversationModel {
  final String id;
  final String title;
  final List<AiMessage> messages;
  final String? lastMessage;
  final int messageCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  const AiConversationModel({
    required this.id,
    required this.title,
    required this.messages,
    this.lastMessage,
    required this.messageCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory AiConversationModel.fromJson(Map<String, dynamic> json) {
    final msgs = (json['messages'] as List? ?? [])
        .map((m) => AiMessage.fromJson(m as Map<String, dynamic>))
        .toList();

    return AiConversationModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? 'New Conversation',
      messages: msgs,
      lastMessage: json['lastMessage'] as String?,
      messageCount: json['messageCount'] as int? ?? msgs.length,
      createdAt: DateTime.parse(
          json['createdAt'] as String? ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(
          json['updatedAt'] as String? ?? DateTime.now().toIso8601String()),
    );
  }
}

class AiMessage {
  final String role; // 'user' | 'assistant'
  final String content;
  final DateTime? timestamp;

  const AiMessage({
    required this.role,
    required this.content,
    this.timestamp,
  });

  bool get isUser => role == 'user';
  bool get isAssistant => role == 'assistant';

  factory AiMessage.fromJson(Map<String, dynamic> json) {
    return AiMessage(
      role: json['role'] as String? ?? 'user',
      content: json['content'] as String? ?? '',
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'role': role,
        'content': content,
      };
}
