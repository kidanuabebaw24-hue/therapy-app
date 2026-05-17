import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  Calendar,
  Activity,
  Award,
  Download,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/Common/Table';
import Modal from '../../../components/Common/Modal';
import { LineChartComponent, BarChartComponent } from '../../../components/Dashboard/Charts';
import { getMyClients, getClientProgress, getProgressSummary } from '../../../services/therapistApi';
import './ProgressTracking.css';

const ProgressTracking = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchClients();
  }, []);

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

  const fetchClientProgress = async (clientId) => {
    try {
      const [progress, summary] = await Promise.all([
        getClientProgress(clientId, dateRange),
        getProgressSummary(clientId)
      ]);
      setProgressData(progress.timelineData || []);
      setSummaryData(summary);
      setShowProgressModal(true);
    } catch (error) {
      toast.error('Failed to fetch progress data');
    }
  };

  const handleViewProgress = (client) => {
    setSelectedClient(client);
    fetchClientProgress(client.patient.id);
  };

  const columns = [
    {
      header: 'Client',
      accessor: 'patient',
      render: (row) => (
        <div className="client-info">
          <div className="client-avatar">
            {row.patient?.name?.charAt(0)}
          </div>
          <div>
            <strong>{row.patient?.name}</strong>
            <small>{row.patient?.email}</small>
          </div>
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
      header: 'Current Anxiety',
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
      header: 'Last Session',
      accessor: 'lastSession',
      render: (row) => row.lastSession ? new Date(row.lastSession).toLocaleDateString() : 'No sessions'
    }
  ];

  const actions = [
    {
      icon: <Eye size={18} />,
      label: 'View Progress',
      name: 'view',
      className: 'view'
    },
    {
      icon: <Download size={18} />,
      label: 'Export Report',
      name: 'export',
      className: 'export'
    }
  ];

  const handleAction = (actionName, row) => {
    switch (actionName) {
      case 'view':
        handleViewProgress(row);
        break;
      case 'export':
        // Handle export
        toast.success('Report downloaded');
        break;
      default:
        break;
    }
  };

  const getProgressLevelColor = (level) => {
    const colors = {
      'worse': '#E74C3C',
      'same': '#F39C12',
      'improving': '#3498DB',
      'significantly improved': '#27AE60'
    };
    return colors[level] || '#95A5A6';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="progress-tracking">
      <div className="page-header">
        <div>
          <h1 className="page-title">Progress Tracking</h1>
          <p className="page-subtitle">Monitor client progress over time</p>
        </div>
      </div>

      <div className="clients-table-container">
        <h3>Select Client to View Progress</h3>
        <Table
          columns={columns}
          data={clients}
          actions={actions}
          onAction={handleAction}
        />
      </div>

      {/* Progress Modal */}
      <Modal
        isOpen={showProgressModal}
        onClose={() => {
          setShowProgressModal(false);
          setSelectedClient(null);
          setProgressData([]);
          setSummaryData(null);
        }}
        title={`Progress Tracking - ${selectedClient?.patient?.name}`}
        size="xl"
      >
        {summaryData && (
          <div className="progress-modal">
            <div className="date-range-filter">
              <div className="date-input">
                <label>From:</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  className="date-picker"
                />
              </div>
              <div className="date-input">
                <label>To:</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  className="date-picker"
                />
              </div>
              <button 
                className="btn-primary"
                onClick={() => fetchClientProgress(selectedClient.patient.id)}
              >
                Update
              </button>
            </div>

            <div className="summary-cards">
              <div className="summary-card">
                <div className="summary-icon">
                  <Activity />
                </div>
                <div className="summary-details">
                  <span className="summary-label">Average Mood</span>
                  <span className="summary-value">{summaryData.averages?.mood || 0}/10</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">
                  <TrendingUp />
                </div>
                <div className="summary-details">
                  <span className="summary-label">Average Anxiety</span>
                  <span className="summary-value">{summaryData.averages?.anxiety || 0}/10</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">
                  <Award />
                </div>
                <div className="summary-details">
                  <span className="summary-label">Improvement</span>
                  <span className="summary-value">
                    {summaryData.improvements?.overall > 0 ? '+' : ''}
                    {summaryData.improvements?.overall || 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="chart-container">
              <h4>Mood & Anxiety Trends</h4>
              <LineChartComponent
                data={progressData}
                xKey="date"
                lines={[
                  { dataKey: 'moodScore', color: '#3498DB', name: 'Mood' },
                  { dataKey: 'anxietyScore', color: '#E74C3C', name: 'Anxiety' }
                ]}
              />
            </div>

            <div className="progress-timeline">
              <h4>Progress Timeline</h4>
              <div className="timeline">
                {progressData.map((entry, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-date">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-scores">
                        <span className="mood-score" style={{ background: '#3498DB' }}>
                          Mood: {entry.moodScore}/10
                        </span>
                        <span className="anxiety-score" style={{ background: '#E74C3C' }}>
                          Anxiety: {entry.anxietyScore}/10
                        </span>
                      </div>
                      {entry.progressLevel && (
                        <span 
                          className="progress-level"
                          style={{ background: getProgressLevelColor(entry.progressLevel) }}
                        >
                          {entry.progressLevel}
                        </span>
                      )}
                      {entry.notes && (
                        <p className="timeline-notes">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowProgressModal(false)}
              >
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  // Generate report
                  toast.success('Report generated');
                }}
              >
                Generate Full Report
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProgressTracking;
