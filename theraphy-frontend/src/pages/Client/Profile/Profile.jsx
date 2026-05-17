import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  AlertCircle,
  Edit,
  Save,
  X,
  ChevronRight,
  FileText,
  Shield,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../components/Common/Modal';
import { getClientProfile, updateClientProfile, getMyTherapist, giveConsent } from '../../../services/clientApi';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentForm, setConsentForm] = useState({
    consentType: '',
    accepted: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileData, therapistData] = await Promise.all([
        getClientProfile(),
        getMyTherapist().catch(() => null)
      ]);
      setProfile(profileData);
      setEditedProfile(profileData);
      setTherapist(therapistData);
    } catch (error) {
       console.log(error)
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateClientProfile(editedProfile);
      setProfile(editedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
       console.log(error)
      toast.error('Failed to update profile');
    }
  };

  const handleGiveConsent = async () => {
    try {
      await giveConsent({
        consentType: consentForm.consentType,
        accepted: true,
        version: '1.0'
      });
      toast.success('Consent recorded successfully');
      setShowConsentModal(false);
      setConsentForm({ consentType: '', accepted: false });
    } catch (error) {
       console.log(error)
      toast.error('Failed to record consent');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="client-profile">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information</p>
        </div>
        {!isEditing ? (
          <button
            className="btn-primary"
            onClick={() => setIsEditing(true)}
          >
            <Edit size={18} />
            Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                setIsEditing(false);
                setEditedProfile(profile);
              }}
            >
              <X size={18} />
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSaveProfile}
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="profile-grid">
        <div className="profile-card main-info">
          <div className="profile-avatar-large">
            {profile?.name?.charAt(0) || 'C'}
          </div>
          <h2>{profile?.name}</h2>
          <p className="profile-email">{profile?.email}</p>
          <div className="profile-meta">
            <span className="member-since">
              Member since {new Date(profile?.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="profile-card">
          <h3>Personal Information</h3>
          <div className="info-list">
            <div className="info-item">
              <User size={18} />
              <div>
                <span className="label">Full Name</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                    className="edit-input"
                  />
                ) : (
                  <span className="value">{profile?.name}</span>
                )}
              </div>
            </div>

            <div className="info-item">
              <Mail size={18} />
              <div>
                <span className="label">Email</span>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                    className="edit-input"
                  />
                ) : (
                  <span className="value">{profile?.email}</span>
                )}
              </div>
            </div>

            <div className="info-item">
              <Phone size={18} />
              <div>
                <span className="label">Phone</span>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                    className="edit-input"
                  />
                ) : (
                  <span className="value">{profile?.phone || 'Not provided'}</span>
                )}
              </div>
            </div>

            <div className="info-item">
              <Calendar size={18} />
              <div>
                <span className="label">Age</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedProfile.age || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, age: e.target.value})}
                    className="edit-input"
                  />
                ) : (
                  <span className="value">{profile?.age || 'Not provided'}</span>
                )}
              </div>
            </div>

            <div className="info-item">
              <Heart size={18} />
              <div>
                <span className="label">Gender</span>
                {isEditing ? (
                  <select
                    value={editedProfile.gender || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, gender: e.target.value})}
                    className="edit-select"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not">Prefer not to say</option>
                  </select>
                ) : (
                  <span className="value">{profile?.gender || 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>Clinical Information</h3>
          <div className="info-list">
            <div className="info-item">
              <AlertCircle size={18} />
              <div>
                <span className="label">Primary Phobia/Anxiety</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.primaryPhobia || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, primaryPhobia: e.target.value})}
                    className="edit-input"
                    placeholder="e.g., Social anxiety"
                  />
                ) : (
                  <span className="value">{profile?.primaryPhobia || 'Not specified'}</span>
                )}
              </div>
            </div>

            <div className="info-item">
              <Activity size={18} />
              <div>
                <span className="label">Current Anxiety Level</span>
                {isEditing ? (
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={editedProfile.currentAnxietyLevel || 5}
                    onChange={(e) => setEditedProfile({...editedProfile, currentAnxietyLevel: parseInt(e.target.value)})}
                    className="slider"
                  />
                ) : (
                  <span className="value">{profile?.currentAnxietyLevel || 0}/10</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>Emergency Contact</h3>
          <div className="info-list">
            <div className="info-item">
              <User size={18} />
              <div>
                <span className="label">Contact Name</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.emergencyContact?.name || ''}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      emergencyContact: { ...editedProfile.emergencyContact, name: e.target.value }
                    })}
                    className="edit-input"
                  />
                ) : (
                  <span className="value">{profile?.emergencyContact?.name || 'Not provided'}</span>
                )}
              </div>
            </div>

            <div className="info-item">
              <Phone size={18} />
              <div>
                <span className="label">Contact Phone</span>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.emergencyContact?.phone || ''}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      emergencyContact: { ...editedProfile.emergencyContact, phone: e.target.value }
                    })}
                    className="edit-input"
                  />
                ) : (
                  <span className="value">{profile?.emergencyContact?.phone || 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {therapist && therapist.hasTherapist && (
          <div className="profile-card therapist-info">
            <h3>Your Therapist</h3>
            <div className="therapist-details">
              <div className="therapist-avatar">
                {therapist.therapist?.name?.charAt(0) || 'T'}
              </div>
              <div>
                <strong>{therapist.therapist?.name}</strong>
                <p>{therapist.therapist?.specialization}</p>
                <p className="therapist-experience">
                  {therapist.therapist?.yearsOfExperience} years experience
                </p>
              </div>
            </div>
            <button
              className="btn-secondary"
              onClick={() => navigate('/therapist/profile')}
            >
              View Therapist Profile
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        <div className="profile-card consents">
          <h3>Consents & Agreements</h3>
          <div className="consents-list">
            <div className="consent-item">
              <div>
                <FileText size={18} />
                <span>Terms of Service</span>
              </div>
              <span className="consent-status accepted">Accepted</span>
            </div>
            <div className="consent-item">
              <div>
                <Shield size={18} />
                <span>Privacy Policy</span>
              </div>
              <span className="consent-status accepted">Accepted</span>
            </div>
            <div className="consent-item">
              <div>
                <Heart size={18} />
                <span>Treatment Consent</span>
              </div>
              <button
                className="consent-action"
                onClick={() => setShowConsentModal(true)}
              >
                Review & Sign
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Modal */}
      <Modal
        isOpen={showConsentModal}
        onClose={() => {
          setShowConsentModal(false);
          setConsentForm({ consentType: '', accepted: false });
        }}
        title="Treatment Consent"
        size="lg"
      >
        <div className="consent-modal">
          <div className="consent-content">
            <h4>Informed Consent for Therapy</h4>
            <p>
              I understand that therapy involves discussing personal thoughts, feelings, and experiences.
              I consent to participate in therapy sessions and understand that:
            </p>
            <ul>
              <li>My information will be kept confidential except where required by law</li>
              <li>Therapy may involve discussing difficult emotions</li>
              <li>I can withdraw consent at any time</li>
              <li>My therapist may recommend additional treatments</li>
            </ul>

            <div className="consent-checkbox">
              <input
                type="checkbox"
                id="consent"
                checked={consentForm.accepted}
                onChange={(e) => setConsentForm({...consentForm, accepted: e.target.checked})}
              />
              <label htmlFor="consent">
                I have read and agree to the terms of treatment
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowConsentModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleGiveConsent}
              disabled={!consentForm.accepted}
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;