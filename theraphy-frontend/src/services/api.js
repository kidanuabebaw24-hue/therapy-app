import axios from "axios";
import * as mockData from "./mockData";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";


const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Mock Interceptor
if (USE_MOCK) {
  api.interceptors.request.use(async (config) => {
    console.log(`[Mock API] Request: ${config.method.toUpperCase()} ${config.url}`);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Handle Mock Routes
    let data = { message: "Mock Success" };
    let status = 200;

    if (config.url.includes("/auth/login") || config.url.includes("/auth/register")) {
      data = { user: mockData.mockUser, token: "mock_token_123" };
    } else if (config.url.includes("/auth/profile")) {
      data = { user: mockData.mockUser };
    } else if (config.url.includes("/users/therapists") || config.url.includes("/assignments/available-therapists")) {
      data = mockData.mockTherapists;
    } else if (config.url.includes("/assessments/questions")) {
      data = mockData.mockAssessmentQuestions;
    } else if (config.url.includes("/moods")) {
      data = config.method === "get" ? mockData.mockMoods : { ...config.data, id: Date.now() };
    }

    // Short-circuit the request by throwing a "mock" response object that we catch in the response interceptor
    // or just return a dummy adapter response. A cleaner way with Axios is to use an adapter.
    config.adapter = () => {
      return Promise.resolve({
        data,
        status,
        statusText: "OK",
        headers: config.headers,
        config,
      });
    };

    return config;
  });
}

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle response errors
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

// Admin endpoints
export const getSystemStats = () =>
  api.get("/admin/stats").then((res) => res.data);
export const getAllUsers = (params) =>
  api.get("/admin/users", { params }).then((res) => res.data);
export const verifyTherapist = (therapistId) =>
  api.put(`/admin/verify-therapist/${therapistId}`).then((res) => res.data);
export const getSystemAnalytics = () =>
  api.get("/admin/analytics").then((res) => res.data);
export const getSystemLogs = () =>
  api.get("/system/logs").then((res) => res.data);

// Assessment endpoints
export const getAssessmentQuestions = (params) =>
  api.get("/assessments/questions", { params }).then((res) => res.data);

export const createAssessmentQuestion = (data) =>
  api.post("/assessments/questions", data).then((res) => res.data);

// Get question by ID
export const getAssessmentQuestionById = (id) => {
  console.log("Fetching question by ID:", id);
  return api.get(`/assessments/questions/${id}`).then((res) => {
    console.log("Question fetched:", res.data);
    return res.data;
  });
};

// Update question
export const updateAssessmentQuestion = (id, data) => {
  console.log("Updating question:", id, data);
  return api.put(`/assessments/questions/${id}`, data).then((res) => {
    console.log("Update response:", res.data);
    return res.data;
  });
};

// Delete question
export const deleteAssessmentQuestion = (id) => {
  console.log("Deleting question:", id);
  return api.delete(`/assessments/questions/${id}`).then((res) => {
    console.log("Delete response:", res.data);
    return res.data;
  });
};

// Emergency endpoints
export const getEmergencyLogs = (params) =>
  api.get("/emergency", { params }).then((res) => res.data);
export const handleEmergency = (id, data) =>
  api.put(`/emergency/${id}/handle`, data).then((res) => res.data);

export const getClients = () =>
  api.get("/users/clients").then((res) => res.data);
export const getTherapists = () =>
  api.get("/users/therapists").then((res) => res.data);
export const getAllAssignments = async () => {
  try {
    const response = await api.get("/assignments/all");
    //console.log("the response is" , response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching all assignments:", error);
    throw error;
  }
};
// Get therapist's assigned clients
export const getMyTherapist = () =>
  api.get("/assignments/my-therapist").then((res) => res.data);
export const getAvailableTherapists = () =>
  api.get("/assignments/available-therapists").then((res) => res.data);
// Assign therapist
export const assignTherapist = (data) =>
  api.post("/assignments", data).then((res) => res.data);

// End assignment
export const endAssignment = (assignmentId) =>
  api.put(`/assignments/${assignmentId}/end`).then((res) => res.data);
export default api;
// Add this temporarily to test
export const testApi = () => {
  //console.log('API is working');
  return Promise.resolve({ data: { users: [] } });
};
