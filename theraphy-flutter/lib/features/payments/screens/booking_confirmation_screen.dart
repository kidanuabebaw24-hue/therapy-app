import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../widgets/app_button.dart';
import '../providers/payment_provider.dart';

class BookingConfirmationScreen extends ConsumerWidget {
  const BookingConfirmationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final paymentState = ref.watch(paymentProvider);
    final booking = paymentState.currentBooking;

    if (booking == null) {
      return const Scaffold(
        body: Center(
          child: Text('No active booking found.'),
        ),
      );
    }

    final formattedDate = DateFormat('EEEE, MMMM d, yyyy').format(booking.appointmentDate);
    final bookingRefId = booking.transactionId.isNotEmpty 
        ? 'REF-${booking.transactionId.substring(booking.transactionId.length - 8).toUpperCase()}'
        : 'REF-BOOKING-001';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 24),

              // Calming Success Green Animation Scale Wrapper
              TweenAnimationBuilder<double>(
                tween: Tween<double>(begin: 0.0, end: 1.0),
                duration: const Duration(milliseconds: 600),
                curve: Curves.elasticOut,
                builder: (context, value, child) {
                  return Transform.scale(
                    scale: value,
                    child: child,
                  );
                },
                child: Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    color: AppColors.success.withOpacity(0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.check_circle_rounded,
                      color: AppColors.success,
                      size: 64,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              Text(
                'Appointment Confirmed',
                style: AppTextStyles.displaySmall.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'Your therapy session has been successfully booked. Let\'s make this a positive step forward.',
                style: AppTextStyles.bodyLarge.copyWith(color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),

              // Elegant Receipt Card Detail Container
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: AppColors.cardShadow,
                ),
                child: Column(
                  children: [
                    // Therapist Header
                    Row(
                      children: [
                        const Icon(Icons.person_pin_rounded, color: AppColors.primary, size: 24),
                        const SizedBox(width: 8),
                        Text(
                          'Therapist Info',
                          style: AppTextStyles.labelMedium.copyWith(color: AppColors.textHint, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(booking.therapistName, style: AppTextStyles.titleMedium.copyWith(fontWeight: FontWeight.bold)),
                              Text(booking.therapistSpecialization, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.primary)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16.0),
                      child: Divider(height: 1),
                    ),

                    // Date & Time Details
                    _buildReceiptRow(Icons.calendar_month_rounded, 'Date', formattedDate),
                    const SizedBox(height: 14),
                    _buildReceiptRow(Icons.access_time_filled_rounded, 'Time', booking.appointmentTime),
                    const SizedBox(height: 14),
                    _buildReceiptRow(Icons.hourglass_bottom_rounded, 'Session Length', '50-min Consultation'),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16.0),
                      child: Divider(height: 1),
                    ),

                    // Payment Receipt details
                    _buildReceiptRow(Icons.account_balance_wallet_rounded, 'Payment Method', booking.paymentMethod.toUpperCase()),
                    const SizedBox(height: 14),
                    _buildReceiptRow(Icons.payments_rounded, 'Status', 'PAID'),
                    const SizedBox(height: 14),
                    _buildReceiptRow(Icons.receipt_long_rounded, 'Booking Ref', bookingRefId),
                  ],
                ),
              ),
              const SizedBox(height: 48),

              // Back to Dashboard action button
              AppButton(
                label: 'Back to Dashboard',
                onPressed: () {
                  context.go('/dashboard');
                },
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReceiptRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: AppColors.textHint, size: 20),
        const SizedBox(width: 12),
        Text(label, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
        const Spacer(),
        Text(
          value,
          style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.bold, color: AppColors.textPrimary),
        ),
      ],
    );
  }
}
