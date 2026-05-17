import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../widgets/app_button.dart';
import '../providers/payment_provider.dart';

class PaymentMethodScreen extends ConsumerStatefulWidget {
  const PaymentMethodScreen({super.key});

  @override
  ConsumerState<PaymentMethodScreen> createState() => _PaymentMethodScreenState();
}

class _PaymentMethodScreenState extends ConsumerState<PaymentMethodScreen> {
  String? _selectedMethod;

  final List<Map<String, dynamic>> _methods = [
    {
      'id': 'card',
      'title': 'Credit or Debit Card',
      'subtitle': 'Visa, Mastercard, American Express',
      'icon': Icons.credit_card_rounded,
      'color': Colors.blue,
    },
    {
      'id': 'telebirr',
      'title': 'Telebirr Wallet',
      'subtitle': 'Pay instantly via mobile number',
      'icon': Icons.phone_android_rounded,
      'color': Colors.green,
    },
    {
      'id': 'chapa',
      'title': 'Chapa checkout',
      'subtitle': 'Ethiopia\'s secure payment gateway',
      'icon': Icons.payment_rounded,
      'color': Colors.deepOrange,
    },
    {
      'id': 'paypal',
      'title': 'PayPal Account',
      'subtitle': 'Faster, safer way to send money',
      'icon': Icons.account_balance_wallet_rounded,
      'color': Colors.indigo,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final paymentState = ref.watch(paymentProvider);
    final booking = paymentState.currentBooking;

    if (booking == null) {
      return const Scaffold(
        body: Center(
          child: Text('No active booking found.'),
        ),
      );
    }

    const serviceFee = 5.00;
    final totalAmount = booking.amount + serviceFee;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Payment Method'),
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textPrimary,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Amount display header
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppColors.primary, AppColors.primary.withOpacity(0.8)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.25),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          const Text(
                            'Amount to Pay',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '\$${totalAmount.toStringAsFixed(2)}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    Text(
                      'Select a payment method',
                      style: AppTextStyles.titleLarge.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'All transactions are secure and encrypted.',
                      style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 20),

                    // Payment Methods Selection Cards
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _methods.length,
                      itemBuilder: (context, index) {
                        final method = _methods[index];
                        final isSelected = _selectedMethod == method['id'];
                        final Color brandColor = method['color'] as Color;

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16.0),
                          child: InkWell(
                            onTap: () {
                              setState(() {
                                _selectedMethod = method['id'] as String;
                              });
                              ref.read(paymentProvider.notifier).selectPaymentMethod(_selectedMethod!);
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 250),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isSelected ? AppColors.primary : Colors.transparent,
                                  width: 2,
                                ),
                                boxShadow: isSelected
                                    ? [
                                        BoxShadow(
                                          color: AppColors.primary.withOpacity(0.12),
                                          blurRadius: 8,
                                          offset: const Offset(0, 4),
                                        )
                                      ]
                                    : AppColors.cardShadow,
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: brandColor.withOpacity(0.08),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      method['icon'] as IconData,
                                      color: brandColor,
                                      size: 24,
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          method['title'] as String,
                                          style: AppTextStyles.titleMedium.copyWith(
                                            fontWeight: FontWeight.bold,
                                            color: isSelected ? AppColors.primary : AppColors.textPrimary,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          method['subtitle'] as String,
                                          style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    width: 22,
                                    height: 22,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: isSelected ? AppColors.primary : AppColors.textHint,
                                        width: 2,
                                      ),
                                      color: isSelected ? AppColors.primary : Colors.transparent,
                                    ),
                                    child: isSelected
                                        ? const Icon(
                                            Icons.check,
                                            color: Colors.white,
                                            size: 14,
                                          )
                                        : null,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),

            // Confirm & Continue Bottom Card
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: AppButton(
                label: 'Continue',
                onPressed: _selectedMethod != null
                    ? () {
                        if (_selectedMethod == 'card') {
                          context.push('/booking/card-payment');
                        } else {
                          // Instant redirection and booking execute
                          context.push('/booking/processing', extra: _selectedMethod);
                        }
                      }
                    : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
