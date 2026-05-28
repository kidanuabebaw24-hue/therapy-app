import api from './api';

const unwrap = (payload) => payload?.data ?? payload ?? null;

export const getTherapistProfile = () => 
  api.get('/users/profile').then(res => unwrap(res.data));

export const updateTherapistProfile = (data) => 
  api.put('/users/profile', data).then(res => unwrap(res.data));

export const getMyClients = () => 
  api.get('/assignments/my-clients').then(res => {
    const clients = unwrap(res.data) || [];
    return { clients };
  });

export const getClientDetails = async (clientId) => {
  const clientsRes = await getMyClients();
  const match = (clientsRes.clients || []).find((c) => c.patient?.id === clientId);
  return match?.patient || null;
};

export const getTherapistSessions = () => 
  api.get('/appointments/me').then(res => {
    const sessions = unwrap(res.data) || [];
    return {
      sessions: sessions.map((s) => ({
        ...s,
        client: s.patient?.user
          ? { ...s.patient.user, id: s.patient.id }
          : s.client,
      })),
    };
  });

export const getSessionDetails = (sessionId) => 
  api.get(`/appointments/${sessionId}`).then(res => res.data);

export const completeSession = (sessionId, data) => 
  api.patch(`/appointments/${sessionId}/complete`, data).then(res => res.data);

export const addSessionNotes = (sessionId, data) => 
  api.patch(`/appointments/${sessionId}/complete`, data).then(res => res.data);

export const addSessionProgress = (data) => 
  api.post('/progress/session', data).then(res => res.data);

export const getClientProgress = (clientId, params) => 
  api.get('/progress/timeline', { params: { clientId, ...params } }).then(res => unwrap(res.data) || []);

export const getProgressSummary = async (clientId) => {
  const timeline = await getClientProgress(clientId);
  const entries = Array.isArray(timeline) ? timeline : [];
  if (!entries.length) return { averageMood: 0, averageAnxiety: 0, entries: 0 };
  const averageMood =
    entries.reduce((sum, e) => sum + (e.moodScore || 0), 0) / entries.length;
  const averageAnxiety =
    entries.reduce((sum, e) => sum + (e.anxietyScore || 0), 0) / entries.length;
  return {
    averageMood: Number(averageMood.toFixed(1)),
    averageAnxiety: Number(averageAnxiety.toFixed(1)),
    entries: entries.length,
  };
};

export const getSessionProgress = (sessionId) => 
  api.get(`/progress/session/${sessionId}`).then(res => res.data);

export const getClientMoodHistory = (clientId) => 
  api.get('/moods/history', { params: { clientId } }).then(res => unwrap(res.data) || []);

export const getMoodTrend = (clientId) => 
  api.get('/moods/trend', { params: { clientId } }).then(res => res.data);

export const createExposurePlan = (data) => 
  api.post('/exposure/plan', data).then(res => res.data);

export const getExposureSessions = () => 
  api.get('/exposure/sessions').then(res => unwrap(res.data) || []);

export const getClientExposureSessions = (clientId) => 
  api.get(`/exposure/client/${clientId}`).then(res => res.data);

export const updateExposureSession = (exposureId, data) => 
  api.patch(`/exposure/${exposureId}`, data).then(res => res.data);

export const createCBTExercise = (data) => 
  api.post('/cbt/exercises', data).then(res => res.data);

export const getCBTExercises = () => 
  api.get('/cbt/exercises').then(res => unwrap(res.data) || []);

export const getCBTExerciseById = (exerciseId) => 
  api.get(`/cbt/exercises/${exerciseId}`).then(res => unwrap(res.data));

export const updateCBTExercise = (exerciseId, data) => 
  api.post('/cbt/exercises', { ...data, id: exerciseId }).then(res => res.data);

export const deleteCBTExercise = (exerciseId) => 
  Promise.resolve({ success: false, message: `Delete not supported for exercise ${exerciseId}` });

export const getClientCBTProgress = (clientId) => 
  api.get(`/cbt/progress/${clientId}`).then(res => res.data);

export const getClientAssessments = () => 
  api.get('/assessments/history').then(res => unwrap(res.data) || []);

export const getAssessmentById = (assessmentId) => 
  api.get(`/assessments/${assessmentId}`).then(res => res.data);

export const getAssessmentQuestions = (category) => 
  api.get('/assessments/questions', { params: { category } }).then(res => unwrap(res.data) || []);

export const getClientAssessmentStats = (clientId) => 
  api.get('/assessments/stats', { params: { clientId } }).then(res => unwrap(res.data));

export const generateProgressReport = (data) => 
  api.post('/reports/generate', data).then(res => res.data);

export const getClientReports = (clientId) => 
  api.get('/reports', { params: { clientId } }).then(res => unwrap(res.data) || []);

export const getEmergencyAlerts = (params) => 
  api.get('/emergency/logs', { params }).then(res => unwrap(res.data) || []);

export const handleEmergency = (emergencyId, data) => 
  api.put(`/emergency/${emergencyId}/handle`, data).then(res => res.data);

export const getNotifications = () => 
  api.get('/notifications/my').then(res => res.data);

export const markNotificationRead = (notificationId) => 
  api.patch(`/notifications/${notificationId}/read`).then(res => res.data);

export const markAllNotificationsRead = () => 
  api.patch('/notifications/read-all').then(res => res.data);

export const getTherapistPayments = (params) => 
  api.get('/payments/therapist', { params }).then(res => res.data);

export const getTherapistDashboardStats = async () => {
  try {
    const [clients, sessions] = await Promise.all([
      getMyClients(),
      getTherapistSessions()
    ]);
    
    const today = new Date().toDateString();
    const todaySessions = sessions.sessions?.filter(s => 
      new Date(s.date).toDateString() === today
    ) || [];
    
    const pendingSessions = sessions.sessions?.filter(s => 
      s.status === 'scheduled' && new Date(s.date) > new Date()
    ) || [];
    
    const completedSessions = sessions.sessions?.filter(s => 
      s.status === 'completed'
    ) || [];

    return {
      stats: {
        totalClients: clients.clients?.length || 0,
        todaySessions: todaySessions.length,
        pendingSessions: pendingSessions.length,
        completedSessions: completedSessions.length,
        pendingEmergencies: 0,
        averageProgress: 75
      },
      recentActivity: sessions.sessions?.slice(0, 5) || []
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};