export const mockUser = {
  id: 'u1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'client',
  isVerified: true,
  hasCompletedInitialCBT: true,
  requiresCBT: false,
  token: 'mock_token_123',
};

export const mockTherapists = [
  {
    id: 't1',
    name: 'Dr. Hilina Abraham',
    specialization: 'CBT & Social Anxiety',
    rating: 4.9,
    reviewsCount: 124,
    bio: 'Expert in treating social phobias and panic disorders.',
    imageUrl: 'https://i.pravatar.cc/150?u=t1',
    availableSlots: ['09:00 AM', '10:30 AM'],
    hourlyRate: 120,
  },
  {
    id: 't2',
    name: 'Dr. Nardos Abebe',
    specialization: 'Exposure Therapy & Phobias',
    rating: 4.8,
    reviewsCount: 89,
    bio: 'Specializes in systematic desensitization.',
    imageUrl: 'https://i.pravatar.cc/150?u=t2',
    availableSlots: ['11:00 AM', '01:00 PM'],
    hourlyRate: 110,
  }
];

export const mockAssessmentQuestions = [
  {
    id: 'q1',
    text: 'How often do you feel anxious or worried?',
    options: ['Rarely', 'Sometimes', 'Often', 'Very Often'],
    type: 'multiple_choice',
  },
  {
    id: 'q2',
    text: 'Rate your general stress level today.',
    options: ['1', '2', '3', '4', '5'],
    type: 'rating',
  }
];

export const mockMoods = [
  {
    id: 'm1',
    user: 'u1',
    moodScore: 8,
    anxietyLevel: 2,
    emotions: ['Happy', 'Relaxed'],
    notes: 'Feeling great!',
    createdAt: new Date().toISOString(),
  }
];
