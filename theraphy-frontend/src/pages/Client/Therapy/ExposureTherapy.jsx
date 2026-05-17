import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Volume2,
  Image,
  Headphones,
  Activity,
  Clock,
  TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/Common/Table';
import Modal from '../../../components/Common/Modal';
import { getMyExposureSessions, updateExposureSession } from '../../../services/clientApi';
import './Therapy.css';

const ExposureTherapy = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionReaction, setSessionReaction] = useState({
    anxietyBefore: 5,
    anxietyAfter: 5,
    notes: ''
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await getMyExposureSessions();
      setSessions(data || []);
    } catch (error) {
      toast.error('Failed to fetch exposure sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = (session) => {
    setSelectedSession(session);
    setSessionReaction({
      anxietyBefore: session.clientReaction?.anxietyBefore || 5,
      anxietyAfter: session.clientReaction?.anxietyAfter || 5,
      notes: session.clientReaction?.notes || ''
    });
    setShowSessionModal(true);
  };

  const handleUpdateSession = async () => {
    try {
      await updateExposureSession(selectedSession.id, {
        clientReaction: sessionReaction,
        status: 'completed'
      });
      toast.success('Session completed successfully');
      setShowSessionModal(false);
      fetchSessions();
    } catch (error) {
      toast.error('Failed to update session');
    }
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={20} />;
      case 'image': return <Image size={20} />;
      case 'audio': return <Headphones size={20} />;
      case 'vr': return <Activity size={20} />;
      default: return <Play size={20} />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      planned: { class: 'status-planned', icon: Play },
      'in-progress': { class: 'status-progress', icon: Activity },
      completed: { class: 'status-completed', icon: CheckCircle },
      paused: { class: 'status-paused', icon: Pause }
    };
    const badge = badges[status] || badges.planned;
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
      header: 'Phobia',
      accessor: 'phobiaType'
    },
    {
      header: 'Level',
      accessor: 'exposureLevel',
      render: (row) => (
        <div className="exposure-level">
          <div className="level-bar">
            <div className="level-fill" style={{ width: `${row.exposureLevel * 10}%` }} />
          </div>
          <span>{row.exposureLevel}/10</span>
        </div>
      )
    },
    {
      header: 'Media',
      accessor: 'mediaType',
      render: (row) => (
        <span className="media-type">
          {getMediaIcon(row.mediaType)}
          {row.mediaType}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Progress',
      accessor: 'clientReaction',
      render: (row) => {
        if (row.clientReaction?.anxietyBefore && row.clientReaction?.anxietyAfter) {
          const change = row.clientReaction.anxietyAfter - row.clientReaction.anxietyBefore;
          return (
            <span className={`anxiety-change ${change < 0 ? 'positive' : 'negative'}`}>
              <TrendingDown size={14} />
              {Math.abs(change)} point decrease
            </span>
          );
        }
        return <span className="not-started">Not started</span>;
      }
    }
  ];

  const actions = [
    {
      icon: <Play size={18} />,
      label: 'Start Session',
      name: 'start',
      className: 'start',
      condition: (row) => row.status === 'planned'
    }
  ];

  const handleAction = (actionName, row) => {
    if (actionName === 'start') {
      handleStartSession(row);
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
    <div className="exposure-therapy">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exposure Therapy</h1>
          <p className="page-subtitle">Digital exposure sessions for phobia management</p>
        </div>
      </div>

      <div className="info-card">
        <AlertTriangle size={24} color="#F59E0B" />
        <div>
          <h3>How Exposure Therapy Works</h3>
          <p>You'll be guided through gradual exposure to anxiety triggers in a safe, controlled environment. Track your anxiety levels before and after each session to monitor progress.</p>
        </div>
      </div>

      <div className="sessions-table-container">
        <h3>Your Exposure Sessions</h3>
        <Table
          columns={columns}
          data={sessions}
          actions={actions}
          onAction={handleAction}
        />
      </div>

      {/* Session Modal */}
      <Modal
        isOpen={showSessionModal}
        onClose={() => {
          setShowSessionModal(false);
          setSelectedSession(null);
        }}
        title={`Exposure Session - ${selectedSession?.phobiaType}`}
        size="lg"
      >
        <div className="exposure-session-modal">
          <div className="session-media">
            {selectedSession?.mediaType === 'video' && (
              <div className="video-placeholder">
                <Video size={48} />
                <p>Video content would play here</p>
              </div>
            )}
            {selectedSession?.mediaType === 'image' && (
              <div className="image-placeholder">
                <Image size={48} />
                <p>Image would be displayed here</p>
              </div>
            )}
            {selectedSession?.mediaType === 'audio' && (
              <div className="audio-placeholder">
                <Headphones size={48} />
                <p>Audio would play here</p>
              </div>
            )}
          </div>

          <div className="session-details">
            <h4>Session Information</h4>
            <p><strong>Phobia:</strong> {selectedSession?.phobiaType}</p>
            <p><strong>Exposure Level:</strong> {selectedSession?.exposureLevel}/10</p>
            <p><strong>Duration:</strong> {selectedSession?.duration} minutes</p>
            {selectedSession?.notes && (
              <p><strong>Therapist Notes:</strong> {selectedSession.notes}</p>
            )}
          </div>

          <div className="reaction-form">
            <h4>Track Your Response</h4>

            <div className="form-group">
              <label>Anxiety Level Before Exposure (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={sessionReaction.anxietyBefore}
                onChange={(e) => setSessionReaction({...sessionReaction, anxietyBefore: parseInt(e.target.value)})}
                className="slider"
              />
              <span className="score-badge">{sessionReaction.anxietyBefore}/10</span>
            </div>

            <div className="form-group">
              <label>Anxiety Level After Exposure (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={sessionReaction.anxietyAfter}
                onChange={(e) => setSessionReaction({...sessionReaction, anxietyAfter: parseInt(e.target.value)})}
                className="slider"
              />
              <span className="score-badge">{sessionReaction.anxietyAfter}/10</span>
            </div>

            <div className="anxiety-difference">
              <span>Change: </span>
              <span className={sessionReaction.anxietyAfter - sessionReaction.anxietyBefore < 0 ? 'positive' : 'negative'}>
                {sessionReaction.anxietyAfter - sessionReaction.anxietyBefore > 0 ? '+' : ''}
                {sessionReaction.anxietyAfter - sessionReaction.anxietyBefore}
              </span>
            </div>

            <div className="form-group">
              <label>Your Notes</label>
              <textarea
                rows={4}
                value={sessionReaction.notes}
                onChange={(e) => setSessionReaction({...sessionReaction, notes: e.target.value})}
                placeholder="Describe your experience, thoughts, and feelings during the exposure..."
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowSessionModal(false)}
            >
              Close
            </button>
            <button
              className="btn-primary"
              onClick={handleUpdateSession}
            >
              Complete Session
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExposureTherapy;
