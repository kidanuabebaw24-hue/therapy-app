import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../models/session_model.dart';
import '../../../widgets/app_button.dart';

class PaymentDueBanner extends StatelessWidget {
  final SessionModel session;
  final VoidCallback onPay;

  const PaymentDueBanner({
    super.key,
    required this.session,
    required this.onPay,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 12, 20, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.success.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.success.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.verified_rounded, color: AppColors.success, size: 22),
              const SizedBox(width: 8),
              Text(
                'Appointment approved',
                style: AppTextStyles.titleMedium.copyWith(
                  color: AppColors.success,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Your session with ${session.therapistName ?? 'your therapist'} is approved. Complete payment to confirm your booking.',
            style: AppTextStyles.bodyMedium,
          ),
          const SizedBox(height: 12),
          AppButton(
            label: 'Proceed to Payment',
            onPressed: onPay,
            icon: Icons.payment_rounded,
          ),
        ],
      ),
    );
  }
}
