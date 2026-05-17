import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import 'package:theraphy_flutter/features/mood/presentation/providers/mood_provider.dart';
import '../../../utils/snackbar_utils.dart';
import '../../../widgets/app_button.dart';
import '../../../widgets/app_card.dart';
import '../../../widgets/loading_overlay.dart';

class MoodTrackingScreen extends ConsumerStatefulWidget {
  const MoodTrackingScreen({super.key});

  @override
  ConsumerState<MoodTrackingScreen> createState() => _MoodTrackingScreenState();
}

class _MoodTrackingScreenState extends ConsumerState<MoodTrackingScreen> {
  int _moodScore = 5;
  int _anxietyLevel = 5;
  final List<String> _selectedEmotions = [];
  final _notesCtrl = TextEditingController();

  static const _emotions = [
    'Calm', 'Happy', 'Anxious', 'Sad', 'Angry',
    'Hopeful', 'Tired', 'Stressed', 'Grateful', 'Overwhelmed',
  ];

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(moodProvider.notifier).fetchMoods());
  }

  @override
  void dispose() {
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    try {
      await ref.read(moodProvider.notifier).logMood(
            moodScore: _moodScore,
            anxietyLevel: _anxietyLevel,
            emotions: _selectedEmotions,
            notes: _notesCtrl.text.trim().isEmpty ? null : _notesCtrl.text.trim(),
          );
      if (mounted) {
        SnackbarUtils.showSuccess(context, 'Mood logged successfully');
        setState(() {
          _moodScore = 5;
          _anxietyLevel = 5;
          _selectedEmotions.clear();
          _notesCtrl.clear();
        });
      }
    } catch (e) {
      if (mounted) SnackbarUtils.showError(context, e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(moodProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Mood Tracking')),
      body: LoadingOverlay(
        isLoading: state.isSubmitting,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Log Mood Card
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('How are you feeling?',
                        style: AppTextStyles.headlineMedium),
                    const SizedBox(height: 24),

                    // Mood Score
                    _SliderSection(
                      label: 'Mood',
                      value: _moodScore,
                      color: AppColors.accent,
                      lowLabel: 'Very Low',
                      highLabel: 'Excellent',
                      onChanged: (v) => setState(() => _moodScore = v),
                    ),
                    const SizedBox(height: 20),

                    // Anxiety Level
                    _SliderSection(
                      label: 'Anxiety Level',
                      value: _anxietyLevel,
                      color: AppColors.anxietyColor(_anxietyLevel),
                      lowLabel: 'None',
                      highLabel: 'Severe',
                      onChanged: (v) => setState(() => _anxietyLevel = v),
                    ),
                    const SizedBox(height: 24),

                    // Emotions
                    const Text('Emotions', style: AppTextStyles.titleLarge),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _emotions.map((e) {
                        final selected = _selectedEmotions.contains(e);
                        return FilterChip(
                          label: Text(e),
                          selected: selected,
                          onSelected: (v) {
                            setState(() {
                              if (v) {
                                _selectedEmotions.add(e);
                              } else {
                                _selectedEmotions.remove(e);
                              }
                            });
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),

                    // Notes
                    const Text('Notes (optional)', style: AppTextStyles.titleLarge),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _notesCtrl,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        hintText: 'How was your day? Any triggers?',
                      ),
                    ),
                    const SizedBox(height: 24),

                    AppButton(
                      label: 'Log Mood',
                      onPressed: _submit,
                      isLoading: state.isSubmitting,
                      icon: Icons.check,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // History
              const Text('Recent Entries', style: AppTextStyles.headlineMedium),
              const SizedBox(height: 12),
              if (state.isLoading)
                const Center(child: CircularProgressIndicator())
              else if (state.moods.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Text('No mood entries yet',
                        style: AppTextStyles.bodyMedium),
                  ),
                )
              else
                ...state.moods.take(10).map((m) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: AppCard(
                        child: Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: AppColors.anxietyColor(m.anxietyLevel)
                                    .withOpacity(0.12),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Text(
                                  '${m.moodScore}',
                                  style: TextStyle(
                                    fontFamily: 'Outfit',
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.anxietyColor(m.anxietyLevel),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (m.emotions.isNotEmpty)
                                    Text(m.emotions.join(', '),
                                        style: AppTextStyles.titleMedium),
                                  Text(
                                    'Anxiety: ${m.anxietyLevel}/10',
                                    style: AppTextStyles.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              _formatDate(m.createdAt),
                              style: AppTextStyles.bodySmall,
                            ),
                          ],
                        ),
                      ),
                    )),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    return '${dt.day}/${dt.month} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
  }
}

class _SliderSection extends StatelessWidget {
  final String label;
  final int value;
  final Color color;
  final String lowLabel;
  final String highLabel;
  final ValueChanged<int> onChanged;

  const _SliderSection({
    required this.label,
    required this.value,
    required this.color,
    required this.lowLabel,
    required this.highLabel,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: AppTextStyles.titleMedium),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '$value/10',
                style: TextStyle(
                  fontFamily: 'Outfit',
                  color: color,
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: color,
            thumbColor: color,
            inactiveTrackColor: color.withOpacity(0.2),
            overlayColor: color.withOpacity(0.1),
          ),
          child: Slider(
            value: value.toDouble(),
            min: 1,
            max: 10,
            divisions: 9,
            onChanged: (v) => onChanged(v.round()),
          ),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(lowLabel, style: AppTextStyles.bodySmall),
            Text(highLabel, style: AppTextStyles.bodySmall),
          ],
        ),
      ],
    );
  }
}
