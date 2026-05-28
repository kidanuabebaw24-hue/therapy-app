import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar, 
  AlertCircle,
  Award,
  Clock,
  DollarSign,
  FileText,
  Users,
  Heart,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { register } from '../../services/auth';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('client');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Client specific
    age: '',
    gender: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    primaryPhobia: '',
    
    // Anxiety Questionnaire Responses (CLIENT ONLY)
    anxietyAnswers: {
      q1: null,
      q2: null,
      q3: null,
      q4: null,
      q5: null,
      q6: null,
      q7: null,
      q8: null
    },
    
    // Therapist specific
    specialization: '',
    licenseNumber: '',
    yearsOfExperience: '',
    hourlyRate: '',
    bio: '',
    workingHours: [
      { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'Saturday', enabled: false, startTime: '10:00', endTime: '14:00' },
      { day: 'Sunday', enabled: false, startTime: '10:00', endTime: '14:00' }
    ]
  });

  // Anxiety Questionnaire Questions (CLIENT ONLY)
  const anxietyQuestions = [
    {
      id: 'q1',
      text: 'How often do you feel anxious or worried?',
      options: [
        { value: 1, label: 'Rarely (Once a month or less)' },
        { value: 2, label: 'Sometimes (2-3 times a month)' },
        { value: 3, label: 'Often (Once a week)' },
        { value: 4, label: 'Very Often (Several times a week)' },
        { value: 5, label: 'Almost Always (Daily)' }
      ]
    },
    {
      id: 'q2',
      text: 'How much does anxiety affect your daily activities?',
      options: [
        { value: 1, label: 'Not at all' },
        { value: 2, label: 'Mildly (I can still function normally)' },
        { value: 3, label: 'Moderately (Sometimes interferes)' },
        { value: 4, label: 'Severely (Often interferes)' },
        { value: 5, label: 'Very Severely (Cannot function normally)' }
      ]
    },
    {
      id: 'q3',
      text: 'How often do you experience physical symptoms (racing heart, sweating, trembling)?',
      options: [
        { value: 1, label: 'Never' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Sometimes' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'Very Often' }
      ]
    },
    {
      id: 'q4',
      text: 'How often do you avoid situations that might trigger anxiety?',
      options: [
        { value: 1, label: 'Never' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Sometimes' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'Always' }
      ]
    },
    {
      id: 'q5',
      text: 'How would you rate your sleep quality?',
      options: [
        { value: 1, label: 'Excellent (Sleep well every night)' },
        { value: 2, label: 'Good (Minor issues occasionally)' },
        { value: 3, label: 'Fair (Often have trouble sleeping)' },
        { value: 4, label: 'Poor (Frequently can\'t sleep)' },
        { value: 5, label: 'Very Poor (Barely sleep at all)' }
      ]
    },
    {
      id: 'q6',
      text: 'How often do you feel overwhelmed by your responsibilities?',
      options: [
        { value: 1, label: 'Never' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Sometimes' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'Always' }
      ]
    },
    {
      id: 'q7',
      text: 'How often do you have trouble concentrating due to anxious thoughts?',
      options: [
        { value: 1, label: 'Never' },
        { value: 2, label: 'Rarely' },
        { value: 3, label: 'Sometimes' },
        { value: 4, label: 'Often' },
        { value: 5, label: 'Very Often' }
      ]
    },
    {
      id: 'q8',
      text: 'Overall, how would you rate your current mental well-being?',
      options: [
        { value: 1, label: 'Excellent (Very happy and calm)' },
        { value: 2, label: 'Good (Generally positive)' },
        { value: 3, label: 'Fair (Some ups and downs)' },
        { value: 4, label: 'Poor (Mostly stressed/anxious)' },
        { value: 5, label: 'Very Poor (Extremely anxious/depressed)' }
      ]
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnxietyAnswer = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      anxietyAnswers: {
        ...prev.anxietyAnswers,
        [questionId]: value
      }
    }));
  };

  const handleWorkingHoursChange = (index, field, value) => {
    const updatedHours = [...formData.workingHours];
    updatedHours[index][field] = value;
    setFormData(prev => ({ ...prev, workingHours: updatedHours }));
  };

  const calculateAnxietyLevel = () => {
    const answers = Object.values(formData.anxietyAnswers);
    const totalScore = answers.reduce((sum, score) => sum + (score || 0), 0);
    const averageScore = totalScore / answers.length;
    
    let anxietyLevel = Math.round((averageScore / 5) * 10);
    anxietyLevel = Math.max(1, Math.min(10, anxietyLevel));
    
    return anxietyLevel;
  };

  const validateForm = () => {
    // Common validations
    if (!formData.name.trim()) {
      toast.error('Full name is required');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Valid email is required');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    // Client validations (including anxiety assessment)
    if (role === 'client') {
      if (!formData.age) {
        toast.error('Age is required for client registration');
        return false;
      }
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 18) {
        toast.error('You must be at least 18 years old to register');
        return false;
      }
      if (ageNum > 120) {
        toast.error('Please enter a valid age (18-120)');
        return false;
      }
      
      // Check if all anxiety questions are answered
      const unanswered = Object.values(formData.anxietyAnswers).some(value => value === null);
      if (unanswered) {
        toast.error('Please complete all anxiety assessment questions');
        return false;
      }
    }

    // Therapist validations
    if (role === 'therapist') {
      if (!formData.specialization) {
        toast.error('Specialization is required for therapists');
        return false;
      }
      if (!formData.licenseNumber) {
        toast.error('License number is required for therapists');
        return false;
      }
      
      // Validate working hours
      const hasEnabledDay = formData.workingHours.some(day => day.enabled);
      if (!hasEnabledDay) {
        toast.error('Please enable at least one working day');
        return false;
      }
      
      // Validate time ranges
      for (const day of formData.workingHours) {
        if (day.enabled && day.startTime >= day.endTime) {
          toast.error(`${day.day}: Start time must be before end time`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For clients, go to anxiety assessment step first
    if (role === 'client' && currentStep === 1) {
      setCurrentStep(2);
      return;
    }
    
    // For therapists, submit directly
    if (!validateForm()) return;

    setLoading(true);
    try {
      let registrationData;
      
      if (role === 'client') {
        // Calculate anxiety level from answers
        const calculatedAnxietyLevel = calculateAnxietyLevel();
        
        registrationData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: 'client',
          age: parseInt(formData.age),
          gender: formData.gender,
          primaryPhobia: formData.primaryPhobia,
          currentAnxietyLevel: calculatedAnxietyLevel,
        };
      } else {
        // Therapist registration (with working hours)
        registrationData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: 'therapist',
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber,
          yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
          bio: formData.bio,
          workingHours: formData.workingHours.filter(day => day.enabled) // Only save enabled days
        };
      }

      const response = await register(registrationData);
      
      if (role === 'therapist') {
        toast.success('Therapist registration successful! Please wait for admin verification.');
        navigate('/login');
      } else {
        const anxietyLevel = calculateAnxietyLevel();
        toast.success(`Registration successful! Your anxiety level is ${anxietyLevel}/10. Please complete the initial CBT exercises.`);
        
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        navigate('/cbt-exercises');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setCurrentStep(1);
  };

  // Step 1: Basic Information (for both roles)
  const renderBasicInfoStep = () => (
    <>
      <div className="role-selector">
        <button
          type="button"
          className={`role-btn ${role === 'client' ? 'active' : ''}`}
          onClick={() => {
            setRole('client');
            setCurrentStep(1);
          }}
        >
          <Users size={20} />
          Client
        </button>
        <button
          type="button"
          className={`role-btn ${role === 'therapist' ? 'active' : ''}`}
          onClick={() => {
            setRole('therapist');
            setCurrentStep(1);
          }}
        >
          <Briefcase size={20} />
          Therapist
        </button>
      </div>

      {/* Common Fields for both roles */}
      <div className="form-section">
        <h3>Personal Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label><User size={18} /> Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label><Mail size={18} /> Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><Lock size={18} /> Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label><Lock size={18} /> Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label><Phone size={18} /> Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 234 567 8900"
          />
        </div>
      </div>

      {/* Client-specific fields */}
      {role === 'client' && (
        <div className="form-section">
          <h3>Client Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label><Calendar size={18} /> Age * (18+ only)</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="25"
                min="18"
                max="120"
                required
              />
              <small className="field-note">You must be at least 18 years old</small>
            </div>

            <div className="form-group">
              <label><Users size={18} /> Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="form-section-sub">
            <h4>Emergency Contact</h4>
            <div className="form-row">
              <div className="form-group">
                <label><User size={18} /> Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                />
              </div>

              <div className="form-group">
                <label><Phone size={18} /> Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8901"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label><AlertCircle size={18} /> Primary Phobia/Anxiety (Optional)</label>
            <input
              type="text"
              name="primaryPhobia"
              value={formData.primaryPhobia}
              onChange={handleChange}
              placeholder="e.g., Social anxiety, Claustrophobia"
            />
          </div>
        </div>
      )}

      {/* Therapist-specific fields */}
      {role === 'therapist' && (
        <>
          <div className="form-section">
            <h3>Professional Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label><Award size={18} /> Specialization *</label>
                <select name="specialization" value={formData.specialization} onChange={handleChange} required>
                  <option value="">Select specialization</option>
                  <option value="Clinical Psychology">Clinical Psychology</option>
                  <option value="Counseling Psychology">Counseling Psychology</option>
                  <option value="Child Psychology">Child Psychology</option>
                  <option value="Neuropsychology">Neuropsychology</option>
                  <option value="Forensic Psychology">Forensic Psychology</option>
                  <option value="Health Psychology">Health Psychology</option>
                  <option value="Sports Psychology">Sports Psychology</option>
                  <option value="Educational Psychology">Educational Psychology</option>
                </select>
              </div>

              <div className="form-group">
                <label><FileText size={18} /> License Number *</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="LIC-12345"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><Clock size={18} /> Years of Experience</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  placeholder="5"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label><DollarSign size={18} /> Hourly Rate ($)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="150"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Professional Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about your experience, approach, and areas of expertise..."
              />
            </div>
          </div>

          {/* Working Hours Section */}
          <div className="form-section">
            <h3>Working Hours</h3>
            <p className="section-note">Set your availability for client sessions</p>
            
            {formData.workingHours.map((day, index) => (
              <div key={day.day} className="working-hours-row">
                <div className="day-toggle">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={day.enabled}
                      onChange={(e) => handleWorkingHoursChange(index, 'enabled', e.target.checked)}
                    />
                    <span className="day-name">{day.day}</span>
                  </label>
                </div>
                
                {day.enabled && (
                  <div className="time-range">
                    <div className="time-input">
                      <label>Start Time</label>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => handleWorkingHoursChange(index, 'startTime', e.target.value)}
                      />
                    </div>
                    <span className="time-separator">to</span>
                    <div className="time-input">
                      <label>End Time</label>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => handleWorkingHoursChange(index, 'endTime', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div className="working-hours-note">
              <Clock size={14} />
              <small>These hours will be shown to clients when booking sessions</small>
            </div>
          </div>
        </>
      )}

      <button type="submit" className="btn-primary next-btn">
        {role === 'client' ? (
          <>Continue to Anxiety Assessment <ChevronRight size={18} /></>
        ) : (
          <>Register as Therapist</>
        )}
      </button>
    </>
  );

  // Step 2: Anxiety Assessment (CLIENT ONLY)
  const renderAnxietyAssessmentStep = () => (
    <>
      <div className="assessment-header">
        <div className="assessment-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '100%' }}></div>
          </div>
          <p>Step 2 of 2: Anxiety Assessment</p>
        </div>
        <h2>Anxiety Assessment Questionnaire</h2>
        <p>Please answer these questions honestly to help us understand your current state and provide better support.</p>
        <div className="assessment-note">
          <Heart size={16} />
          <span>Your answers will determine your initial anxiety level (1-10 scale)</span>
        </div>
      </div>

      <div className="questions-container">
        {anxietyQuestions.map((question, index) => (
          <div key={question.id} className="question-card">
            <div className="question-header">
              <span className="question-number">{index + 1}</span>
              <h3 className="question-text">{question.text}</h3>
            </div>
            <div className="options-group">
              {question.options.map((option) => (
                <label key={option.value} className="option-label">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={formData.anxietyAnswers[question.id] === option.value}
                    onChange={() => handleAnxietyAnswer(question.id, option.value)}
                  />
                  <span className="option-text">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {calculateAnxietyLevel() > 0 && (
        <div className="anxiety-preview">
          <Heart size={20} />
          <span>Your estimated anxiety level will be: <strong>{calculateAnxietyLevel()}/10</strong></span>
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={goBack} className="btn-secondary back-btn">
          <ChevronLeft size={18} />
          Back
        </button>
        <button type="submit" className="btn-primary submit-btn" disabled={loading}>
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </button>
      </div>
    </>
  );

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join TherapyManager today</p>
          {role === 'client' && (
            <small className="age-warning">⚠️ You must be 18 or older to register as a client</small>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderBasicInfoStep()}
          {role === 'client' && currentStep === 2 && renderAnxietyAssessmentStep()}
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        <p className="terms-note">
          By registering, you confirm that you are 18 years of age or older
        </p>
      </div>
    </div>
  );
};

export default Register;