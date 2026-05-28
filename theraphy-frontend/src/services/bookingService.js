import api from "./api";

const normalizeBookingStatus = (status) => {
  if (status === "pending_admin_approval" || status === "pending_payment" || status === "pending") {
    return "pending";
  }
  if (status === "approved" || status === "scheduled") {
    return "approved";
  }
  if (status === "rejected") {
    return "rejected";
  }
  return status || "pending";
};

const extractRows = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

// ── Client ─────────────────────────────────────────────────────────────────────

/** POST /booking — client creates a booking request */
export const createBookingRequest = (data) =>
  api.post("/booking", data).then((res) => res.data);

/** GET /booking/my — client's own booking requests */
export const getMyBookingRequests = () =>
  api.get("/booking/my").then((res) => res.data);

/** PATCH /booking/:id/cancel — client cancels a request */
export const cancelBookingRequest = (requestId) =>
  api.patch(`/booking/${requestId}/cancel`).then((res) => res.data);

// ── Admin ──────────────────────────────────────────────────────────────────────

/**
 * GET /admin/bookings?status=...
 */
export const getAllBookingRequests = (status = "all") => {
  return api
    .get("/admin/bookings")
    .then((res) => {
      const payload = res.data ?? {};
      const rows = extractRows(payload);

      if (status === "all") {
        return {
          ...payload,
          data: rows,
        };
      }

      const filtered = rows.filter((item) => normalizeBookingStatus(item.status) === status);
      return {
        ...payload,
        data: filtered,
      };
    })
    .catch((error) => {
      // Backward-compatible fallback for older deployed backend versions
      if (error?.response?.status === 404) {
        const legacyUrl = "/booking";
        return api.get(legacyUrl).then((res) => {
          const payload = res.data ?? {};
          const rows = extractRows(payload);

          if (status === "all") {
            return {
              ...payload,
              data: rows,
            };
          }

          const filtered = rows.filter((item) => normalizeBookingStatus(item.status) === status);
          return {
            ...payload,
            data: filtered,
          };
        });
      }
      throw error;
    });
};

/** PUT /admin/bookings/:id/approve — admin approves */
export const approveBookingRequest = (requestId, adminNotes) =>
  api
    .put(`/admin/bookings/${requestId}/approve`, { adminNotes })
    .then((res) => res.data)
    .catch((error) => {
      if (error?.response?.status === 404) {
        return api.patch(`/booking/${requestId}/approve`, { adminNotes }).then((res) => res.data);
      }
      throw error;
    });

/** PUT /admin/bookings/:id/reject — admin rejects */
export const rejectBookingRequest = (requestId, rejectionReason) =>
  api
    .put(`/admin/bookings/${requestId}/reject`, { rejectionReason })
    .then((res) => res.data)
    .catch((error) => {
      if (error?.response?.status === 404) {
        return api.patch(`/booking/${requestId}/reject`, { rejectionReason }).then((res) => res.data);
      }
      throw error;
    });
