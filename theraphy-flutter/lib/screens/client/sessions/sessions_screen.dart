import 'package:flutter/material.dart';
import 'package:theraphy_flutter/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../models/session_model.dart';
import 'package:theraphy_flutter/features/appointments/presentation/providers/session_provider.dart';
import '../../../utils/snackbar_utils.dart';
import '../../../widgets/app_button.dart';
import '../../../widgets/app_card.dart';

class SessionsScreen extends ConsumerStatefulWidget {
  const SessionsScreen({super.key});

  @override
  ConsumerState<SessionsScreen> createState() => _SessionsScreenState();
}

class _SessionsScreenState extends ConsumerState<SessionsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
    Future.microtask(() => ref.read(sessionProvider.notifier).fetchSessions());
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(sessionProvider);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.sessions),
        bottom: TabBar(
          controller: _tabCtrl,
          tabs: [
            Tab(text: l10n.upcoming),
            Tab(text: l10n.past),
          ],
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textHint,
          indicatorColor: AppColors.primary,
          labelStyle: const TextStyle(
            fontFamily: 'Outfit',
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showBookingSheet(context),
        icon: const Icon(Icons.add),
        label: Text(l10n.bookSession,
            style: const TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.w600)),
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabCtrl,
              children: [
                _SessionList(sessions: state.upcoming, emptyMessage: l10n.noUpcomingSessions),
                _SessionList(sessions: state.past, emptyMessage: l10n.noPastSessions),
              ],
            ),
    );
  }

  void _showBookingSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const _BookingSheet(),
    );
  }
}

class _SessionList extends StatelessWidget {
  final List<SessionModel> sessions;
  final String emptyMessage;

  const _SessionList({required this.sessions, required this.emptyMessage});

  @override
  Widget build(BuildContext context) {
    if (sessions.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.calendar_today_outlined,
                size: 48, color: AppColors.textHint),
            const SizedBox(height: 12),
            Text(emptyMessage, style: AppTextStyles.bodyMedium),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(20),
      itemCount: sessions.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, i) => _SessionTile(session: sessions[i]),
    );
  }
}

class _SessionTile extends StatelessWidget {
  final SessionModel session;
  const _SessionTile({required this.session});

  @override
  Widget build(BuildContext context) {
    final statusColor = session.isCompleted
        ? AppColors.success
        : session.isCancelled || session.isRejected
            ? AppColors.error
            : session.isPending
                ? AppColors.warning
                : AppColors.primary;

    final statusLabel = session.isPending ? 'Pending Approval' : _capitalize(session.status);

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.video_call_outlined,
                    color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      session.therapistName ?? AppLocalizations.of(context).therapist,
                      style: AppTextStyles.titleMedium,
                    ),
                    Text(
                      _capitalize(session.type),
                      style: AppTextStyles.bodySmall,
                    ),
                  ],
                ),
              ),
              _StatusBadge(label: statusLabel, color: statusColor),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 8),
          Row(
            children: [
              _InfoChip(icon: Icons.access_time, label: '${session.duration} min'),
              const SizedBox(width: 12),
              _InfoChip(
                icon: Icons.calendar_today,
                label: _formatDate(session.date),
              ),
              const Spacer(),
              _InfoChip(
                icon: Icons.payment,
                label: session.isPaid
                    ? AppLocalizations.of(context).paid
                    : AppLocalizations.of(context).pending,
                color: session.isPaid ? AppColors.success : AppColors.warning,
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _capitalize(String s) =>
      s.isEmpty ? s : s[0].toUpperCase() + s.substring(1);

  String _formatDate(DateTime dt) {
    final months = ['Jan','Feb','Mar','Apr','May','Jun',
        'Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${months[dt.month - 1]} ${dt.day}, ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
  }
}

class _StatusBadge extends StatelessWidget {
  final String label;
  final Color color;
  const _StatusBadge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'Outfit',
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? color;
  const _InfoChip({required this.icon, required this.label, this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color ?? AppColors.textHint),
        const SizedBox(width: 4),
        Text(label,
            style: AppTextStyles.bodySmall.copyWith(
              color: color ?? AppColors.textSecondary,
            )),
      ],
    );
  }
}

class _BookingSheet extends ConsumerStatefulWidget {
  const _BookingSheet();

  @override
  ConsumerState<_BookingSheet> createState() => _BookingSheetState();
}

class _BookingSheetState extends ConsumerState<_BookingSheet> {
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  int _duration = 60;
  String _type = 'consultation';

  Future<void> _book() async {
    final l10n = AppLocalizations.of(context);
    try {
      await ref.read(sessionProvider.notifier).bookSession(
            therapistId: 'placeholder',
            date: _selectedDate,
            duration: _duration,
            type: _type,
          );
      if (mounted) {
        Navigator.pop(context);
        // Show "Pending Approval" confirmation
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.hourglass_top_rounded,
                      color: Colors.orange, size: 22),
                ),
                const SizedBox(width: 12),
                const Text('Pending Approval'),
              ],
            ),
            content: const Text(
              'Your booking request has been sent to the admin for approval. '
              'You will receive a notification once it is reviewed.',
            ),
            actions: [
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) SnackbarUtils.showError(context, e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSubmitting = ref.watch(sessionProvider).isSubmitting;
    final l10n = AppLocalizations.of(context);

    return Padding(
      padding: EdgeInsets.fromLTRB(
          24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(l10n.bookASession, style: AppTextStyles.headlineLarge),
          const SizedBox(height: 20),
          Text(l10n.sessionType, style: AppTextStyles.titleMedium),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: ['consultation', 'cbt', 'exposure', 'followup'].map((t) {
              return ChoiceChip(
                label: Text(t),
                selected: _type == t,
                onSelected: (_) => setState(() => _type = t),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          Text(l10n.duration, style: AppTextStyles.titleMedium),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [30, 45, 60, 90].map((d) {
              return ChoiceChip(
                label: Text('$d min'),
                selected: _duration == d,
                onSelected: (_) => setState(() => _duration = d),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          AppButton(
            label: l10n.confirmBooking,
            onPressed: _book,
            isLoading: isSubmitting,
            icon: Icons.check,
          ),
        ],
      ),
    );
  }
}
