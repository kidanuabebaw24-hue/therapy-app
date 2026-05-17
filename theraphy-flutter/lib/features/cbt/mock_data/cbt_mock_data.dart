import '../models/cbt_exercise_model.dart';

class CbtMockData {
  static final List<CbtExerciseModel> allExercises = [
    CbtExerciseModel(
      id: 'e1',
      title: 'Thought Record',
      description: 'The foundation of CBT. Learn to identify and challenge negative automatic thoughts by examining the evidence.',
      category: 'Cognitive Reframing',
      difficulty: 'Beginner',
      estimatedMinutes: 12,
      isMandatory: true,
      themeColors: ['#4F46E5', '#7C3AED'],
      steps: [
        const CbtStep(
          prompt: 'What was the situation?',
          guidance: 'Describe the event as objectively as possible. Who were you with? What were you doing?',
          placeholder: 'e.g., I was at the grocery store and saw an old friend...',
        ),
        const CbtStep(
          prompt: 'How did you feel?',
          type: CbtQuestionType.mood,
          guidance: 'Select the primary emotion you felt during the situation.',
        ),
        const CbtStep(
          prompt: 'Rate your anxiety level (0-10)',
          type: CbtQuestionType.anxietyScale,
          guidance: 'How intense was the physical sensation of anxiety?',
        ),
        const CbtStep(
          prompt: 'What was the negative thought?',
          guidance: 'What went through your mind? What were you telling yourself?',
          placeholder: 'e.g., They probably think I look terrible and unsuccessful...',
        ),
        const CbtStep(
          prompt: 'What is a more balanced way to think about this?',
          guidance: 'Look for evidence that contradicts your negative thought. What would you tell a friend?',
          placeholder: 'e.g., My friend was likely just surprised to see me and was focusing on their own day...',
        ),
      ],
    ),
    CbtExerciseModel(
      id: 'e2',
      title: 'Panic Recovery',
      description: 'A rapid response guide to help you manage and de-escalate acute panic symptoms.',
      category: 'Crisis Support',
      difficulty: 'Intermediate',
      estimatedMinutes: 8,
      isMandatory: false,
      themeColors: ['#EF4444', '#F97316'],
      steps: [
        const CbtStep(
          prompt: 'Are you safe right now?',
          type: CbtQuestionType.yesNo,
          guidance: 'Acknowledge your physical safety to begin grounding.',
        ),
        const CbtStep(
          prompt: 'What physical sensations are you feeling?',
          guidance: 'Naming the sensations reduces their power. (Heart racing, short of breath, etc.)',
        ),
        const CbtStep(
          prompt: 'Repeat after me: "This is a temporary surge of adrenaline. It will pass."',
          type: CbtQuestionType.yesNo,
          guidance: 'Acceptance is the fastest way through panic.',
        ),
      ],
    ),
    CbtExerciseModel(
      id: 'e3',
      title: '5-4-3-2-1 Grounding',
      description: 'Reconnect with the present moment using your five senses.',
      category: 'Grounding',
      difficulty: 'Beginner',
      estimatedMinutes: 5,
      isMandatory: false,
      themeColors: ['#10B981', '#3B82F6'],
      steps: [
        const CbtStep(prompt: 'Name 5 things you can see.'),
        const CbtStep(prompt: 'Name 4 things you can touch.'),
        const CbtStep(prompt: 'Name 3 things you can hear.'),
        const CbtStep(prompt: 'Name 2 things you can smell.'),
        const CbtStep(prompt: 'Name 1 thing you can taste.'),
      ],
    ),
    CbtExerciseModel(
      id: 'e4',
      title: 'Positive Reframing',
      description: 'Train your brain to see opportunities and strengths in challenging situations.',
      category: 'Positivity',
      difficulty: 'Intermediate',
      estimatedMinutes: 10,
      isMandatory: false,
      themeColors: ['#F59E0B', '#FCD34D'],
      steps: [
        const CbtStep(prompt: 'Describe a recent challenge.'),
        const CbtStep(prompt: 'What is one thing you learned from this?'),
        const CbtStep(prompt: 'How did you show strength during this event?'),
      ],
    ),
  ];
}
