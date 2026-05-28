import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../models/session_model.dart';
import '../../../routes/app_routes.dart';
import '../../appointments/presentation/providers/session_provider.dart';
import '../providers/payment_provider.dart';

/// Loads an approved unpaid session into payment state and opens booking summary.
void openPaymentForSession(BuildContext context, WidgetRef ref, SessionModel session) {
  ref.read(paymentProvider.notifier).loadBookingForPayment(
        session: session,
        hourlyRate: session.therapistHourlyRate ?? 50.0,
        therapistSpecialization: session.therapistSpecialization ?? 'Consultation',
      );
  context.push(AppRoutes.bookingSummary);
}

/// Refreshes appointments and opens payment for the first that needs payment.
Future<void> openFirstPendingPayment(BuildContext context, WidgetRef ref) async {
  await ref.read(sessionProvider.notifier).fetchSessions();
  if (!context.mounted) return;

  final due = ref.read(sessionProvider).needsPayment;
  if (due.isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('No approved appointments waiting for payment.'),
      ),
    );
    context.push(AppRoutes.sessions);
    return;
  }

  openPaymentForSession(context, ref, due.first);
}
