import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, MessageCircle, Calendar, User, Mail, Phone, Clock, X } from 'lucide-react';
import {
  getAllBookingRequests,
  approveBookingRequest,
  rejectBookingRequest,
} from '../../services/bookingService';
import toast from 'react-hot-toast';
import './BookingRequests.css';

const BookingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getAllBookingRequests(filter);
      const rows = response?.data ?? response ?? [];
      const mappedRequests = rows.map(req => ({
        ...req,
        client: req.patient?.user || {},
        therapist: req.therapist?.user || {},
        preferredDate: req.date,
        message: req.notes || '',
      }));
      setRequests(mappedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (requestId) => {
    const req = requests.find(r => r.id === requestId);
    if (req) {
      setSelectedRequest(req);
      setShowModal(true);
    } else {
      toast.error('Request not found');
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this booking request? The therapist will be assigned to the client.')) {
      return;
    }
    
    setProcessingId(requestId);
    try {
      const response = await approveBookingRequest(requestId, adminNotes);
      if (response.success) {
        toast.success('Booking request approved! Therapist assigned successfully.');
        setShowModal(false);
        setAdminNotes('');
        fetchRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    setProcessingId(requestId);
    try {
      const response = await rejectBookingRequest(requestId, rejectionReason);
      if (response.success) {
        toast.success('Booking request rejected');
        setShowRejectModal(false);
        setRejectionReason('');
        fetchRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge pending">⏳ Pending</span>;
      case 'approved':
        return <span className="status-badge approved">✅ Approved</span>;
      case 'rejected':
        return <span className="status-badge rejected">❌ Rejected</span>;
      case 'cancelled':
        return <span className="status-badge cancelled">🚫 Cancelled</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="booking-requests-page">
      <div className="page-header">
        <h1>Booking Requests</h1>
        <p>Review and manage client therapist requests</p>
        {pendingCount > 0 && (
          <div className="pending-alert">
            <span className="pending-count">{pendingCount}</span>
            <span>pending request{pendingCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
          {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
        </button>
        <button
          className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button
          className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="no-requests">
          <div className="no-requests-icon">📋</div>
          <h3>No booking requests</h3>
          <p>When clients request therapists, they will appear here</p>
        </div>
      ) : (
        <div className="requests-grid">
          {requests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <div className="client-info">
                  <div className="client-avatar">
                    {request.client?.name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h4>{request.client?.name}</h4>
                    <p className="client-email">{request.client?.email}</p>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="request-details">
                <div className="detail-row">
                  <User size={16} />
                  <span>Therapist: {request.therapist?.name}</span>
                </div>
                <div className="detail-row">
                  <Mail size={16} />
                  <span>{request.therapist?.email}</span>
                </div>
                <div className="detail-row">
                  <Calendar size={16} />
                  <span>
                    Preferred: {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
                {request.message && (
                  <div className="detail-row message">
                    <MessageCircle size={16} />
                    <span className="message-text">"{request.message}"</span>
                  </div>
                )}
              </div>

              <div className="request-footer">
                <span className="request-date">
                  Requested: {new Date(request.createdAt).toLocaleDateString()}
                </span>
                <div className="request-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => handleViewDetails(request.id)}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  {request.status === 'pending' && (
                    <>
                      <button
                        className="action-btn approve-btn"
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                      >
                        <CheckCircle size={16} />
                        {processingId === request.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        className="action-btn reject-btn"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectModal(true);
                        }}
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Details Modal - NO APPROVE/REJECT BUTTONS HERE */}
      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="details-section">
                <h3>Client Information</h3>
                <div className="info-row">
                  <span className="label">Name:</span>
                  <span>{selectedRequest.client?.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span>{selectedRequest.client?.email}</span>
                </div>
                {selectedRequest.client?.phone && (
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span>{selectedRequest.client?.phone}</span>
                  </div>
                )}
                {selectedRequest.client?.age && (
                  <div className="info-row">
                    <span className="label">Age:</span>
                    <span>{selectedRequest.client?.age}</span>
                  </div>
                )}
                {selectedRequest.client?.primaryPhobia && (
                  <div className="info-row">
                    <span className="label">Primary Phobia:</span>
                    <span>{selectedRequest.client?.primaryPhobia}</span>
                  </div>
                )}
              </div>

              <div className="details-section">
                <h3>Therapist Information</h3>
                <div className="info-row">
                  <span className="label">Name:</span>
                  <span>{selectedRequest.therapist?.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span>{selectedRequest.therapist?.email}</span>
                </div>
                {selectedRequest.therapist?.specialization && (
                  <div className="info-row">
                    <span className="label">Specialization:</span>
                    <span>{selectedRequest.therapist?.specialization}</span>
                  </div>
                )}
                {selectedRequest.therapist?.yearsOfExperience && (
                  <div className="info-row">
                    <span className="label">Experience:</span>
                    <span>{selectedRequest.therapist?.yearsOfExperience} years</span>
                  </div>
                )}
                {selectedRequest.therapist?.hourlyRate && (
                  <div className="info-row">
                    <span className="label">Hourly Rate:</span>
                    <span>${selectedRequest.therapist?.hourlyRate}</span>
                  </div>
                )}
              </div>

              <div className="details-section">
                <h3>Request Details</h3>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className={`status-badge ${selectedRequest.status}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                {selectedRequest.preferredDate && (
                  <div className="info-row">
                    <span className="label">Preferred Date:</span>
                    <span>{new Date(selectedRequest.preferredDate).toLocaleString()}</span>
                  </div>
                )}
                {selectedRequest.message && (
                  <div className="info-row">
                    <span className="label">Client Message:</span>
                    <span className="message-text">{selectedRequest.message}</span>
                  </div>
                )}
                {selectedRequest.adminNotes && (
                  <div className="info-row">
                    <span className="label">Admin Notes:</span>
                    <span>{selectedRequest.adminNotes}</span>
                  </div>
                )}
                {selectedRequest.rejectionReason && (
                  <div className="info-row">
                    <span className="label">Rejection Reason:</span>
                    <span className="rejection-text">{selectedRequest.rejectionReason}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">Requested On:</span>
                  <span>{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                </div>
                {selectedRequest.reviewedAt && (
                  <div className="info-row">
                    <span className="label">Reviewed On:</span>
                    <span>{new Date(selectedRequest.reviewedAt).toLocaleString()}</span>
                  </div>
                )}
                {selectedRequest.reviewedBy && (
                  <div className="info-row">
                    <span className="label">Reviewed By:</span>
                    <span>{selectedRequest.reviewedBy?.name}</span>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Booking Request</h2>
              <button className="close-btn" onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="reject-info">
                <p><strong>Client:</strong> {selectedRequest.client?.name}</p>
                <p><strong>Therapist:</strong> {selectedRequest.therapist?.name}</p>
              </div>
              <div className="form-group">
                <label>Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows="3"
                  required
                />
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-reject" 
                  onClick={() => handleReject(selectedRequest.id)}
                  disabled={processingId === selectedRequest.id}
                >
                  {processingId === selectedRequest.id ? 'Rejecting...' : 'Reject Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingRequests;
