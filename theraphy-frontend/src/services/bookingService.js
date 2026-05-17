import api from "./api";

// Client: Create a booking request
export const createBookingRequest = async (data) => {
  const response = await api.post("/booking-requests", data);
  return response.data;
};

// Client: Get my booking requests
export const getMyBookingRequests = async () => {
  const response = await api.get("/booking-requests/my");
  return response.data;
};

// Client: Cancel booking request
export const cancelBookingRequest = async (requestId) => {
  const response = await api.put(`/booking-requests/${requestId}/cancel`);
  return response.data;
};

// Admin: Get all booking requests
export const getAllBookingRequests = async (status = "all") => {
  const response = await api.get(`/booking-requests/admin/all?status=${status}`);
  return response.data;
};

// Admin: Get booking request by ID
export const getBookingRequestById = async (requestId) => {
  const response = await api.get(`/booking-requests/admin/${requestId}`);
  return response.data;
};

// Admin: Approve booking request
export const approveBookingRequest = async (requestId, adminNotes) => {
  const response = await api.put(`/booking-requests/admin/${requestId}/approve`, { adminNotes });
  return response.data;
};

// Admin: Reject booking request
export const rejectBookingRequest = async (requestId, rejectionReason) => {
  const response = await api.put(`/booking-requests/admin/${requestId}/reject`, { rejectionReason });
  return response.data;
};