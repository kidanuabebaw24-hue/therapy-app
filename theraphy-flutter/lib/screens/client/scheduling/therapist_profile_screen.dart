import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../models/therapist_model.dart';
import '../../../widgets/app_button.dart';
import '../../../widgets/app_image.dart';
import '../../../features/payments/providers/payment_provider.dart';
import 'therapist_slots_service.dart';

class TherapistProfileScreen extends ConsumerStatefulWidget {
  final TherapistModel therapist;

  const TherapistProfileScreen({super.key, required this.therapist});

  @override
  ConsumerState<TherapistProfileScreen> createState() =>
      _TherapistProfileScreenState();
}

class _TherapistProfileScreenState
    extends ConsumerState<TherapistProfileScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  String? _selectedSlot;
  List<String> _daySlots = [];
  String? _workingHoursLabel;
  bool _loadingSlots = false;
  String? _slotsError;

  @override
  void initState() {
    super.initState();
    _selectedDay = DateTime.now();
    _loadSlotsForDay(_selectedDay!);
  }

  Future<void> _loadSlotsForDay(DateTime day) async {
    setState(() {
      _loadingSlots = true;
      _slotsError = null;
      _selectedSlot = null;
    });
    ref.read(paymentProvider.notifier).clearAvailabilityFeedback();

    try {
      final result = await ref.read(therapistSlotsServiceProvider).fetchSlots(
            therapistId: widget.therapist.id,
            date: day,
          );
      if (!mounted) return;
      setState(() {
        _daySlots = result.slots;
        _workingHoursLabel = result.workingHoursLabel;
        _loadingSlots = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _daySlots = [];
        _workingHoursLabel = null;
        _loadingSlots = false;
        _slotsError = 'Could not load available slots. Please try again.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final paymentState = ref.watch(paymentProvider);
    final selectedDay = _selectedDay ?? _focusedDay;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: AppImage(
                imageUrl: widget.therapist.imageUrl,
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(widget.therapist.name,
                              style: AppTextStyles.displayMedium),
                          Text(widget.therapist.specialization,
                              style: AppTextStyles.bodyLarge
                                  .copyWith(color: AppColors.primary)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text('\$${widget.therapist.hourlyRate}/hr',
                            style: AppTextStyles.titleMedium.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Text('About', style: AppTextStyles.headlineMedium),
                  const SizedBox(height: 8),
                  Text(widget.therapist.bio,
                      style: AppTextStyles.bodyMedium.copyWith(height: 1.6)),
                  const SizedBox(height: 32),
                  const Text('Select Date',
                      style: AppTextStyles.headlineMedium),
                  const SizedBox(height: 16),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: AppColors.cardShadow,
                    ),
                    child: TableCalendar(
                      firstDay: DateTime.now(),
                      lastDay: DateTime.now().add(const Duration(days: 30)),
                      focusedDay: _focusedDay,
                      selectedDayPredicate: (day) =>
                          isSameDay(_selectedDay, day),
                      onDaySelected: (selectedDay, focusedDay) {
                        setState(() {
                          _selectedDay = selectedDay;
                          _focusedDay = focusedDay;
                        });
                        _loadSlotsForDay(selectedDay);
                      },
                      headerStyle: const HeaderStyle(
                        formatButtonVisible: false,
                        titleCentered: true,
                      ),
                      calendarStyle: const CalendarStyle(
                        selectedDecoration: BoxDecoration(
                            color: AppColors.primary, shape: BoxShape.circle),
                        todayDecoration: BoxDecoration(
                            color: AppColors.primaryContainer,
                            shape: BoxShape.circle),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  const Text('Available Slots',
                      style: AppTextStyles.headlineMedium),
                  if (_workingHoursLabel != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Working hours: $_workingHoursLabel (30 min slots)',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textHint,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                  if (_loadingSlots)
                    const Center(child: CircularProgressIndicator())
                  else if (_slotsError != null)
                    Text(
                      _slotsError!,
                      style: AppTextStyles.bodySmall
                          .copyWith(color: Colors.redAccent.shade700),
                    )
                  else if (_daySlots.isEmpty)
                    Text(
                      'No available slots for this day. Please choose another date.',
                      style: AppTextStyles.bodySmall
                          .copyWith(color: Colors.redAccent.shade700),
                    )
                  else
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: _daySlots.map((slot) {
                        final isSelected = _selectedSlot == slot;
                        return ChoiceChip(
                          label: Text(slot),
                          selected: isSelected,
                          onSelected: (selected) {
                            setState(() => _selectedSlot = selected ? slot : null);
                            ref
                                .read(paymentProvider.notifier)
                                .clearAvailabilityFeedback();
                          },
                          selectedColor:
                              AppColors.primary.withValues(alpha: 0.2),
                          labelStyle: TextStyle(
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.textPrimary,
                            fontWeight: isSelected
                                ? FontWeight.bold
                                : FontWeight.normal,
                          ),
                        );
                      }).toList(),
                    ),
                  if (paymentState.availabilityMessage != null) ...[
                    const SizedBox(height: 16),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: paymentState.isAvailable
                            ? Colors.green.withValues(alpha: 0.08)
                            : Colors.redAccent.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: paymentState.isAvailable
                              ? Colors.green.withValues(alpha: 0.35)
                              : Colors.redAccent.withValues(alpha: 0.35),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            paymentState.isAvailable
                                ? Icons.check_circle
                                : Icons.warning_amber_rounded,
                            color: paymentState.isAvailable
                                ? Colors.green
                                : Colors.redAccent,
                            size: 18,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              paymentState.availabilityMessage!,
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: paymentState.isAvailable
                                    ? Colors.green.shade800
                                    : Colors.redAccent.shade700,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (!paymentState.isAvailable &&
                        paymentState.suggestedSlots.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(
                        'Suggested slots',
                        style: AppTextStyles.bodySmall.copyWith(
                          fontWeight: FontWeight.w700,
                          color: Colors.redAccent.shade700,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: paymentState.suggestedSlots.map((slot) {
                          return ActionChip(
                            label: Text(slot),
                            onPressed: () {
                              setState(() => _selectedSlot = slot);
                              ref
                                  .read(paymentProvider.notifier)
                                  .clearAvailabilityFeedback();
                            },
                          );
                        }).toList(),
                      ),
                    ],
                  ],
                  const SizedBox(height: 40),
                  AppButton(
                    label: 'Book Appointment',
                    isLoading: paymentState.isCheckingAvailability ||
                        paymentState.isSubmittingBooking,
                    onPressed: (_selectedDay != null &&
                            _selectedSlot != null &&
                            !paymentState.isCheckingAvailability &&
                            !paymentState.isSubmittingBooking &&
                            !_loadingSlots)
                        ? () async {
                            final isAvailable = await ref
                                .read(paymentProvider.notifier)
                                .checkTherapistAvailability(
                                  therapistId: widget.therapist.id,
                                  date: selectedDay,
                                  timeSlot: _selectedSlot!,
                                );

                            if (!context.mounted) return;
                            if (!isAvailable) return;

                            final submitted = await ref
                                .read(paymentProvider.notifier)
                                .submitBookingRequest(
                                  therapist: widget.therapist,
                                  date: selectedDay,
                                  timeSlot: _selectedSlot!,
                                );

                            if (!context.mounted) return;
                            if (!submitted) {
                              final err = ref.read(paymentProvider).error;
                              if (err != null && err.isNotEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text(err)),
                                );
                              }
                              return;
                            }

                            context.push('/booking/confirmation');
                          }
                        : null,
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
