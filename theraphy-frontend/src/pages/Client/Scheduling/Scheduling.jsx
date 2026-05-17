import { useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Video,
  MapPin,
  DollarSign,
  User,
  Plus,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/Common/Table';
import Modal from '../../../components/Common/Modal';
import { getMySessions, getAvailableTherapists, bookSession, cancelSession } from '../../../services/clientApi';
import './Scheduling.css';

const Scheduling = () => {
 // const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [bookingData, setBookingData] = useState({
    therapistId: '',
    date: '',
    time: '',
    duration: 60,
    type: 'consultation',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsData, therapistsData] = await Promise.all([
        getMySessions(),
        getAvailableTherapists()
      ]);

      const allSessions = sessionsData.sessions || [];
      const now = new Date();

      const upcoming = allSessions.filter(s => 
        s.status === 'scheduled' && new Date(s.date) > now
      );
      const past = allSessions.filter(s => 
        s.status === 'completed' || new Date(s.date) <= now
      );

      setSessions(allSessions);
      setUpcomingSessions(upcoming);
      setPastSessions(past);
      setTherapists(therapistsData.therapists || []);
    } catch (error) {
      console.log(error)
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async () => {
    if (!bookingData.therapistId || !bookingData.date || !bookingData.time) {
      toast.error('Please fill all required fields');
      return;
    }

    const dateTime = new Date(`${bookingData.date}T${bookingData.time}`);

    try {
      await bookSession({
        therapist: bookingData.therapistId,
        date: dateTime,
        duration: bookingData.duration,
        type: bookingData.type,
        notes: bookingData.notes
      });
      toast.success('Session booked successfully');
      setShowBookModal(false);
      setBookingData({
        therapistId: '',
        date: '',
        time: '',
        duration: 60,
        type: 'consultation',
        notes: ''
      });
      fetchData();
    } catch (error) {
       console.log(error)
      toast.error('Failed to book session');
    }
  };

  const handleCancelSession = async () => {
    try {
      await cancelSession(selectedSession.id);
      toast.success('Session cancelled successfully');
      setShowCancelModal(false);
      setSelectedSession(null);
      fetchData();
    } catch (error) {
      console.log(error)
      toast.error('Failed to cancel session');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { class: 'status-scheduled', icon: Calendar },
      completed: { class: 'status-completed', icon: CheckCircle },
      cancelled: { class: 'status-cancelled', icon: XCircle },
      'no-show': { class: 'status-noshow', icon: XCircle }
    };
    const badge = badges[status] || badges.scheduled;
    const Icon = badge.icon;
    return (
      <span className={`status-badge ${badge.class}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  const upcomingColumns = [
    {
      header: 'Therapist',
      accessor: 'therapist',
      render: (row) => (
        <div className="therapist-info">
          <div className="therapist-avatar">
            {row.therapist?.name?.charAt(0) || 'T'}
          </div>
          <div>
            <strong>{row.therapist?.name}</strong>
            <small>{row.therapist?.specialization}</small>
          </div>
        </div>
      )
    },
    {
      header: 'Date & Time',
      accessor: 'date',
      render: (row) => (
        <div className="datetime-info">
          <div><Calendar size={14} /> {new Date(row.date).toLocaleDateString()}</div>
          <div><Clock size={14} /> {new Date(row.date).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      header: 'Duration',
      accessor: 'duration',
      render: (row) => `${row.duration} min`
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => (
        <span className="session-type">{row.type}</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
    }
  ];

  const pastColumns = [
    ...upcomingColumns,
    {
      header: 'Payment',
      accessor: 'paymentStatus',
      render: (row) => (
        <span className={`payment-status ${row.paymentStatus}`}>
          {row.paymentStatus}
        </span>
      )
    }
  ];

  const actions = [
    {
      icon: <XCircle size={18} />,
      label: 'Cancel',
      name: 'cancel',
      className: 'cancel',
      condition: (row) => row.status === 'scheduled'
    }
  ];

  const handleAction = (actionName, row) => {
    if (actionName === 'cancel') {
      setSelectedSession(row);
      setShowCancelModal(true);
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
    <div className="scheduling">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Sessions</h1>
          <p className="page-subtitle">Schedule and manage your therapy sessions</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowBookModal(true)}
        >
          <Plus size={20} />
          Book Session
        </button>
      </div>

      <div className="sessions-summary">
        <div className="summary-card">
          <Calendar size={24} color="#3B82F6" />
          <div>
            <span className="summary-value">{upcomingSessions.length}</span>
            <span className="summary-label">Upcoming</span>
          </div>
        </div>
        <div className="summary-card">
          <CheckCircle size={24} color="#10B981" />
          <div>
            <span className="summary-value">{pastSessions.filter(s => s.status === 'completed').length}</span>
            <span className="summary-label">Completed</span>
          </div>
        </div>
        <div className="summary-card">
          <Clock size={24} color="#F59E0B" />
          <div>
            <span className="summary-value">{sessions.length}</span>
            <span className="summary-label">Total</span>
          </div>
        </div>
      </div>

      <div className="sessions-section">
        <h3>Upcoming Sessions</h3>
        <Table
          columns={upcomingColumns}
          data={upcomingSessions}
          actions={actions}
          onAction={handleAction}
        />
      </div>

      <div className="sessions-section">
        <h3>Past Sessions</h3>
        <Table
          columns={pastColumns}
          data={pastSessions}
        />
      </div>

      {/* Book Session Modal */}
      <Modal
        isOpen={showBookModal}
        onClose={() => {
          setShowBookModal(false);
          setBookingData({
            therapistId: '',
            date: '',
            time: '',
            duration: 60,
            type: 'consultation',
            notes: ''
          });
        }}
        title="Book a Therapy Session"
        size="lg"
      >
        <div className="book-modal">
          <div className="form-group">
            <label>Select Therapist *</label>
            <select
              value={bookingData.therapistId}
              onChange={(e) => setBookingData({...bookingData, therapistId: e.target.value})}
              className="form-input"
              required
            >
              <option value="">Choose a therapist...</option>
              {therapists.map(therapist => (
                <option key={therapist.id} value={therapist.id}>
                  {therapist.name} - {therapist.specialization} ({therapist.yearsOfExperience} yrs exp)
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={bookingData.date}
                onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                value={bookingData.time}
                onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes)</label>
              <select
                value={bookingData.duration}
                onChange={(e) => setBookingData({...bookingData, duration: parseInt(e.target.value)})}
                className="form-input"
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>

            <div className="form-group">
              <label>Session Type</label>
              <select
                value={bookingData.type}
                onChange={(e) => setBookingData({...bookingData, type: e.target.value})}
                className="form-input"
              >
                <option value="consultation">Consultation</option>
                <option value="cbt">CBT Therapy</option>
                <option value="exposure">Exposure Therapy</option>
                <option value="followup">Follow-up</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              rows={4}
              value={bookingData.notes}
              onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
              placeholder="Any specific concerns or topics you'd like to discuss?"
              className="form-input"
            />
          </div>

          {bookingData.therapistId && (
            <div className="therapist-preview">
              <h4>Selected Therapist</h4>
              {therapists
                .filter(t => t.id === bookingData.therapistId)
                .map(therapist => (
                  <div key={therapist.id} className="therapist-details">
                    <p><strong>Name:</strong> {therapist.name}</p>
                    <p><strong>Specialization:</strong> {therapist.specialization}</p>
                    <p><strong>Experience:</strong> {therapist.yearsOfExperience} years</p>
                    <p><strong>Rate:</strong> ${therapist.hourlyRate}/hour</p>
                  </div>
                ))}
            </div>
          )}

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowBookModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleBookSession}
            >
              Book Session
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Session Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedSession(null);
        }}
        title="Cancel Session"
        size="md"
      >
        <div className="cancel-modal">
          <AlertCircle size={48} color="#EF4444" />
          <p>Are you sure you want to cancel this session?</p>
          <p className="session-details">
            {selectedSession && (
              <>
                with {selectedSession.therapist?.name} on{' '}
                {new Date(selectedSession.date).toLocaleString()}
              </>
            )}
          </p>
          <p className="warning-text">This action cannot be undone.</p>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowCancelModal(false)}
            >
              Keep Session
            </button>
            <button
              className="btn-danger"
              onClick={handleCancelSession}
            >
              Cancel Session
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Scheduling;
