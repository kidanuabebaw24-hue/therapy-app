import api from './api';

// ============================================
// AUTHENTICATION
// ============================================
export const clientSignup = (data) => 
  api.post('/auth/register', { ...data, role: 'client' }).then(res => res.data);

// ============================================
// SELF-ASSESSMENT
// ============================================
// assessmentService.js
export const createAssessment = (data) => 
  api.post('/assessments', data).then(res => res.data);

export const getMyAssessments = () => 
  api.get('/assessments/my').then(res => res.data);

export const getAssessmentStats = () => 
  api.get('/assessments/stats').then(res => res.data);

export const getAssessmentQuestions = (params) => 
  api.get('/assessments/questions', { params }).then(res => res.data);

export const createAssessmentQuestion = (data) => 
  api.post('/assessments/questions', data).then(res => res.data);

// ============================================
// HEALTH TRACKING (MOOD)
// ============================================
export const logMood = (data) => 
  api.post('/mood', data).then(res => res.data);

export const getMoodHistory = () => 
  api.get('/mood/my').then(res => res.data);

export const getMoodTrend = () => 
  api.get('/mood/trend').then(res => res.data);

// ============================================
// SCHEDULING (SESSIONS)
// ============================================
export const bookSession = (data) => 
  api.post('/sessions', data).then(res => res.data);

export const getMySessions = () => 
  api.get('/sessions/my').then(res => res.data);

export const getAvailableTherapists = () => 
  api.get('/assignments/available-therapists').then(res => res.data);

export const cancelSession = (sessionId) => 
  api.put(`/sessions/${sessionId}/cancel`).then(res => res.data);

// ============================================
// PAYMENTS
// ============================================
export const createPayment = (data) => 
  api.post('/payments', data).then(res => res.data);

export const getMyPayments = () => 
  api.get('/payments/my').then(res => res.data);

export const getPaymentStats = () => 
  api.get('/payments/stats').then(res => res.data);

// ============================================
// CBT EXERCISES
// ============================================
export const getCBTExercises = () => 
  api.get('/cbt').then(res => res.data);

export const getMyCBTProgress = () => 
  api.get('/cbt/progress/my').then(res => res.data);

export const submitCBTProgress = (data) => 
  api.post('/cbt/progress', data).then(res => res.data);

// ============================================
// EXPOSURE THERAPY
// ============================================
export const getMyExposureSessions = () => 
  api.get('/exposure').then(res => res.data);

export const updateExposureSession = (exposureId, data) => 
  api.put(`/exposure/${exposureId}`, data).then(res => res.data);

// ============================================
// PROGRESS & REPORTS
// ============================================
export const getMyProgress = () => 
  api.get('/progress/timeline').then(res => res.data);

export const getProgressSummary = () => 
  api.get('/progress/summary').then(res => res.data);

export const createDailyProgress = (data) => 
  api.post('/progress/daily', data).then(res => res.data);

export const getMyReports = () => 
  api.get('/reports').then(res => res.data);

// ============================================
// EMERGENCY
// ============================================
export const triggerEmergency = (data) => 
  api.post('/emergency', data).then(res => res.data);

export const getMyEmergencies = () => 
  api.get('/emergency/my').then(res => res.data);

// ============================================
// PROFILE MANAGEMENT
// ============================================
export const getClientProfile = () => 
  api.get('/users/profile').then(res => res.data);

export const updateClientProfile = (data) => 
  api.put('/users/profile', data).then(res => res.data);

export const getMyTherapist = () => 
  api.get('/assignments/my-therapist').then(res => res.data);

export const giveConsent = (data) => 
  api.post('/consent', data).then(res => res.data);

// ============================================
// DASHBOARD STATS (Helper Function)
// ============================================
export const getClientDashboardStats = async () => {
  try {
    const [assessments, moods, sessions, payments] = await Promise.all([
      getMyAssessments().catch(() => ({ assessments: [] })),
      getMoodHistory().catch(() => []),
      getMySessions().catch(() => ({ sessions: [] })),
      getPaymentStats().catch(() => ({}))
    ]);

    const upcomingSessions = sessions.sessions?.filter(s => 
      s.status === 'scheduled' && new Date(s.date) > new Date()
    ) || [];

    const completedAssessments = assessments.assessments?.length || 0;
    const moodEntries = moods.length || 0;

    return {
      stats: {
        totalSessions: sessions.sessions?.length || 0,
        upcomingSessions: upcomingSessions.length,
        completedAssessments,
        moodEntries,
        averageMood: calculateAverageMood(moods),
        nextSession: upcomingSessions[0] || null
      },
      recentActivity: [
        ...(assessments.assessments?.slice(0, 3).map(a => ({
          type: 'assessment',
          date: a.createdAt,
          description: `Completed ${a.type} assessment - Score: ${a.score}`,
          severity: a.severity
        })) || []),
        ...(moods.slice(0, 3).map(m => ({
          type: 'mood',
          date: m.createdAt,
          description: `Logged mood: ${m.moodScore}/10, Anxiety: ${m.anxietyLevel || 'N/A'}/10`
        }))),
        ...(sessions.sessions?.slice(0, 3).map(s => ({
          type: 'session',
          date: s.date,
          description: `${s.type} session with ${s.therapist?.name}`,
          status: s.status
        })) || [])
      ].sort((a, b) => new Date(b.date) - new Date(a.date))
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Helper function for dashboard stats
const calculateAverageMood = (moods) => {
  if (!moods.length) return 0;
  const sum = moods.reduce((acc, mood) => acc + (mood.moodScore || 0), 0);
  return (sum / moods.length).toFixed(1);
};