import api from './api';

export const getTherapistProfile = () => 
  api.get('/users/profile').then(res => res.data);

export const updateTherapistProfile = (data) => 
  api.put('/users/profile', data).then(res => res.data);

export const getMyClients = () => 
  api.get('/assignments/my-clients').then(res => res.data);

export const getClientDetails = (clientId) => 
  api.get(`/users/${clientId}`).then(res => res.data);

export const getTherapistSessions = () => 
  api.get('/sessions/therapist').then(res => res.data);

export const getSessionDetails = (sessionId) => 
  api.get(`/sessions/${sessionId}`).then(res => res.data);

export const completeSession = (sessionId, data) => 
  api.put(`/sessions/${sessionId}/complete`, data).then(res => res.data);

export const addSessionNotes = (sessionId, data) => 
  api.post(`/sessions/${sessionId}/notes`, data).then(res => res.data);

export const addSessionProgress = (data) => 
  api.post('/progress/session', data).then(res => res.data);

export const getClientProgress = (clientId, params) => 
  api.get(`/progress/timeline?clientId=${clientId}`, { params }).then(res => res.data);

export const getProgressSummary = (clientId) => 
  api.get(`/progress/summary?clientId=${clientId}`).then(res => res.data);

export const getSessionProgress = (sessionId) => 
  api.get(`/progress/session/${sessionId}`).then(res => res.data);

export const getClientMoodHistory = (clientId) => 
  api.get(`/mood/history/${clientId}`).then(res => res.data);

export const getMoodTrend = (clientId) => 
  api.get(`/mood/trend/${clientId}`).then(res => res.data);

export const createExposurePlan = (data) => 
  api.post('/exposure', data).then(res => res.data);

export const getExposureSessions = () => 
  api.get('/exposure').then(res => res.data);

export const getClientExposureSessions = (clientId) => 
  api.get(`/exposure/client/${clientId}`).then(res => res.data);

export const updateExposureSession = (exposureId, data) => 
  api.put(`/exposure/${exposureId}`, data).then(res => res.data);

export const createCBTExercise = (data) => 
  api.post('/cbt', data).then(res => res.data);

export const getCBTExercises = () => 
  api.get('/cbt').then(res => res.data);

export const getCBTExerciseById = (exerciseId) => 
  api.get(`/cbt/${exerciseId}`).then(res => res.data);

export const updateCBTExercise = (exerciseId, data) => 
  api.put(`/cbt/${exerciseId}`, data).then(res => res.data);

export const deleteCBTExercise = (exerciseId) => 
  api.delete(`/cbt/${exerciseId}`).then(res => res.data);

export const getClientCBTProgress = (clientId) => 
  api.get(`/cbt/progress/${clientId}`).then(res => res.data);

export const getClientAssessments = () => 
  api.get("/assessments/my/").then(res => res.data);

export const getAssessmentById = (assessmentId) => 
  api.get(`/assessments/${assessmentId}`).then(res => res.data);

export const getAssessmentQuestions = (category) => 
  api.get('/assessments/questions', { params: { category } }).then(res => res.data);

export const getClientAssessmentStats = (clientId) => 
  api.get(`/assessments/stats/${clientId}`).then(res => res.data);

export const generateProgressReport = (data) => 
  api.post('/reports/generate', data).then(res => res.data);

export const getClientReports = (clientId) => 
  api.get(`/reports/client/${clientId}`).then(res => res.data);

export const getEmergencyAlerts = (params) => 
  api.get('/emergency', { params }).then(res => res.data);

export const handleEmergency = (emergencyId, data) => 
  api.put(`/emergency/${emergencyId}/handle`, data).then(res => res.data);

export const getNotifications = () => 
  api.get('/notifications').then(res => res.data);

export const markNotificationRead = (notificationId) => 
  api.put(`/notifications/${notificationId}/read`).then(res => res.data);

export const markAllNotificationsRead = () => 
  api.put('/notifications/read-all').then(res => res.data);

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