import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../providers/payment_provider.dart';

class PaymentProcessingScreen extends ConsumerStatefulWidget {
  final dynamic args;

  const PaymentProcessingScreen({super.key, required this.args});

  @override
  ConsumerState<PaymentProcessingScreen> createState() => _PaymentProcessingScreenState();
}

class _PaymentProcessingScreenState extends ConsumerState<PaymentProcessingScreen> {
  bool _paymentFailed = false;
  String _failureMessage = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _runPaymentPipeline();
    });
  }

  Future<void> _runPaymentPipeline() async {
    setState(() {
      _paymentFailed = false;
      _failureMessage = '';
    });

    try {
      final notifier = ref.read(paymentProvider.notifier);
      bool success = false;

      debugPrint('PaymentProcessingScreen: Starting pipeline with args: ${widget.args}');

      // Determine arguments type
      if (widget.args is Map) {
        final mapArgs = widget.args as Map;
        final cardHolder = mapArgs['cardHolder'] as String? ?? '';
        final cardNumber = mapArgs['cardNumber'] as String? ?? '';

        debugPrint('PaymentProcessingScreen: Executing card payment for $cardHolder');

        success = await notifier.executeCardPayment(
          cardHolder: cardHolder,
          cardNumber: cardNumber,
        );

        if (mounted) {
          if (success) {
            context.go('/booking/confirmation');
          } else {
            final state = ref.read(paymentProvider);
            setState(() {
              _paymentFailed = true;
              _failureMessage = state.error ?? 'Transaction failed. Please try again.';
            });
          }
        }
      } else if (widget.args is String) {
        final method = widget.args as String;
        debugPrint('PaymentProcessingScreen: Executing instant payment for $method');
        success = await notifier.executeInstantPayment(method);

        if (mounted) {
          if (success) {
            if (method == 'chapa') {
              debugPrint('PaymentProcessingScreen: Chapa launched successfully. Staying on verify screen.');
            } else {
              context.go('/booking/confirmation');
            }
          } else {
            final state = ref.read(paymentProvider);
            setState(() {
              _paymentFailed = true;
              _failureMessage = state.error ?? 'Transaction failed. Please try again.';
            });
          }
        }
      } else {
        debugPrint('PaymentProcessingScreen: Invalid args type: ${widget.args.runtimeType}');
      }
    } catch (e, stack) {
      debugPrint('PaymentProcessingScreen: CRITICAL ERROR IN PIPELINE: $e\n$stack');
      if (mounted) {
        setState(() {
          _paymentFailed = true;
          _failureMessage = 'An unexpected error occurred during processing: $e';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final paymentState = ref.watch(paymentProvider);
    final booking = paymentState.currentBooking;
    final isChapa = booking?.paymentMethod == 'chapa';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Center(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: _paymentFailed 
                  ? _buildFailureState() 
                  : (isChapa 
                      ? _buildChapaAwaitingState() 
                      : _buildProcessingState(booking?.paymentMethod ?? 'payment')),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProcessingState(String method) {
    final methodLabel = method.toUpperCase();
    return Column(
      key: const ValueKey('processing'),
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 120,
              height: 120,
              child: CircularProgressIndicator(
                strokeWidth: 4,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                backgroundColor: AppColors.primary.withOpacity(0.1),
              ),
            ),
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.security_rounded,
                color: AppColors.primary,
                size: 36,
              ),
            ),
          ],
        ),
        const SizedBox(height: 40),
        
        Text(
          'Processing Payment...',
          style: AppTextStyles.headlineLarge.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Text(
          'Initiating transaction with $methodLabel secure network. Please do not close the app or press back.',
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 48),

        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.lock_rounded, color: AppColors.textHint, size: 16),
            const SizedBox(width: 6),
            Text(
              'Secure SSL Encrypted Connection',
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textHint, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildChapaAwaitingState() {
    final paymentState = ref.watch(paymentProvider);
    
    return Column(
      key: const ValueKey('chapa-awaiting'),
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 120,
              height: 120,
              child: CircularProgressIndicator(
                strokeWidth: 4,
                value: paymentState.isProcessing ? null : 0.75,
                valueColor: const AlwaysStoppedAnimation<Color>(Colors.deepOrange),
                backgroundColor: Colors.deepOrange.withOpacity(0.1),
              ),
            ),
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.deepOrange.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.open_in_browser_rounded,
                color: Colors.deepOrange,
                size: 36,
              ),
            ),
          ],
        ),
        const SizedBox(height: 40),
        
        Text(
          'Chapa Sandbox Checkout',
          style: AppTextStyles.headlineLarge.copyWith(fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Text(
            'We have opened Chapa\'s secure checkout page in your web browser. Complete your billing details there, then return here to confirm your appointment.',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
        ),
        const SizedBox(height: 36),

        if (paymentState.error != null) ...[
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.error.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.error.withOpacity(0.3)),
            ),
            child: Text(
              paymentState.error!,
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.error, fontWeight: FontWeight.w600),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 24),
        ],

        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.deepOrange,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            minimumSize: const Size(double.infinity, 54),
            elevation: 2,
          ),
          icon: paymentState.isProcessing 
              ? const SizedBox(
                  width: 20, 
                  height: 20, 
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)
                )
              : const Icon(Icons.verified_user_rounded),
          label: Text(
            paymentState.isProcessing ? 'Verifying payment...' : 'Verify My Payment',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          onPressed: paymentState.isProcessing 
              ? null 
              : () async {
                  final verified = await ref.read(paymentProvider.notifier).verifyChapaPayment();
                  if (verified && mounted) {
                    context.go('/booking/confirmation');
                  }
                },
        ),
        
        const SizedBox(height: 12),
        
        OutlinedButton(
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            minimumSize: const Size(double.infinity, 54),
          ),
          onPressed: paymentState.isProcessing 
              ? null 
              : () {
                  _runPaymentPipeline();
                },
          child: const Text(
            'Relaunch Checkout Tab', 
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.deepOrange)
          ),
        ),
      ],
    );
  }

  Widget _buildFailureState() {
    return Column(
      key: const ValueKey('failure'),
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.error.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.error_outline_rounded,
            color: AppColors.error,
            size: 48,
          ),
        ),
        const SizedBox(height: 24),
        
        Text(
          'Payment Declined',
          style: AppTextStyles.headlineLarge.copyWith(color: AppColors.error, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Text(
            _failureMessage,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
        ),
        const SizedBox(height: 40),

        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: () {
                  context.pop();
                },
                child: const Text('Edit Details'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: _runPaymentPipeline,
                child: const Text('Retry Payment'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
