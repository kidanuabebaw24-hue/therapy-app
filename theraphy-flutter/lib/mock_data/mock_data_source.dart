import '../models/assessment_model.dart';
import '../models/therapist_model.dart';
import '../models/exposure_model.dart';
import '../models/emergency_resource_model.dart';
import '../features/cbt/models/cbt_exercise_model.dart';
import '../models/user_model.dart';
import '../models/mood_model.dart';

class MockData {
  MockData._();

  // Mock User
  static const UserModel mockUser = UserModel(
    id: 'u1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'client',
    isVerified: true,
    hasCompletedInitialCBT: true,
    token: 'mock_token_123',
    currentAnxietyLevel: 4,
    primaryPhobia: 'Social Anxiety',
  );

  // Mock Moods — patientId replaces old userId
  static final List<MoodModel> mockMoods = [
    MoodModel(
      id: 'm1',
      patientId: 'u1',
      moodScore: 8,
      anxietyLevel: 2,
      emotions: ['Happy', 'Relaxed'],
      notes: 'Feeling great after therapy!',
      createdAt: DateTime.now().subtract(const Duration(days: 0)),
    ),
    MoodModel(
      id: 'm2',
      patientId: 'u1',
      moodScore: 6,
      anxietyLevel: 4,
      emotions: ['Neutral'],
      notes: 'A bit busy today.',
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
    MoodModel(
      id: 'm3',
      patientId: 'u1',
      moodScore: 4,
      anxietyLevel: 7,
      emotions: ['Anxious', 'Stressed'],
      notes: 'Work was stressful.',
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
    ),
    MoodModel(
      id: 'm4',
      patientId: 'u1',
      moodScore: 7,
      anxietyLevel: 3,
      emotions: ['Calm'],
      createdAt: DateTime.now().subtract(const Duration(days: 3)),
    ),
  ];

  // Assessment Questions
  static const List<AssessmentQuestion> assessmentQuestions = [
    AssessmentQuestion(
      id: 'q1',
      text: 'How often do you feel anxious or worried?',
      options: ['Rarely', 'Sometimes', 'Often', 'Very Often', 'Almost Always'],
    ),
    AssessmentQuestion(
      id: 'q2',
      text: 'How much does anxiety affect your daily activities?',
      options: ['Not at all', 'Mildly', 'Moderately', 'Severely', 'Very Severely'],
    ),
    AssessmentQuestion(
      id: 'q3',
      text: 'How often do you experience physical symptoms like racing heart?',
      options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
    ),
  ];

  // Therapists
  static const List<TherapistModel> therapists = [
    TherapistModel(
      id: 't1',
      name: 'Dr. Hilina Abraham',
      specialization: 'CBT & Social Anxiety',
      rating: 4.9,
      reviewsCount: 124,
      bio: 'Expert in treating social phobias and panic disorders with 10+ years experience.',
      imageUrl: 'assets/images/dr_hilina.png',
      availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM'],
      hourlyRate: 120,
    ),
    TherapistModel(
      id: 't2',
      name: 'Dr. Nardos Abebe',
      specialization: 'Exposure Therapy & Phobias',
      rating: 4.8,
      reviewsCount: 89,
      bio: 'Specializes in systematic desensitization and gradual exposure techniques.',
      imageUrl: 'assets/images/dr_nardos.png',
      availableSlots: ['11:00 AM', '01:00 PM', '03:30 PM'],
      hourlyRate: 110,
    ),
    TherapistModel(
      id: 't3',
      name: 'Dr. Henok Melese',
      specialization: 'Clinical Psychology & Trauma',
      rating: 4.7,
      reviewsCount: 56,
      bio: 'Focused on trauma-informed care and adolescent mental health support.',
      imageUrl: 'assets/images/dr_henok.png',
      availableSlots: ['08:00 AM', '12:00 PM', '05:00 PM'],
      hourlyRate: 100,
    ),
  ];

  // Exposure Plans
  static const List<ExposurePlan> exposurePlans = [
    ExposurePlan(
      id: 'ep1',
      title: 'Public Speaking',
      description: 'Gradual exposure to speaking in front of others.',
      overallProgress: 0.4,
      levels: [
        ExposureLevel(id: 'l1', title: 'Imagining a Speech', description: 'Close your eyes and visualize.', targetAnxietyScore: 2, isLocked: false, isCompleted: true),
        ExposureLevel(id: 'l2', title: 'Speaking to a Mirror', description: 'Practice your speech alone.', targetAnxietyScore: 4, isLocked: false, isCompleted: false),
        ExposureLevel(id: 'l3', title: 'Speaking to a Friend', description: 'Present to someone you trust.', targetAnxietyScore: 6, isLocked: true),
      ],
    ),
  ];

  // Emergency Resources
  static const List<EmergencyResource> emergencyResources = [
    EmergencyResource(
      id: 'r1',
      title: 'Crisis Text Line',
      description: 'Free, 24/7 support at your fingertips.',
      phoneNumber: '741741',
      type: 'hotline',
    ),
    EmergencyResource(
      id: 'r2',
      title: 'National Suicide Prevention',
      description: 'Available 24 hours in English and Spanish.',
      phoneNumber: '988',
      type: 'hotline',
    ),
  ];
}
