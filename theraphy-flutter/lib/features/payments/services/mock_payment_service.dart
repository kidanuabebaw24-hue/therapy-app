import 'dart:math';

class PaymentResult {
  final bool success;
  final String transactionId;
  final String errorMessage;

  PaymentResult({
    required this.success,
    required this.transactionId,
    this.errorMessage = '',
  });
}

class MockPaymentService {
  Future<PaymentResult> processPayment({
    required String cardHolder,
    required String cardNumber,
    required String paymentMethod,
    required double amount,
  }) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 800));

    // Allow intentional failure triggers for demo/retry UI testing
    if (cardHolder.trim().toLowerCase() == 'fail' || cardHolder.trim().toLowerCase() == 'failure') {
      return PaymentResult(
        success: false,
        transactionId: '',
        errorMessage: 'The payment transaction was declined by the bank. Please try again.',
      );
    }

    // Small random chance of failure if not forced (e.g. 10% chance for realistic mock behavior)
    final isRandomSuccess = Random().nextDouble() > 0.1;
    
    if (!isRandomSuccess) {
      return PaymentResult(
        success: false,
        transactionId: '',
        errorMessage: 'Payment gateway timeout. Please check your internet connection and try again.',
      );
    }

    // Generate random transaction ID
    final transactionId = 'TXN${DateTime.now().millisecondsSinceEpoch}${Random().nextInt(999)}';

    return PaymentResult(
      success: true,
      transactionId: transactionId,
    );
  }
}
