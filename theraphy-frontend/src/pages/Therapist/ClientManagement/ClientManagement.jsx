import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  Activity,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/Common/Table';
import Modal from '../../../components/Common/Modal';
import { getMyClients, getClientDetails } from '../../../services/therapistApi';
import './ClientManagement.css';

const ClientManagement = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientDetails, setClientDetails] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm]);

  const fetchClients = async () => {
    try {
      const response = await getMyClients();
      setClients(response.clients || []);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.patient?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredClients(filtered);
  };

  const handleViewClient = async (client) => {
    try {
      const details = await getClientDetails(client.patient.id);
      setClientDetails(details);
      setSelectedClient(client);
      setShowClientModal(true);
    } catch (error) {
      toast.error('Failed to load client details');
    }
  };

  const columns = [
    {
      header: 'Client',
      accessor: 'patient',
      render: (row) => (
        <div className="client-info">
          <div className="client-avatar">
            {row.patient?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <strong>{row.patient?.name}</strong>
            <small>{row.patient?.email}</small>
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: 'patient.phone',
      render: (row) => (
        <div className="contact-info">
          <Phone size={14} />
          <span>{row.patient?.phone || 'Not provided'}</span>
        </div>
      )
    },
    {
      header: 'Primary Phobia',
      accessor: 'patient.primaryPhobia',
      render: (row) => (
        <span className="phobia-badge">
          {row.patient?.primaryPhobia || 'Not specified'}
        </span>
      )
    },
    {
      header: 'Anxiety Level',
      accessor: 'patient.currentAnxietyLevel',
      render: (row) => {
        const level = row.patient?.currentAnxietyLevel;
        return (
          <div className="anxiety-level">
            <div className="level-bar">
              <div 
                className="level-fill" 
                style={{ width: `${(level || 0) * 10}%` }}
              />
            </div>
            <span>{level || 0}/10</span>
          </div>
        );
      }
    },
    {
      header: 'Assigned Date',
      accessor: 'assignedDate',
      render: (row) => new Date(row.assignedDate).toLocaleDateString()
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
      icon: <Calendar size={18} />,
      label: 'Schedule Session',
      name: 'schedule',
      className: 'schedule'
    },
    {
      icon: <FileText size={18} />,
      label: 'View Progress',
      name: 'progress',
      className: 'progress'
    }
  ];

  const handleAction = (actionName, row) => {
    switch (actionName) {
      case 'view':
        handleViewClient(row);
        break;
      case 'schedule':
        navigate(`/therapist/sessions?client=${row.patient.id}`);
        break;
      case 'progress':
        navigate(`/therapist/progress?client=${row.patient.id}`);
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
    <div className="client-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Client Management</h1>
          <p className="page-subtitle">Manage your assigned clients</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-label">Total Clients:</span>
            <span className="stat-value">{clients.length}</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="clients-table-container">
        <Table
          columns={columns}
          data={filteredClients}
          actions={actions}
          onAction={handleAction}
        />
      </div>

      {/* Client Details Modal */}
      <Modal
        isOpen={showClientModal}
        onClose={() => {
          setShowClientModal(false);
          setSelectedClient(null);
          setClientDetails(null);
        }}
        title={`Client Details: ${selectedClient?.patient?.name}`}
        size="lg"
      >
        {clientDetails && (
          <div className="client-details-modal">
            <div className="details-section">
              <h4>Personal Information</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">Full Name:</span>
                  <span className="value">{clientDetails.name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{clientDetails.email}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Phone:</span>
                  <span className="value">{clientDetails.phone || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Age:</span>
                  <span className="value">{clientDetails.age || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Gender:</span>
                  <span className="value">{clientDetails.gender || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h4>Clinical Information</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">Primary Phobia:</span>
                  <span className="value">{clientDetails.primaryPhobia || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Current Anxiety Level:</span>
                  <span className="value">
                    <div className="anxiety-level-display">
                      <div className="level-bar">
                        <div 
                          className="level-fill" 
                          style={{ width: `${(clientDetails.currentAnxietyLevel || 0) * 10}%` }}
                        />
                      </div>
                      <span>{clientDetails.currentAnxietyLevel || 0}/10</span>
                    </div>
                  </span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h4>Emergency Contact</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">Name:</span>
                  <span className="value">{clientDetails.emergencyContact?.name || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Phone:</span>
                  <span className="value">{clientDetails.emergencyContact?.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowClientModal(false)}
              >
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowClientModal(false);
                  navigate(`/therapist/sessions?client=${clientDetails.id}`);
                }}
              >
                Schedule Session
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClientManagement;
