import api from './api';

const unwrap = (payload) => payload?.data ?? payload ?? null;

// ── Auth ───────────────────────────────────────────────────────────────────────
export const clientSignup = (data) =>
  api.post('/auth/register', { ...data, role: 'client' }).then((res) => res.data);

// ── Self-Assessment ────────────────────────────────────────────────────────────
export const createAssessment = (data) =>
  api.post('/assessments', data).then((res) => res.data);
export const getMyAssessments = () =>
  api.get('/assessments/history').then((res) => res.data);
export const getAssessmentQuestions = (params) =>
  api.get('/assessments/questions', { params }).then((res) => res.data);
export const getAssessmentStats = () =>
  api.get('/assessments/stats').then((res) => unwrap(res.data));

// ── Mood / Health Tracking ─────────────────────────────────────────────────────
// Backend route: /api/mood  (MoodLog model)
export const logMood = (data) =>
  api.post('/moods', data).then((res) => res.data);
export const getMoodHistory = () =>
  api.get('/moods/history').then((res) => unwrap(res.data) || []);
export const getMoodTrend = () =>
  api.get('/moods/trend').then((res) => res.data);

// ── Scheduling (Appointments) ──────────────────────────────────────────────────
// Backend uses /appointments, not /sessions
export const bookSession = (data) =>
  api.post('/appointments/book', {
    therapistId: data.therapistId ?? data.therapist,
    date: data.date,
    duration: data.duration,
    type: data.type,
    notes: data.notes,
  }).then((res) => res.data);
export const getMySessions = () =>
  api.get('/appointments/me').then((res) => {
    const sessions = unwrap(res.data) || [];
    return {
      ...res.data,
      sessions: sessions.map((session) => ({
        ...session,
        therapist: session.therapist
          ? {
              ...session.therapist,
              name: session.therapist.user?.name || session.therapist.name,
            }
          : null,
      })),
    };
  });
export const cancelSession = (sessionId, notes = 'Cancelled by client') =>
  api.patch(`/appointments/${sessionId}/complete`, { notes }).then((res) => res.data);

// ── Booking Requests ───────────────────────────────────────────────────────────
export const createBookingRequest = (data) =>
  api.post('/booking', data).then((res) => res.data);
export const getMyBookingRequests = () =>
  api.get('/booking/my').then((res) => res.data);

// ── Therapists ─────────────────────────────────────────────────────────────────
export const getAvailableTherapists = () =>
  api.get('/therapists').then((res) => {
    const therapists = unwrap(res.data) || [];
    return {
      ...res.data,
      therapists: therapists.map((therapist) => ({
        ...therapist,
        name: therapist.user?.name || therapist.name,
        email: therapist.user?.email || therapist.email,
      })),
    };
  });
export const getAllTherapists = () =>
  api.get('/therapists').then((res) => res.data);

// ── Payments ───────────────────────────────────────────────────────────────────
export const createPayment = (data) =>
  api.post('/payments', {
    appointmentId: data.appointmentId ?? data.sessionId,
    amount: data.amount,
    paymentMethod: data.paymentMethod,
    transactionId: data.transactionId,
  }).then((res) => res.data);
export const getMyPayments = () =>
  api.get('/payments/me').then((res) => {
    const payments = unwrap(res.data) || [];
    return payments.map((payment) => ({
      ...payment,
      paymentDate: payment.paymentDate || payment.createdAt,
      session: payment.appointment
        ? {
            ...payment.appointment,
            therapist: payment.appointment.therapist,
          }
        : null,
      therapist: payment.appointment?.therapist?.user
        ? { ...payment.appointment.therapist.user }
        : null,
    }));
  });
export const getPaymentStats = async () => {
  const payments = await getMyPayments();
  return {
    totalPaid: payments
      .filter((p) => p.status === 'paid' || p.status === 'completed')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    completedPayments: payments.filter((p) => p.status === 'paid' || p.status === 'completed').length,
    pendingPayments: payments.filter((p) => p.status === 'pending').length,
  };
};

// ── CBT Exercises ──────────────────────────────────────────────────────────────
export const getCBTExercises = () =>
  api.get('/cbt/exercises').then((res) => unwrap(res.data) || []);
export const getMyCBTProgress = () =>
  api.get('/cbt/progress/me').then((res) => {
    const progress = unwrap(res.data) || [];
    return {
      data: progress,
      stats: {
        totalCompleted: progress.length,
        totalMinutes: progress.reduce((sum, p) => sum + (p.duration || 0), 0),
        averageScore: progress.length
          ? Number(
              (
                progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.length
              ).toFixed(1),
            )
          : 0,
      },
    };
  });
export const submitCBTProgress = (data) =>
  api.post('/cbt/progress', data).then((res) => res.data);
export const completeCBTExercise = (data) => submitCBTProgress(data);

// ── Exposure Therapy ───────────────────────────────────────────────────────────
export const getMyExposureSessions = () =>
  api.get('/exposure/sessions').then((res) => unwrap(res.data) || []);
export const updateExposureSession = (id, data) =>
  api.patch(`/exposure/${id}`, data).then((res) => res.data);

