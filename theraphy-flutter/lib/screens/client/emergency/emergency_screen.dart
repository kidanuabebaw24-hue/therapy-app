import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/network_providers.dart';
import 'package:theraphy_flutter/features/auth/presentation/providers/auth_provider.dart';
import '../../../utils/snackbar_utils.dart';
import '../../../widgets/app_card.dart';

class EmergencyScreen extends ConsumerStatefulWidget {
  const EmergencyScreen({super.key});

  @override
  ConsumerState<EmergencyScreen> createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends ConsumerState<EmergencyScreen> {
  bool _isTriggering = false;
  String _severity = 'medium';

  Future<void> _triggerEmergency() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Confirm Emergency Alert'),
        content: const Text(
          'This will notify your therapist and support team immediately. '
          'Are you sure you want to send an emergency alert?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Send Alert'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _isTriggering = true);
    try {
      final api = ref.read(apiClientProvider);
      await api.post(ApiEndpoints.emergency, data: {
        'severity': _severity,
        'message': 'Emergency alert triggered from mobile app',
      });
      if (mounted) {
        SnackbarUtils.showSuccess(
            context, 'Emergency alert sent. Help is on the way.');
      }
    } catch (e) {
      if (mounted) SnackbarUtils.showError(context, e.toString());
    } finally {
      setState(() => _isTriggering = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Emergency Support')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Crisis banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                    color: AppColors.error.withOpacity(0.3), width: 1),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.warning_amber, color: AppColors.error),
                      SizedBox(width: 8),
                      Text('Crisis Support',
                          style: TextStyle(
                            fontFamily: 'Outfit',
                            color: AppColors.error,
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                          )),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text(
                    'If you are in immediate danger, call emergency services (911) first. '
                    'This feature alerts your therapist and support team.',
                    style: AppTextStyles.bodyMedium,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Severity selector
            const Text('Severity Level', style: AppTextStyles.headlineMedium),
            const SizedBox(height: 12),
            Row(
              children: [
                _SeverityChip(
                  label: 'Low',
                  color: AppColors.success,
                  selected: _severity == 'low',
                  onTap: () => setState(() => _severity = 'low'),
                ),
                const SizedBox(width: 10),
                _SeverityChip(
                  label: 'Medium',
                  color: AppColors.warning,
                  selected: _severity == 'medium',
                  onTap: () => setState(() => _severity = 'medium'),
                ),
                const SizedBox(width: 10),
                _SeverityChip(
                  label: 'High',
                  color: AppColors.error,
                  selected: _severity == 'high',
                  onTap: () => setState(() => _severity = 'high'),
                ),
              ],
            ),
            const SizedBox(height: 28),

            // Emergency button
            GestureDetector(
              onTap: _isTriggering ? null : _triggerEmergency,
              child: Container(
                width: double.infinity,
                height: 80,
                decoration: BoxDecoration(
                  color: _isTriggering
                      ? AppColors.error.withOpacity(0.5)
                      : AppColors.error,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.error.withOpacity(0.4),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Center(
                  child: _isTriggering
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.warning_amber,
                                color: Colors.white, size: 28),
                            SizedBox(width: 12),
                            Text(
                              'SEND EMERGENCY ALERT',
                              style: TextStyle(
                                fontFamily: 'Outfit',
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                ),
              ),
            ),
            const SizedBox(height: 28),

            // Resources
            const Text('Crisis Resources', style: AppTextStyles.headlineMedium),
            const SizedBox(height: 12),
            ...[
              _Resource(
                icon: Icons.phone,
                title: 'National Crisis Hotline',
                subtitle: 'Call or text 988',
                color: AppColors.primary,
              ),
              _Resource(
                icon: Icons.chat_bubble_outline,
                title: 'Crisis Text Line',
                subtitle: 'Text HOME to 741741',
                color: AppColors.secondary,
              ),
              _Resource(
                icon: Icons.local_hospital_outlined,
                title: 'Emergency Services',
                subtitle: 'Call 911',
                color: AppColors.error,
              ),
            ].map((r) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: r,
                )),
          ],
        ),
      ),
    );
  }
}

class _SeverityChip extends StatelessWidget {
  final String label;
  final Color color;
  final bool selected;
  final VoidCallback onTap;

  const _SeverityChip({
    required this.label,
    required this.color,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? color.withOpacity(0.15) : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: selected ? color : Colors.transparent,
            width: 1.5,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'Outfit',
            color: selected ? color : AppColors.textSecondary,
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}

class _Resource extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;

  const _Resource({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: AppTextStyles.titleMedium),
              Text(subtitle, style: AppTextStyles.bodySmall),
            ],
          ),
        ],
      ),
    );
  }
}
