import 'package:flutter/material.dart';
import 'package:theraphy_flutter/l10n/app_localizations.dart';
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
    final l10n = AppLocalizations.of(context);
    try {
      await ref.read(moodProvider.notifier).logMood(
            moodScore: _moodScore,
            anxietyLevel: _anxietyLevel,
            emotions: _selectedEmotions,
            notes: _notesCtrl.text.trim().isEmpty ? null : _notesCtrl.text.trim(),
          );
      if (mounted) {
        SnackbarUtils.showSuccess(context, l10n.moodLoggedSuccess);
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

  List<String> _getLocalizedEmotions(AppLocalizations l10n) => [
    l10n.emotionCalm,
    l10n.emotionHappy,
    l10n.emotionAnxious,
    l10n.emotionSad,
    l10n.emotionAngry,
    l10n.emotionHopeful,
    l10n.emotionTired,
    l10n.emotionStressed,
    l10n.emotionGrateful,
    l10n.emotionOverwhelmed,
  ];

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(moodProvider);
    final l10n = AppLocalizations.of(context);
    final localizedEmotions = _getLocalizedEmotions(l10n);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.moodTracking)),
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
                    Text(l10n.howAreYouFeelingNow,
                        style: AppTextStyles.headlineMedium),
                    const SizedBox(height: 24),

                    // Mood Score
                    _SliderSection(
                      label: l10n.mood,
                      value: _moodScore,
                      color: AppColors.accent,
                      lowLabel: l10n.veryLow,
                      highLabel: l10n.excellent,
                      onChanged: (v) => setState(() => _moodScore = v),
                    ),
                    const SizedBox(height: 20),

                    // Anxiety Level
                    _SliderSection(
                      label: l10n.anxietyLevel,
                      value: _anxietyLevel,
                      color: AppColors.anxietyColor(_anxietyLevel),
                      lowLabel: l10n.none,
                      highLabel: l10n.severe,
                      onChanged: (v) => setState(() => _anxietyLevel = v),
                    ),
                    const SizedBox(height: 24),

                    // Emotions
                    Text(l10n.emotions, style: AppTextStyles.titleLarge),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: List.generate(localizedEmotions.length, (i) {
                        final label = localizedEmotions[i];
                        final rawKey = _emotions[i];
                        final selected = _selectedEmotions.contains(rawKey);
                        return FilterChip(
                          label: Text(label),
                          selected: selected,
                          onSelected: (v) {
                            setState(() {
                              if (v) {
                                _selectedEmotions.add(rawKey);
                              } else {
                                _selectedEmotions.remove(rawKey);
                              }
                            });
                          },
                        );
                      }),
                    ),
                    const SizedBox(height: 20),

                    // Notes
                    Text(l10n.notesOptional, style: AppTextStyles.titleLarge),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _notesCtrl,
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: l10n.notesHint,
                      ),
                    ),
                    const SizedBox(height: 24),

                    AppButton(
                      label: l10n.logMood,
                      onPressed: _submit,
                      isLoading: state.isSubmitting,
                      icon: Icons.check,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // History
              Text(l10n.recentEntries, style: AppTextStyles.headlineMedium),
              const SizedBox(height: 12),
              if (state.isLoading)
                const Center(child: CircularProgressIndicator())
              else if (state.moods.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(l10n.noMoodEntries,
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
                                    '${l10n.anxietyLevel}: ${m.anxietyLevel}/10',
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
