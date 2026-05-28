import api from "./api";

// Get all available therapists with filters
export const getAvailableTherapists = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.specialization) params.append("specialization", filters.specialization);
  if (filters.minExperience) params.append("minExperience", filters.minExperience);
  if (filters.maxRate) params.append("maxRate", filters.maxRate);
  
  const response = await api.get(`/therapists?${params}`);
  const therapists = response.data?.data || [];
  return {
    therapists: therapists.map((therapist) => ({
      ...therapist,
      name: therapist.user?.name || therapist.name,
      email: therapist.user?.email || therapist.email,
      phone: therapist.user?.phone || therapist.phone,
    })),
  };
};

// Get single therapist details
export const getTherapistDetails = async (therapistId) => {
  const response = await api.get(`/therapists/${therapistId}`);
  const therapist = response.data?.data || null;
  if (!therapist) return null;
  return {
    ...therapist,
    name: therapist.user?.name || therapist.name,
    email: therapist.user?.email || therapist.email,
    phone: therapist.user?.phone || therapist.phone,
  };
};

// Request to book a therapist (creates a BookingRequest)
export const requestTherapistBooking = async (data) => {
  const response = await api.post("/booking", data);
  return response.data;
};

// Get all specializations
export const getSpecializations = async () => {
  const response = await api.get("/therapists/specializations");
  return { specializations: response.data?.data || [] };
};