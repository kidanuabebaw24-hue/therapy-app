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
export const getSystemStats = () =>
  api.get("/admin/stats").then((res) => res.data);
export const getAllUsers = (params) =>
  api.get("/admin/users", { params }).then((res) => res.data);
export const verifyTherapist = (therapistId) =>
  api.patch(`/admin/verify-therapist/${therapistId}`).then((res) => res.data);
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
export const getClients = () =>
  api.get("/users/clients").then((res) => res.data);
export const getTherapists = () =>
  api.get("/therapists").then((res) => res.data);
export const getAllAssignments = () =>
  api.get("/assignments").then((res) => res.data);
export const getMyTherapist = () =>
  api.get("/assignments/my-therapist").then((res) => res.data);
export const getAvailableTherapists = () =>
  api.get("/assignments/available-therapists").then((res) => res.data);
export const assignTherapist = (data) =>
  api.post("/assignments", data).then((res) => res.data);
export const endAssignment = (assignmentId) =>
  api.put(`/assignments/${assignmentId}/end`).then((res) => res.data);

export default api;