// ── Progress & Reports ─────────────────────────────────────────────────────────
export const getMyProgress = () =>
  api.get('/progress/timeline').then((res) => {
    const timelineData = unwrap(res.data) || [];
    return { timelineData };
  });
export const getProgressSummary = async () => {
  const timeline = await getMyProgress();
  const items = timeline.timelineData || [];
  if (!items.length) {
    return {
      period: { days: 0 },
      currentStatus: { mood: 0, anxiety: 0, progressLevel: 'same' },
      improvements: { mood: 0, anxiety: 0, overall: 0 },
      averages: { mood: 0, anxiety: 0 },
      consistency: { entriesPerWeek: 0 },
    };
  }

  const latest = items[0];
  const earliest = items[items.length - 1];
  const avgMood = items.reduce((sum, i) => sum + (i.moodScore || 0), 0) / items.length;
  const avgAnxiety = items.reduce((sum, i) => sum + (i.anxietyScore || 0), 0) / items.length;
  const moodImprovement = (latest.moodScore || 0) - (earliest.moodScore || 0);
  const anxietyImprovement = (earliest.anxietyScore || 0) - (latest.anxietyScore || 0);

  return {
    period: { days: items.length },
    currentStatus: {
      mood: latest.moodScore || 0,
      anxiety: latest.anxietyScore || 0,
      progressLevel: latest.progressLevel || 'same',
    },
    improvements: {
      mood: Number(moodImprovement.toFixed(1)),
      anxiety: Number(anxietyImprovement.toFixed(1)),
      overall: Number(((moodImprovement + anxietyImprovement) / 2).toFixed(1)),
    },
    averages: {
      mood: Number(avgMood.toFixed(1)),
      anxiety: Number(avgAnxiety.toFixed(1)),
    },
    consistency: {
      entriesPerWeek: Number(((items.length / 30) * 7).toFixed(1)),
    },
  };
};
export const getMyReports = () =>
  api.get('/reports').then((res) => unwrap(res.data) || []);

// ── Emergency ──────────────────────────────────────────────────────────────────
export const triggerEmergency = (data) =>
  api.post('/emergency/trigger', data).then((res) => res.data);
export const getMyEmergencies = () =>
  api.get('/emergency/logs').then((res) => unwrap(res.data) || []);

// ── Profile ────────────────────────────────────────────────────────────────────
export const getClientProfile = () =>
  api.get('/users/profile').then((res) => unwrap(res.data) || null);
export const updateClientProfile = (data) =>
  api.put('/users/profile', data).then((res) => unwrap(res.data) || null);
export const getMyTherapist = () =>
  api.get('/assignments/my-therapist').then((res) => unwrap(res.data) || null);
export const giveConsent = async (data) => ({
  success: true,
  data,
});

// ── Notifications ──────────────────────────────────────────────────────────────
export const getMyNotifications = () =>
  api.get('/notifications/my').then((res) => res.data);
export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`).then((res) => res.data);
export const markAllNotificationsRead = () =>
  api.patch('/notifications/read-all').then((res) => res.data);

// ── Dashboard Stats ────────────────────────────────────────────────────────────
export const getClientDashboardStats = async () => {
  const [assessmentsRes, moodsRes, sessionsRes] = await Promise.allSettled([
    getMyAssessments(),
    getMoodHistory(),
    getMySessions(),
  ]);

  const assessments = assessmentsRes.status === 'fulfilled' ? assessmentsRes.value : { data: [] };
  const moods = moodsRes.status === 'fulfilled' ? moodsRes.value : [];
  const sessions = sessionsRes.status === 'fulfilled' ? sessionsRes.value : { sessions: [] };

  const assessmentList = assessments?.data ?? [];
  const moodList = Array.isArray(moods) ? moods : moods?.data ?? [];
  const sessionList = sessions?.sessions ?? sessions?.data ?? [];

  const upcomingSessions = sessionList.filter(
    (s) => s.status === 'scheduled' && new Date(s.date) > new Date()
  );

  const avgMood = moodList.length
    ? (moodList.reduce((sum, m) => sum + (m.moodScore || 0), 0) / moodList.length).toFixed(1)
    : 0;

  return {
    stats: {
      totalSessions: sessionList.length,
      upcomingSessions: upcomingSessions.length,
      completedAssessments: assessmentList.length,
      moodEntries: moodList.length,
      averageMood: avgMood,
      nextSession: upcomingSessions[0] || null,
    },
    recentActivity: [
      ...assessmentList.slice(0, 3).map((a) => ({
        type: 'assessment',
        date: a.createdAt,
        description: `Completed ${a.type} assessment — Score: ${a.score}`,
        severity: a.severity,
      })),
      ...moodList.slice(0, 3).map((m) => ({
        type: 'mood',
        date: m.createdAt,
        description: `Logged mood: ${m.moodScore}/10, Anxiety: ${m.anxietyLevel ?? 'N/A'}/10`,
      })),
      ...sessionList.slice(0, 3).map((s) => ({
        type: 'session',
        date: s.date,
        description: `${s.type} session with ${s.therapist?.user?.name ?? 'Therapist'}`,
        status: s.status,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)),
  };
};
