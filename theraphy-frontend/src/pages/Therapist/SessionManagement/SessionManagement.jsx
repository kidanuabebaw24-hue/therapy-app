import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Edit,
  FileText,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/Common/Table';
import Modal from '../../../components/Common/Modal';
import { getTherapistSessions, completeSession, addSessionNotes } from '../../../services/therapistApi';
import './SessionManagement.css';

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [progressData, setProgressData] = useState({
    moodScore: 5,
    anxietyScore: 5,
    progressLevel: 'same',
    recommendations: ''
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm, statusFilter]);

  const fetchSessions = async () => {
    try {
      const response = await getTherapistSessions();
      setSessions(response.sessions || []);
    } catch (error) {
      toast.error('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = [...sessions];

    if (searchTerm) {
      filtered = filtered.filter(session => 
        session.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.client?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    setFilteredSessions(filtered);
  };

  const handleCompleteSession = async () => {
    try {
      await completeSession(selectedSession.id, {
        notes: sessionNotes,
        progress: progressData
      });
      toast.success('Session completed successfully');
      setShowCompleteModal(false);
      setSelectedSession(null);
      setSessionNotes('');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to complete session');
    }
  };

  const handleAddNotes = async () => {
    try {
      await addSessionNotes(selectedSession.id, { notes: sessionNotes });
      toast.success('Notes added successfully');
      setShowNotesModal(false);
      setSelectedSession(null);
      setSessionNotes('');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to add notes');
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

  const columns = [
    {
      header: 'Client',
      accessor: 'client',
      render: (row) => (
        <div className="client-info">
          <strong>{row.client?.name}</strong>
          <small>{row.client?.email}</small>
        </div>
      )
    },
    {
      header: 'Date & Time',
      accessor: 'date',
      render: (row) => (
        <div className="datetime-info">
          <div className="date">
            <Calendar size={14} />
            {new Date(row.date).toLocaleDateString()}
          </div>
          <div className="time">
            <Clock size={14} />
            {new Date(row.date).toLocaleTimeString()}
          </div>
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

  const actions = [
    {
      icon: <Edit size={18} />,
      label: 'Add Notes',
      name: 'notes',
      className: 'notes',
      condition: (row) => row.status === 'scheduled' || row.status === 'completed'
    },
    {
      icon: <CheckCircle size={18} />,
      label: 'Complete Session',
      name: 'complete',
      className: 'complete',
      condition: (row) => row.status === 'scheduled'
    },
    {
      icon: <FileText size={18} />,
      label: 'View Notes',
      name: 'view-notes',
      className: 'view',
      condition: (row) => row.notes
    }
  ];

  const handleAction = (actionName, row) => {
    setSelectedSession(row);
    switch (actionName) {
      case 'notes':
        setShowNotesModal(true);
        break;
      case 'complete':
        setShowCompleteModal(true);
        break;
      case 'view-notes':
        setSessionNotes(row.notes || '');
        setShowNotesModal(true);
        break;
      default:
        break;
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
    <div className="session-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Session Management</h1>
          <p className="page-subtitle">Track and manage therapy sessions</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{sessions.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Today:</span>
            <span className="stat-value">
              {sessions.filter(s => 
                new Date(s.date).toDateString() === new Date().toDateString()
              ).length}
            </span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Sessions</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>
        </div>
      </div>

      <div className="sessions-table-container">
        <Table
          columns={columns}
          data={filteredSessions}
          actions={actions}
          onAction={handleAction}
        />
      </div>

      {/* Add Notes Modal */}
      <Modal
        isOpen={showNotesModal}
        onClose={() => {
          setShowNotesModal(false);
          setSelectedSession(null);
          setSessionNotes('');
        }}
        title={`Session Notes - ${selectedSession?.client?.name}`}
        size="lg"
      >
        <div className="notes-modal">
          <div className="session-info">
            <p><strong>Date:</strong> {new Date(selectedSession?.date).toLocaleString()}</p>
            <p><strong>Type:</strong> {selectedSession?.type}</p>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Clinical Notes</label>
            <textarea
              id="notes"
              rows={6}
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Document session observations, interventions, and client responses..."
              className="form-input"
            />
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                setShowNotesModal(false);
                setSessionNotes('');
              }}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleAddNotes}
            >
              Save Notes
            </button>
          </div>
        </div>
      </Modal>

      {/* Complete Session Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setSelectedSession(null);
          setSessionNotes('');
          setProgressData({
            moodScore: 5,
            anxietyScore: 5,
            progressLevel: 'same',
            recommendations: ''
          });
        }}
        title={`Complete Session - ${selectedSession?.client?.name}`}
        size="lg"
      >
        <div className="complete-session-modal">
          <div className="session-info">
            <p><strong>Date:</strong> {new Date(selectedSession?.date).toLocaleString()}</p>
            <p><strong>Type:</strong> {selectedSession?.type}</p>
          </div>

          <div className="form-section">
            <h4>Progress Tracking</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Mood Score (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={progressData.moodScore}
                  onChange={(e) => setProgressData({...progressData, moodScore: parseInt(e.target.value)})}
                  className="slider"
                />
                <span className="score-value">{progressData.moodScore}/10</span>
              </div>

              <div className="form-group">
                <label>Anxiety Score (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={progressData.anxietyScore}
                  onChange={(e) => setProgressData({...progressData, anxietyScore: parseInt(e.target.value)})}
                  className="slider"
                />
                <span className="score-value">{progressData.anxietyScore}/10</span>
              </div>
            </div>

            <div className="form-group">
              <label>Progress Level</label>
              <select
                value={progressData.progressLevel}
                onChange={(e) => setProgressData({...progressData, progressLevel: e.target.value})}
                className="form-input"
              >
                <option value="worse">Worse</option>
                <option value="same">Same</option>
                <option value="improving">Improving</option>
                <option value="significantly improved">Significantly Improved</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h4>Session Notes</h4>
            <div className="form-group">
              <textarea
                rows={4}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Document session notes..."
                className="form-input"
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Recommendations</h4>
            <div className="form-group">
              <textarea
                rows={3}
                value={progressData.recommendations}
                onChange={(e) => setProgressData({...progressData, recommendations: e.target.value})}
                placeholder="Provide recommendations for next session..."
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowCompleteModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleCompleteSession}
            >
              Complete Session
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SessionManagement;
