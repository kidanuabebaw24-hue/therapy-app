import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../providers/ai_chat_provider.dart';
import '../../../utils/snackbar_utils.dart';
import '../../../widgets/app_card.dart';
import '../../../widgets/loading_overlay.dart';
import '../../../routes/app_routes.dart';

class AiChatScreen extends ConsumerStatefulWidget {
  const AiChatScreen({super.key});

  @override
  ConsumerState<AiChatScreen> createState() => _AiChatScreenState();
}

class _AiChatScreenState extends ConsumerState<AiChatScreen> {
  final _msgCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(aiChatProvider.notifier).fetchConversations());
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    super.dispose();
  }

  final _inputFocus = FocusNode();

  Future<void> _startConversation([String? message]) async {
    final msg = message ?? _msgCtrl.text.trim();
    if (msg.isEmpty) return;
    _msgCtrl.clear();
    _inputFocus.unfocus();
    
    try {
      await ref.read(aiChatProvider.notifier).startConversation(msg);
      final conv = ref.read(aiChatProvider).activeConversation;
      if (conv != null && mounted) {
        context.go('${AppRoutes.aiChat}/${conv.id}');
      }
    } catch (e) {
      if (mounted) SnackbarUtils.showError(context, e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(aiChatProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('AI Support Chat')),
      body: Column(
        children: [
          // Header banner
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: AppColors.calmGradient,
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Row(
              children: [
                Icon(Icons.smart_toy, color: Colors.white, size: 32),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'AI Mental Health Assistant',
                        style: TextStyle(
                          fontFamily: 'Outfit',
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Available 24/7 · Confidential · Supportive',
                        style: TextStyle(
                          fontFamily: 'Outfit',
                          color: Colors.white70,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Conversations list
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : state.conversations.isEmpty
                    ? _EmptyState(onStart: (text) => _startConversation(text))
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: state.conversations.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (_, i) {
                          final conv = state.conversations[i];
                          return AppCard(
                            onTap: () => context.go('${AppRoutes.aiChat}/${conv.id}'),
                            child: Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(Icons.chat_bubble_outline,
                                      color: AppColors.primary, size: 20),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(conv.title,
                                          style: AppTextStyles.titleMedium,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis),
                                      if (conv.lastMessage != null)
                                        Text(
                                          conv.lastMessage!,
                                          style: AppTextStyles.bodySmall,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                    ],
                                  ),
                                ),
                                const Icon(Icons.chevron_right,
                                    color: AppColors.textHint),
                              ],
                            ),
                          );
                        },
                      ),
          ),

          // New message input
          Container(
            padding: EdgeInsets.fromLTRB(
                16, 12, 16, MediaQuery.of(context).viewInsets.bottom + 16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              boxShadow: AppColors.cardShadow,
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgCtrl,
                    focusNode: _inputFocus,
                    decoration: const InputDecoration(
                      hintText: 'Start a new conversation...',
                    ),
                    onSubmitted: (_) => _startConversation(),
                  ),
                ),
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: () => _startConversation(),
                  child: Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      gradient: AppColors.calmGradient,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: state.isSending
                        ? const Center(
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2),
                            ),
                          )
                        : const Icon(Icons.send, color: Colors.white, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

}

class _EmptyState extends StatelessWidget {
  final Function(String) onStart;
  const _EmptyState({required this.onStart});

  @override
  Widget build(BuildContext context) {
    final starters = [
      'Help with anxiety',
      'I can\'t sleep',
      'Feeling overwhelmed',
      'Quick breathing exercise',
    ];

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.smart_toy_outlined,
                size: 64, color: AppColors.textHint),
            const SizedBox(height: 16),
            const Text('No conversations yet',
                style: AppTextStyles.headlineMedium),
            const SizedBox(height: 8),
            const Text(
              'Start a conversation with your AI mental health assistant. It\'s confidential and available anytime.',
              style: AppTextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children: starters.map((text) {
                return GestureDetector(
                  onTap: () => onStart(text),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.primary.withOpacity(0.1)),
                    ),
                    child: Text(
                      text,
                      style: AppTextStyles.labelMedium
                          .copyWith(color: AppColors.primary),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

