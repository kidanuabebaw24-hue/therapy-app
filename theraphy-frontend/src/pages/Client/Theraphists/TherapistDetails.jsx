import React, { useState } from 'react';
import { X, Star, Award, Clock, Users, Mail, Phone } from 'lucide-react';
import { createBookingRequest } from "../../../services/bookingService";
import toast from 'react-hot-toast';
import './Therapists.css';

const TherapistDetails = ({ therapist, onClose }) => {
  const [preferredDate, setPreferredDate] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  const handleRequestBooking = async () => {
    if (!preferredDate) {
      toast.error('Please select a preferred date');
      return;
    }

    setIsRequesting(true);
    try {
      const response = await createBookingRequest({
        therapistId: therapist.id,
        message: requestMessage,
        preferredDate: preferredDate
      });

      if (response.success) {
        toast.success('Booking request sent! Admin will review it shortly.');
        onClose();
      }
    } catch (error) {
      console.error('Error requesting booking:', error);
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setIsRequesting(false);
    }
  };

  // Calculate 25% added to hourly rate
  const calculateRateWith25Percent = (rate) => {
    if (!rate) return null;
    const addedAmount = rate * 0.25;
    const total = rate + addedAmount;
    return total.toFixed(2);
  };

  const originalRate = therapist.hourlyRate;
  const rateWith25Percent = calculateRateWith25Percent(originalRate);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="therapist-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <div className="therapist-avatar-large">
            <span>{therapist.name?.charAt(0).toUpperCase() || 'T'}</span>
          </div>
          <div className="therapist-title">
            <h2>{therapist.name}</h2>
            <span className="specialization-tag">{therapist.specialization || 'General Therapist'}</span>
          </div>
        </div>

        <div className="modal-body">
          {/* Stats Section */}
          <div className="details-stats">
            <div className="detail-stat">
            </div>
            <div className="detail-stat">
              <Award size={20} />
              <div>
                <strong>{therapist.yearsOfExperience || 0} yrs</strong>
                <span>Experience</span>
              </div>
            </div>
            <div className="detail-stat">
              <Users size={20} />
              <div>
                <strong>{therapist.activeClients || 0}</strong>
                <span>Active Clients</span>
              </div>
            </div>
            <div className="detail-stat">
              <Clock size={20} />
              <div>
                <strong>{therapist.totalSessions || 0}</strong>
                <span>Total Sessions</span>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="info-section">
            <h3>Professional Information</h3>
            <div className="info-grid">
              {therapist.licenseNumber && (
                <div className="info-item">
                  <span className="label">License Number:</span>
                  <span>{therapist.licenseNumber}</span>
                </div>
              )}
              {therapist.yearsOfExperience && (
                <div className="info-item">
                  <span className="label">Years of Experience:</span>
                  <span>{therapist.yearsOfExperience}</span>
                </div>
              )}
              {therapist.hourlyRate && (
                <div className="info-item">
                  <span className="label">Session Rate:</span>
                  <span className="rate-final">${rateWith25Percent} / session</span>
                </div>
              )}
              {therapist.specialization && (
                <div className="info-item">
                  <span className="label">Specialization:</span>
                  <span>{therapist.specialization}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="info-section">
            <h3>Contact Information</h3>
            <div className="contact-info">
              <div className="contact-item">
                <Mail size={18} />
                <span>{therapist.email}</span>
              </div>
              {therapist.phone && (
                <div className="contact-item">
                  <Phone size={18} />
                  <span>{therapist.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Request Form */}
          <div className="info-section booking-section">
            <h3>Request to Book This Therapist</h3>
            <div className="booking-form">
              <div className="form-group">
                <label>Preferred Date *</label>
                <input
                  type="datetime-local"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="booking-input"
                />
              </div>
              <div className="form-group">
                <label>Message (Optional)</label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Tell us why you'd like to work with this therapist..."
                  className="booking-textarea"
                  rows="3"
                />
              </div>
              <button 
                className="request-booking-btn"
                onClick={handleRequestBooking}
                disabled={isRequesting || !preferredDate}
              >
                {isRequesting ? 'Sending Request...' : 'Request This Therapist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistDetails;
