// pages/Therapist/Profile/Profile.jsx
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Briefcase,
  Edit2,
  Save,
  XCircle,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getTherapistProfile,
  updateTherapistProfile,
} from "../../../services/therapistApi";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    licenseNumber: "",
    specialization: [],
    yearsOfExperience: "",
    bio: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getTherapistProfile();
      setProfile(response);
      // Populate form data for editing
      setFormData({
        name: response.name || "",
        email: response.email || "",
        phone: response.phone || "",
        dateOfBirth: response.dateOfBirth || "",
        address: response.address || "",
        licenseNumber: response.licenseNumber || "",
        specialization: response.specialization || [],
        yearsOfExperience: response.yearsOfExperience || "",
        bio: response.bio || "",
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSpecializationChange = (e) => {
    const value = e.target.value;
    // Split by comma and trim each item
    const specializations = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    setFormData((prev) => ({
      ...prev,
      specialization: specializations,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateTherapistProfile(formData);
      setProfile(formData);
      setEditMode(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile
    setFormData({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      dateOfBirth: profile.dateOfBirth || "",
      address: profile.address || "",
      licenseNumber: profile.licenseNumber || "",
      specialization: profile.specialization || [],
      yearsOfExperience: profile.yearsOfExperience || "",
      bio: profile.bio || "",
    });
    setEditMode(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Here you would upload the image to your server
      toast.success("Profile picture updated");
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-cover">
          {/**  <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              <img 
                src={profile?.avatar || '/default-avatar.png'} 
                alt={profile?.name}
              />
              {editMode && (
                <label className="avatar-upload">
                  <Camera size={18} />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    hidden
                  />
                </label>
              )}
            </div>
          </div> */}

          <div className="profile-title">
            {editMode ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="edit-title-input"
                placeholder="Your name"
              />
            ) : (
              <h1>{profile?.name}</h1>
            )}

            {editMode ? (
              <input
                type="text"
                name="specialization"
                value={
                  Array.isArray(formData.specialization)
                    ? formData.specialization.join(", ")
                    : formData.specialization
                }
                onChange={handleSpecializationChange}
                className="edit-subtitle-input"
                placeholder="Specializations (comma separated)"
              />
            ) : (
              <p>
                {Array.isArray(profile?.specialization)
                  ? profile.specialization.join(" • ")
                  : profile?.specialization || "Therapist"}
              </p>
            )}
          </div>

          {!editMode ? (
            <button
              className="btn-edit-profile"
              onClick={() => setEditMode(true)}
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="btn-cancel" onClick={handleCancel}>
                <XCircle size={18} />
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveProfile}>
                <Save size={18} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        {/* Personal Information Card */}
        <div className="info-card">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <User size={18} />
              <div>
                <label>Full Name</label>
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{profile?.name || "Not provided"}</p>
                )}
              </div>
            </div>

            <div className="info-item">
              <Mail size={18} />
              <div>
                <label>Email</label>
                {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{profile?.email || "Not provided"}</p>
                )}
              </div>
            </div>

            <div className="info-item">
              <Phone size={18} />
              <div>
                <label>Phone</label>
                {editMode ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="edit-input"
                    placeholder="+1 234 567 8900"
                  />
                ) : (
                  <p>{profile?.phone || "Not provided"}</p>
                )}
              </div>
            </div>

            <div className="info-item">
              <Calendar size={18} />
              <div>
                <label>Date of Birth</label>
                {editMode ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <p>
                    {profile?.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString()
                      : "Not provided"}
                  </p>
                )}
              </div>
            </div>

            <div className="info-item full-width">
              <MapPin size={18} />
              <div>
                <label>Address</label>
                {editMode ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="edit-input"
                    placeholder="Your address"
                  />
                ) : (
                  <p>{profile?.address || "Not provided"}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information Card */}
        <div className="info-card">
          <h3>Professional Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <Briefcase size={18} />
              <div>
                <label>License Number</label>
                {editMode ? (
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="edit-input"
                    placeholder="License number"
                  />
                ) : (
                  <p>{profile?.licenseNumber || "Not provided"}</p>
                )}
              </div>
            </div>

            <div className="info-item">
              <Award size={18} />
              <div>
                <label>Specializations</label>
                {editMode ? (
                  <input
                    type="text"
                    value={
                      Array.isArray(formData.specialization)
                        ? formData.specialization.join(", ")
                        : formData.specialization
                    }
                    onChange={handleSpecializationChange}
                    className="edit-input"
                    placeholder="e.g., Anxiety, Depression, CBT (comma separated)"
                  />
                ) : (
                  <p>
                    {Array.isArray(profile?.specialization) &&
                    profile.specialization.length > 0
                      ? profile.specialization.join(", ")
                      : profile?.specialization || "Not provided"}
                  </p>
                )}
              </div>
            </div>

            <div className="info-item">
              <Calendar size={18} />
              <div>
                <label>Years of Experience</label>
                {editMode ? (
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    className="edit-input"
                    min="0"
                    placeholder="Years"
                  />
                ) : (
                  <p>{profile?.yearsOfExperience || "0"} years</p>
                )}
              </div>
            </div>

            <div className="info-item full-width">
              <div>
                <label>Professional Bio</label>
                {editMode ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="edit-textarea"
                    rows="4"
                    placeholder="Write a brief professional bio..."
                  />
                ) : (
                  <p className="bio-text">
                    {profile?.bio || "No bio provided"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
