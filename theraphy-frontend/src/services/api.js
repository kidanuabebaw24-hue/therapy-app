import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://theraphy-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ── Admin ──────────────────────────────────────────────────────────────────────
/** Unwrap { success, data } — supports data as array or data[key] as array. */
const unwrapList = (body, key = "users") => {
  const payload = body?.data ?? body;
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload[key])) return payload[key];
  if (Array.isArray(body?.[key])) return body[key];
  return [];
};

export const getSystemStats = () =>
  api.get("/admin/stats").then((res) => res.data);
export const getAllUsers = (params) =>
  api
    .get("/admin/users", { params })
    .then((res) => unwrapList(res.data, "users"));
export const verifyTherapist = ({ therapistId, userId }) => {
  const id = therapistId || userId;
  if (!id) return Promise.reject(new Error("Missing therapist or user id"));
  return api
    .patch(`/admin/verify-therapist/${id}`)
    .then((res) => res.data?.data ?? res.data);
};
export const getSystemAnalytics = () =>
  api.get("/admin/analytics").then((res) => res.data);

// ── Assessments ────────────────────────────────────────────────────────────────
export const getAssessmentQuestions = (params) =>
  api.get("/assessments/questions", { params }).then((res) => res.data);
export const createAssessmentQuestion = (data) =>
  api.post("/assessments/questions", data).then((res) => res.data);
export const getAssessmentQuestionById = (id) =>
  api.get(`/assessments/questions/${id}`).then((res) => res.data);
export const updateAssessmentQuestion = (id, data) =>
  api.put(`/assessments/questions/${id}`, data).then((res) => res.data);
export const deleteAssessmentQuestion = (id) =>
  api.delete(`/assessments/questions/${id}`).then((res) => res.data);

// ── Emergency ──────────────────────────────────────────────────────────────────
export const getEmergencyLogs = (params) =>
  api.get("/emergency/logs", { params }).then((res) => res.data);
export const handleEmergency = (id, data) =>
  api.put(`/emergency/${id}/handle`, data).then((res) => res.data);

// ── Users / Assignments ────────────────────────────────────────────────────────
const normalizeClientRow = (row) => {
  const user = row?.user || {};
  return {
    ...row,
    id: row?.id,
    name: row?.name || user.name || 'Client',
    email: row?.email || user.email || '',
    phone: row?.phone || user.phone || null,
  };
};

const normalizeTherapistRow = (row) => {
  const user = row?.user || {};
  return {
    ...row,
    id: row?.id,
    name: row?.name || user.name || 'Therapist',
    email: row?.email || user.email || '',
    phone: row?.phone || user.phone || null,
  };
};

export const getClients = () =>
  api.get('/users/clients').then((res) => {
    const raw = unwrap(res.data);
    const list = Array.isArray(raw) ? raw : raw?.clients ?? [];
    return list.map(normalizeClientRow);
  });

export const getTherapists = () =>
  api.get('/therapists').then((res) => {
    const raw = unwrap(res.data);
    const list = Array.isArray(raw) ? raw : raw?.therapists ?? [];
    return list.map(normalizeTherapistRow);
  });

export const getAllAssignments = () =>
  api.get('/assignments').then((res) => {
    const payload = unwrap(res.data);
    const assignments = payload?.assignments ?? (Array.isArray(payload) ? payload : []);
    return { assignments };
  });

export const getMyTherapist = () =>
  api.get('/assignments/my-therapist').then((res) => unwrap(res.data));

export const getAvailableTherapists = () =>
  api.get('/assignments/available-therapists').then((res) => unwrap(res.data));

export const assignTherapist = (data) =>
  api.post('/assignments/assign', data).then((res) => ({
    ...unwrap(res.data),
    message: res.data?.message || 'Therapist assigned',
  }));

export const endAssignment = (assignmentId) =>
  api.put(`/assignments/${assignmentId}/end`).then((res) => ({
    ...unwrap(res.data),
    message: res.data?.message || 'Assignment ended',
  }));

export default api;
