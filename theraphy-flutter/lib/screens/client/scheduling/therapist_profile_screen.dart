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

class TherapistProfileScreen extends ConsumerStatefulWidget {
  final TherapistModel therapist;

  const TherapistProfileScreen({super.key, required this.therapist});

  @override
  ConsumerState<TherapistProfileScreen> createState() => _TherapistProfileScreenState();
}

class _TherapistProfileScreenState extends ConsumerState<TherapistProfileScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  String? _selectedSlot;

  @override
  Widget build(BuildContext context) {
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
                          Text(widget.therapist.name, style: AppTextStyles.displayMedium),
                          Text(widget.therapist.specialization, style: AppTextStyles.bodyLarge.copyWith(color: AppColors.primary)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text('\$${widget.therapist.hourlyRate}/hr', style: AppTextStyles.titleMedium.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Text('About', style: AppTextStyles.headlineMedium),
                  const SizedBox(height: 8),
                  Text(widget.therapist.bio, style: AppTextStyles.bodyMedium.copyWith(height: 1.6)),
                  
                  const SizedBox(height: 32),
                  const Text('Select Date', style: AppTextStyles.headlineMedium),
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
                      selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
                      onDaySelected: (selectedDay, focusedDay) {
                        setState(() {
                          _selectedDay = selectedDay;
                          _focusedDay = focusedDay;
                        });
                      },
                      headerStyle: const HeaderStyle(
                        formatButtonVisible: false,
                        titleCentered: true,
                      ),
                      calendarStyle: const CalendarStyle(
                        selectedDecoration: BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                        todayDecoration: BoxDecoration(color: AppColors.primaryContainer, shape: BoxShape.circle),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  const Text('Available Slots', style: AppTextStyles.headlineMedium),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: widget.therapist.availableSlots.map((slot) {
                      final isSelected = _selectedSlot == slot;
                      return ChoiceChip(
                        label: Text(slot),
                        selected: isSelected,
                        onSelected: (selected) => setState(() => _selectedSlot = selected ? slot : null),
                        selectedColor: AppColors.primary.withOpacity(0.2),
                        labelStyle: TextStyle(color: isSelected ? AppColors.primary : AppColors.textPrimary, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal),
                      );
                    }).toList(),
                  ),
                  
                  const SizedBox(height: 40),
                  AppButton(
                    label: 'Book Appointment',
                    onPressed: (_selectedDay != null && _selectedSlot != null) 
                      ? () {
                          ref.read(paymentProvider.notifier).initiateBooking(
                            therapist: widget.therapist,
                            date: _selectedDay!,
                            timeSlot: _selectedSlot!,
                          );
                          context.push('/booking/summary');
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
