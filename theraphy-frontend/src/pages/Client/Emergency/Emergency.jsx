import { useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Send,
  Shield,
  MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../components/Common/Modal';
import { triggerEmergency, getMyEmergencies } from '../../../services/clientApi';
import './Emergency.css';

const Emergency = () => {
 // const navigate = useNavigate();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({
    message: '',
    severity: 'medium'
  });

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      const data = await getMyEmergencies();
      setEmergencies(data.emergencies || []);
    } catch (error) {
      console.log(error)
      toast.error('Failed to fetch emergency history');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerEmergency = async () => {
    if (!emergencyForm.message) {
      toast.error('Please describe your emergency');
      return;
    }

    try {
      await triggerEmergency(emergencyForm);
      toast.success('Emergency alert sent. Help is on the way!');
      setShowEmergencyModal(false);
      setEmergencyForm({ message: '', severity: 'medium' });
      fetchEmergencies();
    } catch (error) {
      console.log(error)
      toast.error('Failed to send emergency alert');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#7F1D1D';
      default: return '#6B7280';
    }
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      low: 'severity-low',
      medium: 'severity-medium',
      high: 'severity-high',
      critical: 'severity-critical'
    };
    return badges[severity] || 'severity-unknown';
  };

{/**  const hotlines = [
    { name: 'National Suicide Prevention Lifeline', number: '988', hours: '24/7' },
    { name: 'Crisis Text Line', number: '741741', hours: '24/7' },
    { name: 'SAMHSA Helpline', number: '1-800-662-4357', hours: '24/7' }
  ]; */}

  return (
    <div className="emergency-page">
      <div className="emergency-header">
        <AlertTriangle size={48} color="#EF4444" />
        <h1 className="page-title">Emergency Support</h1>
        <p className="page-subtitle">Immediate help when you need it most</p>
      </div>

      <div className="emergency-actions">
        <button
          className="emergency-button"
          onClick={() => setShowEmergencyModal(true)}
        >
          <AlertTriangle size={32} />
          <span>Trigger Emergency Alert</span>
          <small>Your therapist will be notified immediately</small>
        </button>
      </div>

{/**      <div className="hotlines-section">
        <h3>
          <Phone size={20} />
          Crisis Hotlines
        </h3>
        <div className="hotlines-grid">
          {hotlines.map((hotline, index) => (
            <div key={index} className="hotline-card">
              <strong>{hotline.name}</strong>
              <a href={`tel:${hotline.number}`} className="hotline-number">
                <Phone size={16} />
                {hotline.number}
              </a>
              <span className="hotline-hours">
                <Clock size={14} />
                {hotline.hours}
              </span>
            </div>
          ))}
        </div>
      </div> */}

      <div className="safety-plan">
        <h3>
          <Shield size={20} />
          Your Safety Plan
        </h3>
        <div className="safety-steps">
          <div className="safety-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <strong>Stay in a safe environment</strong>
              <p>Remove yourself from any harmful situations or triggers</p>
            </div>
          </div>
          <div className="safety-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <strong>Reach out to your support system</strong>
              <p>Contact a trusted friend, family member, or your therapist</p>
            </div>
          </div>
          <div className="safety-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <strong>Use coping strategies</strong>
              <p>Practice grounding techniques, deep breathing, or mindfulness</p>
            </div>
          </div>
          <div className="safety-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <strong>Call emergency services if needed</strong>
              <p>If you're in immediate danger, call 911</p>
            </div>
          </div>
        </div>
      </div>

      <div className="emergency-history">
        <h3>
          <Clock size={20} />
          Previous Emergencies
        </h3>
        <div className="history-list">
          {emergencies.length > 0 ? (
            emergencies.map((emergency, index) => (
              <div key={index} className="history-item">
                <div className="history-icon">
                  {emergency.handled ? (
                    <CheckCircle size={20} color="#10B981" />
                  ) : (
                    <AlertTriangle size={20} color="#F59E0B" />
                  )}
                </div>
                <div className="history-content">
                  <div className="history-header">
                    <span className={`severity-badge ${getSeverityBadge(emergency.severity)}`}>
                      {emergency.severity}
                    </span>
                    <span className="history-date">
                      {new Date(emergency.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="history-message">{emergency.message}</p>
                  {emergency.handled && (
                    <div className="history-resolution">
                      <strong>Resolved by:</strong> {emergency.handledBy?.name}
                      {emergency.notes && <p className="resolution-notes">{emergency.notes}</p>}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-history">No emergency history</p>
          )}
        </div>
      </div>

      {/* Emergency Modal */}
      <Modal
        isOpen={showEmergencyModal}
        onClose={() => {
          setShowEmergencyModal(false);
          setEmergencyForm({ message: '', severity: 'medium' });
        }}
        title="Trigger Emergency Alert"
        size="lg"
      >
        <div className="emergency-modal">
          <div className="modal-warning">
            <AlertTriangle size={32} color="#EF4444" />
            <p>This will immediately notify your therapist and emergency contacts.</p>
          </div>

          <div className="form-group">
            <label>Severity Level</label>
            <div className="severity-selector">
              <button
                className={`severity-option ${emergencyForm.severity === 'low' ? 'selected' : ''}`}
                onClick={() => setEmergencyForm({...emergencyForm, severity: 'low'})}
              >
                <span className="dot low" />
                Low
              </button>
              <button
                className={`severity-option ${emergencyForm.severity === 'medium' ? 'selected' : ''}`}
                onClick={() => setEmergencyForm({...emergencyForm, severity: 'medium'})}
              >
                <span className="dot medium" />
                Medium
              </button>
              <button
                className={`severity-option ${emergencyForm.severity === 'high' ? 'selected' : ''}`}
                onClick={() => setEmergencyForm({...emergencyForm, severity: 'high'})}
              >
                <span className="dot high" />
                High
              </button>
              <button
                className={`severity-option ${emergencyForm.severity === 'critical' ? 'selected' : ''}`}
                onClick={() => setEmergencyForm({...emergencyForm, severity: 'critical'})}
              >
                <span className="dot critical" />
                Critical
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Describe your emergency *</label>
            <textarea
              rows={4}
              value={emergencyForm.message}
              onChange={(e) => setEmergencyForm({...emergencyForm, message: e.target.value})}
              placeholder="Please describe what's happening..."
              className="form-input"
              required
            />
          </div>

          <div className="emergency-contacts">
            <h4>Your emergency contacts will be notified:</h4>
            <div className="contact-item">
              <Phone size={16} />
              <span>Emergency Contact: +1 (555) 123-4567</span>
            </div>
            <div className="contact-item">
              <Mail size={16} />
              <span>Therapist: Dr. Sarah Johnson</span>
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowEmergencyModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={handleTriggerEmergency}
            >
              <AlertTriangle size={18} />
              Send Emergency Alert
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Emergency;