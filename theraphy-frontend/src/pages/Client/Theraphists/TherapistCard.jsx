import React from 'react';
import { Award, Clock, Users } from 'lucide-react';
import './Therapists.css';

const TherapistCard = ({ therapist, onViewDetails }) => {
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
    <div className="therapist-card">
      <div className="card-avatar">
        <span className="avatar-initial">
          {therapist.name?.charAt(0).toUpperCase() || 'T'}
        </span>
      </div>
      
      <div className="card-info">
        <h3 className="therapist-name">{therapist.name}</h3>
        <div className="specialization-badge">{therapist.specialization || 'General Therapist'}</div>
        
        <div className="stats-row">
          <div className="stat">
            <Award size={16} />
            <span>{therapist.yearsOfExperience || 0} years exp</span>
          </div>
          <div className="stat">
            <Users size={16} />
            <span>{therapist.activeClients || 0} clients</span>
          </div>
          <div className="stat">
            <Clock size={16} />
            <span>{therapist.totalSessions || 0} sessions</span>
          </div>
        </div>
        
        {therapist.hourlyRate && (
          <div className="rate-info">
            <span className="rate">${rateWith25Percent}</span>
            <span className="rate-period">/ session</span>
          </div>
        )}
        
        <button className="view-details-btn" onClick={onViewDetails}>
          View Profile
        </button>
      </div>
    </div>
  );
};

export default TherapistCard;