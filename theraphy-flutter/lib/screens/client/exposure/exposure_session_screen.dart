import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../models/exposure_model.dart';
import '../../../widgets/app_button.dart';
import '../../../widgets/suds_selector.dart';
import '../../../features/exposure/presentation/providers/exposure_provider.dart';

enum SessionPhase { setup, initialSuds, timer, finalSuds, summary }

class ExposureSessionScreen extends ConsumerStatefulWidget {
  final ExposureLevel level;
  
  const ExposureSessionScreen({super.key, required this.level});

  @override
  ConsumerState<ExposureSessionScreen> createState() => _ExposureSessionScreenState();
}

class _ExposureSessionScreenState extends ConsumerState<ExposureSessionScreen> {
  SessionPhase _phase = SessionPhase.setup;
  int? _initialSuds;
  int? _finalSuds;
  int _secondsRemaining = 300; // 5 minutes default
  Timer? _timer;
  bool _isPaused = false;

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!_isPaused) {
        setState(() {
          if (_secondsRemaining > 0) {
            _secondsRemaining--;
          } else {
            _timer?.cancel();
            _phase = SessionPhase.finalSuds;
          }
        });
      }
    });
  }

  String _formatTime(int seconds) {
    final mins = seconds ~/ 60;
    final secs = seconds % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  void _triggerEmergencyExit() {
    _timer?.cancel();
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.spa_rounded, color: AppColors.primary, size: 28),
            SizedBox(width: 8),
            Text('Let\'s Take a Pause'),
          ],
        ),
        content: const Text(
          'It is completely okay that this feels overwhelming. Your safety and comfort are what matters most. Let\'s step away from this task and find some calm.',
          style: TextStyle(height: 1.5),
        ),
        actionsAlignment: MainAxisAlignment.spaceEvenly,
        actionsOverflowButtonSpacing: 8,
        actions: [
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary.withOpacity(0.1),
              elevation: 0,
            ),
            onPressed: () {
              Navigator.pop(context); // close dialog
              context.go('/cbt/breathing'); // go to breathing
            },
            icon: const Icon(Icons.air_rounded, color: AppColors.primary),
            label: const Text('Mindful Breathing', style: TextStyle(color: AppColors.primary)),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error.withOpacity(0.1),
              elevation: 0,
            ),
            onPressed: () {
              Navigator.pop(context); // close dialog
              context.go('/emergency'); // go to emergency support
            },
            icon: const Icon(Icons.phone_in_talk_rounded, color: AppColors.error),
            label: const Text('Get Support', style: TextStyle(color: AppColors.error)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context); // close dialog
              Navigator.pop(context); // exit back to hierarchy
            },
            child: const Text('Exit Session', style: TextStyle(color: AppColors.textSecondary)),
          ),
        ],
      ),
    );
  }

  void _nextPhase() async {
    if (_phase == SessionPhase.finalSuds) {
      // Submit results to the backend before completing
      final success = await ref.read(exposureProvider.notifier).submitSession(
        sessionId: widget.level.id,
        anxietyBefore: _initialSuds ?? 5,
        anxietyAfter: _finalSuds ?? 5,
        clientNotes: 'Completed level ${widget.level.exposureLevel} self-guided session.',
      );
      
      if (mounted) {
        if (success) {
          setState(() {
            _phase = SessionPhase.summary;
          });
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to save session to database. Proceeding to summary.')),
          );
          setState(() {
            _phase = SessionPhase.summary;
          });
        }
      }
      return;
    }

    setState(() {
      switch (_phase) {
        case SessionPhase.setup:
          _phase = SessionPhase.initialSuds;
          break;
        case SessionPhase.initialSuds:
          _phase = SessionPhase.timer;
          _startTimer();
          break;
        case SessionPhase.timer:
          _timer?.cancel();
          _phase = SessionPhase.finalSuds;
          break;
        case SessionPhase.finalSuds:
          // Handled above asynchronously
          break;
        case SessionPhase.summary:
          Navigator.pop(context);
          break;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(exposureProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(widget.level.title),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => _confirmExit(),
        ),
      ),
      body: SafeArea(
        child: state.isSubmitting && _phase == SessionPhase.finalSuds
            ? const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text('Saving your progress securely...', style: AppTextStyles.bodyMedium),
                  ],
                ),
              )
            : Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
                child: Column(
                  children: [
                    _buildProgressDots(),
                    const SizedBox(height: 40),
                    Expanded(
                      child: AnimatedSwitcher(
                        duration: const Duration(milliseconds: 300),
                        child: _buildPhaseContent(),
                      ),
                    ),
                    const SizedBox(height: 24),
                    _buildActionButtons(),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildProgressDots() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: SessionPhase.values.map((phase) {
        final isActive = _phase == phase;
        final isCompleted = _phase.index > phase.index;
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: isActive ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: isActive || isCompleted ? AppColors.primary : AppColors.surfaceVariant,
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPhaseContent() {
    switch (_phase) {
      case SessionPhase.setup:
        return _buildSetupContent();
      case SessionPhase.initialSuds:
        return _buildSudsContent(
          title: 'Current Anxiety',
          subtitle: 'Before we begin, how much distress are you feeling right now?',
          onSelected: (val) {
            setState(() => _initialSuds = val);
            if (val >= 9) {
              _triggerEmergencyExit();
            }
          },
          selectedValue: _initialSuds,
        );
      case SessionPhase.timer:
        return _buildTimerContent();
      case SessionPhase.finalSuds:
        return _buildSudsContent(
          title: 'Current Anxiety',
          subtitle: 'Now that the session is over, how much distress are you feeling?',
          onSelected: (val) => setState(() => _finalSuds = val),
          selectedValue: _finalSuds,
        );
      case SessionPhase.summary:
        return _buildSummaryContent();
    }
  }

  Widget _buildSetupContent() {
    return Column(
      key: const ValueKey('setup'),
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.info_outline, size: 64, color: AppColors.primary),
        const SizedBox(height: 24),
        Text('Ready for Exposure?', style: AppTextStyles.displaySmall),
        const SizedBox(height: 16),
        Text(
          'During this session, try to stay focused on the task. It\'s normal to feel some anxiety—that\'s part of the process.',
          style: AppTextStyles.bodyLarge,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: AppColors.cardShadow,
            border: Border.all(color: AppColors.primary.withOpacity(0.1)),
          ),
          child: Column(
            children: [
              Text('Your Task:', style: AppTextStyles.titleMedium),
              const SizedBox(height: 4),
              Text(widget.level.description, style: AppTextStyles.bodyMedium, textAlign: TextAlign.center),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSudsContent({
    required String title,
    required String subtitle,
    required int? selectedValue,
    required ValueChanged<int> onSelected,
  }) {
    return Column(
      key: ValueKey(title),
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(title, style: AppTextStyles.displaySmall),
        const SizedBox(height: 12),
        Text(subtitle, style: AppTextStyles.bodyLarge, textAlign: TextAlign.center),
        const SizedBox(height: 48),
        SudsSelector(selectedValue: selectedValue, onSelected: onSelected),
      ],
    );
  }

  Widget _buildTimerContent() {
    return Column(
      key: const ValueKey('timer'),
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 200,
              height: 200,
              child: CircularProgressIndicator(
                value: _secondsRemaining / 300,
                strokeWidth: 8,
                backgroundColor: AppColors.surfaceVariant,
                color: AppColors.primary,
              ),
            ),
            Text(
              _formatTime(_secondsRemaining),
              style: AppTextStyles.displayLarge.copyWith(fontSize: 48),
            ),
          ],
        ),
        const SizedBox(height: 40),
        Text('Keep Going', style: AppTextStyles.headlineLarge),
        const SizedBox(height: 12),
        Text(
          'Notice your anxiety, but try not to fight it. Let it be there while you continue your task.',
          style: AppTextStyles.bodyLarge,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton.filledTonal(
              icon: Icon(_isPaused ? Icons.play_arrow : Icons.pause),
              onPressed: () => setState(() => _isPaused = !_isPaused),
              iconSize: 32,
            ),
            const SizedBox(width: 16),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error.withOpacity(0.1),
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _triggerEmergencyExit,
              icon: const Icon(Icons.warning_amber_rounded, color: AppColors.error),
              label: const Text('Too Overwhelming', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummaryContent() {
    final reduction = (_initialSuds ?? 0) - (_finalSuds ?? 0);
    return Column(
      key: const ValueKey('summary'),
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.check_circle, size: 80, color: AppColors.success),
        const SizedBox(height: 24),
        Text('Session Complete!', style: AppTextStyles.displaySmall),
        const SizedBox(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildSudsSummaryItem('Before', _initialSuds ?? 0),
            const Icon(Icons.arrow_forward, color: AppColors.textHint),
            _buildSudsSummaryItem('After', _finalSuds ?? 0),
          ],
        ),
        const SizedBox(height: 40),
        if (reduction > 0)
          Text(
            'Great job! Your distress levels decreased by $reduction points.',
            style: AppTextStyles.bodyLarge.copyWith(color: AppColors.success, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          )
        else
          Text(
            'Well done for completing the session. Every minute spent in exposure counts towards your long-term progress.',
            style: AppTextStyles.bodyLarge,
            textAlign: TextAlign.center,
          ),
      ],
    );
  }

  Widget _buildSudsSummaryItem(String label, int value) {
    return Column(
      children: [
        Text(label, style: AppTextStyles.labelMedium),
        const SizedBox(height: 8),
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: AppColors.anxietyColor(value).withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              value.toString(),
              style: AppTextStyles.displaySmall.copyWith(color: AppColors.anxietyColor(value)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons() {
    bool canContinue = true;
    String label = 'Continue';

    if (_phase == SessionPhase.initialSuds && _initialSuds == null) canContinue = false;
    if (_phase == SessionPhase.finalSuds && _finalSuds == null) canContinue = false;
    if (_phase == SessionPhase.timer) label = 'Finish Early';
    if (_phase == SessionPhase.summary) label = 'Back to Hierarchy';
    if (_phase == SessionPhase.setup) label = 'I\'m Ready';

    return AppButton(
      label: label,
      onPressed: canContinue ? _nextPhase : null,
    );
  }

  void _confirmExit() {
    if (_phase == SessionPhase.summary) {
      Navigator.pop(context);
      return;
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('End Session?'),
        content: const Text('Are you sure you want to exit? Your progress for this session won\'t be saved.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Keep Going')),
          TextButton(
            onPressed: () {
              Navigator.pop(context); // close dialog
              Navigator.pop(context); // close screen
            },
            child: const Text('Exit Session', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }
}
