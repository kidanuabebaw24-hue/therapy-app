import { useState, useEffect } from 'react';
import { 
  Activity, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Video,
  Image,
  Headphones
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/Common/Table';
import Modal from '../../../components/Common/Modal';
import { getMyClients, createExposurePlan, getExposureSessions, updateExposureSession } from '../../../services/therapistApi';
import './TherapeuticModules.css';

const TherapeuticModules = () => {
  const [modules, setModules] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [sessionReaction, setSessionReaction] = useState({
    anxietyBefore: 5,
    anxietyAfter: 5,
    notes: ''
  });

  const [newModule, setNewModule] = useState({
    clientId: '',
    phobiaType: '',
    exposureLevel: 5,
    mediaType: 'image',
    mediaUrl: '',
    notes: '',
    duration: 30
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsResponse, modulesResponse] = await Promise.all([
        getMyClients(),
        getExposureSessions()
      ]);
      setClients(clientsResponse.clients || []);
      setModules(modulesResponse || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async () => {
    if (!newModule.clientId || !newModule.phobiaType) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await createExposurePlan(newModule);
      toast.success('Exposure plan created successfully');
      setShowCreateModal(false);
      setNewModule({
        clientId: '',
        phobiaType: '',
        exposureLevel: 5,
        mediaType: 'image',
        mediaUrl: '',
        notes: '',
        duration: 30
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create exposure plan');
    }
  };

  const handleUpdateSession = async () => {
    try {
      await updateExposureSession(selectedModule.id, {
        ...sessionReaction,
        status: 'completed'
      });
      toast.success('Session updated successfully');
      setShowSessionModal(false);
      setSelectedModule(null);
      setSessionReaction({
        anxietyBefore: 5,
        anxietyAfter: 5,
        notes: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to update session');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'planned': { class: 'status-planned', icon: Play },
      'in-progress': { class: 'status-progress', icon: Activity },
      'completed': { class: 'status-completed', icon: CheckCircle },
      'paused': { class: 'status-paused', icon: Pause }
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

  const getMediaIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={16} />;
      case 'image': return <Image size={16} />;
      case 'audio': return <Headphones size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const columns = [
    {
      header: 'Client',
      accessor: 'client',
      render: (row) => (
        <div className="client-info">
          <strong>{row.client?.name}</strong>
        </div>
      )
    },
    {
      header: 'Phobia Type',
      accessor: 'phobiaType'
    },
    {
      header: 'Exposure Level',
      accessor: 'exposureLevel',
      render: (row) => (
        <div className="exposure-level">
          <div className="level-bar">
            <div 
              className="level-fill" 
              style={{ width: `${row.exposureLevel * 10}%` }}
            />
          </div>
          <span>{row.exposureLevel}/10</span>
        </div>
      )
    },
    {
      header: 'Media',
      accessor: 'mediaType',
      render: (row) => (
        <div className="media-type">
          {getMediaIcon(row.mediaType)}
          <span>{row.mediaType}</span>
        </div>
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
              {change < 0 ? '↓' : '↑'} {Math.abs(change)} points
            </span>
          );
        }
        return <span className="no-data">Not started</span>;
      }
    }
  ];

  const actions = [
    {
      icon: <Eye size={18} />,
      label: 'View Details',
      name: 'view',
      className: 'view'
    },
    {
      icon: <Play size={18} />,
      label: 'Start Session',
      name: 'start',
      className: 'start',
      condition: (row) => row.status === 'planned'
    },
    {
      icon: <Edit size={18} />,
      label: 'Update Session',
      name: 'update',
      className: 'update',
      condition: (row) => row.status === 'in-progress'
    }
  ];

  const handleAction = (actionName, row) => {
    setSelectedModule(row);
    switch (actionName) {
      case 'view':
        setShowSessionModal(true);
        setSessionReaction({
          anxietyBefore: row.clientReaction?.anxietyBefore || 5,
          anxietyAfter: row.clientReaction?.anxietyAfter || 5,
          notes: row.clientReaction?.notes || ''
        });
        break;
      case 'start':
        // Start session
        break;
      case 'update':
        setShowSessionModal(true);
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
    <div className="therapeutic-modules">
      <div className="page-header">
        <div>
          <h1 className="page-title">Therapeutic Modules</h1>
          <p className="page-subtitle">Manage exposure therapy sessions</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          New Exposure Plan
        </button>
      </div>

      <div className="modules-table-container">
        <Table
          columns={columns}
          data={modules}
          actions={actions}
          onAction={handleAction}
        />
      </div>

      {/* Create Module Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewModule({
            clientId: '',
            phobiaType: '',
            exposureLevel: 5,
            mediaType: 'image',
            mediaUrl: '',
            notes: '',
            duration: 30
          });
        }}
        title="Create Exposure Therapy Plan"
        size="lg"
      >
        <div className="create-module-modal">
          <div className="form-group">
            <label>Client *</label>
            <select
              value={newModule.clientId}
              onChange={(e) => setNewModule({...newModule, clientId: e.target.value})}
              className="form-input"
              required
            >
              <option value="">Select client</option>
              {clients.map(client => (
                <option key={client.patient.id} value={client.patient.id}>
                  {client.patient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Phobia Type *</label>
            <input
              type="text"
              value={newModule.phobiaType}
              onChange={(e) => setNewModule({...newModule, phobiaType: e.target.value})}
              placeholder="e.g., Social Anxiety, Claustrophobia"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Exposure Level (1-10) *</label>
            <input
              type="range"
              min="1"
              max="10"
              value={newModule.exposureLevel}
              onChange={(e) => setNewModule({...newModule, exposureLevel: parseInt(e.target.value)})}
              className="slider"
            />
            <div className="level-indicator">
              <span>Level: {newModule.exposureLevel}/10</span>
              <span className="level-description">
                {newModule.exposureLevel <= 3 ? 'Mild' : 
                 newModule.exposureLevel <= 6 ? 'Moderate' : 
                 newModule.exposureLevel <= 8 ? 'High' : 'Intense'}
              </span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Media Type</label>
              <select
                value={newModule.mediaType}
                onChange={(e) => setNewModule({...newModule, mediaType: e.target.value})}
                className="form-input"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="vr">VR</option>
                <option value="reality">Real-life</option>
              </select>
            </div>

            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={newModule.duration}
                onChange={(e) => setNewModule({...newModule, duration: parseInt(e.target.value)})}
                min="5"
                max="120"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Media URL (optional)</label>
            <input
              type="url"
              value={newModule.mediaUrl}
              onChange={(e) => setNewModule({...newModule, mediaUrl: e.target.value})}
              placeholder="https://example.com/media.jpg"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              rows={4}
              value={newModule.notes}
              onChange={(e) => setNewModule({...newModule, notes: e.target.value})}
              placeholder="Additional instructions or notes..."
              className="form-input"
            />
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleCreateModule}
            >
              Create Plan
            </button>
          </div>
        </div>
      </Modal>

      {/* Session Modal */}
      <Modal
        isOpen={showSessionModal}
        onClose={() => {
          setShowSessionModal(false);
          setSelectedModule(null);
          setSessionReaction({
            anxietyBefore: 5,
            anxietyAfter: 5,
            notes: ''
          });
        }}
        title={`Exposure Session - ${selectedModule?.client?.name}`}
        size="lg"
      >
        <div className="session-modal">
          <div className="session-info">
            <p><strong>Phobia:</strong> {selectedModule?.phobiaType}</p>
            <p><strong>Exposure Level:</strong> {selectedModule?.exposureLevel}/10</p>
            <p><strong>Media Type:</strong> {selectedModule?.mediaType}</p>
          </div>

          <div className="form-section">
            <h4>Client Reaction</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Anxiety Before (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sessionReaction.anxietyBefore}
                  onChange={(e) => setSessionReaction({...sessionReaction, anxietyBefore: parseInt(e.target.value)})}
                  className="slider"
                />
                <span className="score-value">{sessionReaction.anxietyBefore}/10</span>
              </div>

              <div className="form-group">
                <label>Anxiety After (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sessionReaction.anxietyAfter}
                  onChange={(e) => setSessionReaction({...sessionReaction, anxietyAfter: parseInt(e.target.value)})}
                  className="slider"
                />
                <span className="score-value">{sessionReaction.anxietyAfter}/10</span>
              </div>
            </div>

            <div className="anxiety-change-calc">
              Change: 
              <span className={sessionReaction.anxietyAfter - sessionReaction.anxietyBefore < 0 ? 'positive' : 'negative'}>
                {sessionReaction.anxietyAfter - sessionReaction.anxietyBefore > 0 ? '+' : ''}
                {sessionReaction.anxietyAfter - sessionReaction.anxietyBefore}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Session Notes</label>
            <textarea
              rows={4}
              value={sessionReaction.notes}
              onChange={(e) => setSessionReaction({...sessionReaction, notes: e.target.value})}
              placeholder="Document client's reaction and observations..."
              className="form-input"
            />
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
              Save Session Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TherapeuticModules;
