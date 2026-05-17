import api from "./api";

// Get all available therapists with filters
export const getAvailableTherapists = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.specialization) params.append("specialization", filters.specialization);
  if (filters.minExperience) params.append("minExperience", filters.minExperience);
  if (filters.maxRate) params.append("maxRate", filters.maxRate);
  
  const response = await api.get(`/therapists/available?${params}`);
  return response.data;
};

// Get single therapist details
export const getTherapistDetails = async (therapistId) => {
  const response = await api.get(`/therapists/${therapistId}`);
  return response.data;
};

// Request to book a therapist
export const requestTherapistBooking = async (data) => {
  const response = await api.post("/therapists/book", data);
  return response.data;
};

// Get all specializations
export const getSpecializations = async () => {
  const response = await api.get("/therapists/specializations");
  return response.data;
};