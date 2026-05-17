import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Eye,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/Common/Table';
import Modal from '../../../components/Common/Modal';
import { getMyAssessments, getAssessmentStats } from '../../../services/clientApi';
import './SelfAssessment.css';

const SelfAssessment = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assessmentsResponse, statsData] = await Promise.all([
        getMyAssessments(),
        getAssessmentStats().catch(() => null)
      ]);

      // Handle different response structures
      let assessmentsList = [];
      
      if (assessmentsResponse.data && Array.isArray(assessmentsResponse.data)) {
        // New structure: { success: true, count: X, data: [...] }
        assessmentsList = assessmentsResponse.data;
      } else if (assessmentsResponse.assessments && Array.isArray(assessmentsResponse.assessments)) {
        // Old structure: { count: X, assessments: [...] }
        assessmentsList = assessmentsResponse.assessments;
      } else if (Array.isArray(assessmentsResponse)) {
        // Direct array
        assessmentsList = assessmentsResponse;
      }
      
      setAssessments(assessmentsList);
      setStats(statsData);
      
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error('Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#10B981',
      mild: '#F59E0B',
      moderate: '#F97316',
      severe: '#EF4444',
      critical: '#7F1D1D'
    };
    return colors[severity] || '#6B7280';
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      mild: 'bg-yellow-100 text-yellow-800',
      moderate: 'bg-orange-100 text-orange-800',
      severe: 'bg-red-100 text-red-800',
      critical: 'bg-red-900 text-white'
    };
    return badges[severity] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const columns = [
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => (
        <div className="date-cell">
          <Calendar size={14} />
          {formatDate(row.createdAt)}
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (row) => (
        <span className="assessment-type">
          {row.type ? row.type.charAt(0).toUpperCase() + row.type.slice(1) : 'N/A'}
        </span>
      )
    },
    {
      header: 'Score',
      accessor: 'score',
      render: (row) => (
        <div className="score-display">
          <div className="score-bar">
            <div
              className="score-fill"
              style={{ 
                width: `${row.score || 0}%`, 
                backgroundColor: getSeverityColor(row.severity) 
              }}
            />
          </div>
          <span>{row.score || 0}</span>
        </div>
      )
    },
    {
      header: 'Severity',
      accessor: 'severity',
      render: (row) => (
        <span className={`severity-badge ${getSeverityBadge(row.severity)}`}>
          {row.severity ? row.severity.toUpperCase() : 'N/A'}
        </span>
      )
    }
  ];

  const actions = [
    {
      icon: <Eye size={18} />,
      label: 'View Details',
      name: 'view',
      className: 'view'
    }
  ];

  const handleAction = (actionName, row) => {
    if (actionName === 'view') {
      setSelectedAssessment(row);
      setShowDetailsModal(true);
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
    <div className="self-assessment">
      <div className="page-header">
        <div>
          <h1 className="page-title">Self Assessment</h1>
          <p className="page-subtitle">Track your mental health progress</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/client/assessments/take')}
        >
          <Plus size={20} />
          Take Assessment
        </button>
      </div>

      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <ClipboardList size={24} color="#8B5CF6" />
            <div>
              <span className="stat-value">{stats.totalAssessments || 0}</span>
              <span className="stat-label">Total Assessments</span>
            </div>
          </div>
          <div className="stat-card">
            <Activity size={24} color="#10B981" />
            <div>
              <span className="stat-value">{stats.averageScore || 0}</span>
              <span className="stat-label">Average Score</span>
            </div>
          </div>
          <div className="stat-card">
            <BarChart3 size={24} color="#3B82F6" />
            <div>
              <span className="stat-value">{stats.improvementPercentage || 0}%</span>
              <span className="stat-label">Improvement</span>
            </div>
          </div>
          <div className="stat-card">
            <AlertTriangle size={24} color="#F59E0B" />
            <div>
              <span className="stat-value">{stats.latestSeverity || 'N/A'}</span>
              <span className="stat-label">Latest Severity</span>
            </div>
          </div>
        </div>
      )}

      {stats?.severityBreakdown && (
        <div className="severity-breakdown">
          <h3>Severity Breakdown</h3>
          <div className="severity-bars">
            {Object.entries(stats.severityBreakdown).map(([key, value]) => (
              <div key={key} className="severity-bar-item">
                <span className="severity-label">{key}</span>
                <div className="severity-bar-container">
                  <div
                    className="severity-bar-fill"
                    style={{
                      width: `${(value / stats.totalAssessments) * 100}%`,
                      backgroundColor: getSeverityColor(key)
                    }}
                  />
                </div>
                <span className="severity-count">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="assessments-table-container">
        <h3>Assessment History</h3>
        {assessments.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} color="#9CA3AF" />
            <p>No assessments found</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/client/assessments/take')}
            >
              Take Your First Assessment
            </button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={assessments}
            actions={actions}
            onAction={handleAction}
          />
        )}
      </div>

      {/* Assessment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAssessment(null);
        }}
        title={`Assessment Details - ${selectedAssessment?.type}`}
        size="lg"
      >
        {selectedAssessment && (
          <div className="assessment-details-modal">
            <div className="details-header">
              <div className="detail-item">
                <span className="label">Date:</span>
                <span className="value">
                  {formatDate(selectedAssessment.createdAt)}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Score:</span>
                <span className="value">{selectedAssessment.score}</span>
              </div>
              <div className="detail-item">
                <span className="label">Severity:</span>
                <span className={`severity-badge ${getSeverityBadge(selectedAssessment.severity)}`}>
                  {selectedAssessment.severity?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="responses-section">
              <h4>Your Responses</h4>
              <div className="responses-list">
                {selectedAssessment.responses?.map((response, index) => (
                  <div key={index} className="response-item">
                    <p className="response-question">
                      <strong>Q{index + 1}:</strong> {response.question}
                    </p>
                    <div className="response-answer">
                      <span className="answer-text">{response.answer}</span>
                      <span className="answer-score">Score: {response.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedAssessment.notes && (
              <div className="notes-section">
                <h4>Clinical Notes</h4>
                <p>{selectedAssessment.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SelfAssessment;