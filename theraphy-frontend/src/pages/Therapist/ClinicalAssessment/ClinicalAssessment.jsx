import { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Eye, 
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/Common/Table';
import Modal from '../../../components/Common/Modal';
import { getMyClients, getClientAssessments, getAssessmentQuestions } from '../../../services/therapistApi';
import './ClinicalAssessment.css';

const ClinicalAssessment = () => {
  const [clients, setClients] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAssessments();
  }, [assessments, searchTerm, typeFilter]);

  const fetchData = async () => {
    try {
      const [clientsResponse] = await Promise.all([
        getMyClients()
      ]);
      setClients(clientsResponse.clients || []);
      
      // Fetch assessments for each client
      const allAssessments = [];
      for (const client of clientsResponse.clients || []) {
        try {
          const clientAssessments = await getClientAssessments(client.patient.id);
          allAssessments.push(...clientAssessments.map(a => ({
            ...a,
            clientName: client.patient.name,
            clientId: client.patient.id
          })));
        } catch (error) {
          console.log(`No assessments for client ${client.patient.name}`);
        }
      }
      setAssessments(allAssessments);

      // Fetch questions for reference
      const questionsResponse = await getAssessmentQuestions();
      setQuestions(questionsResponse.questions || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const filterAssessments = () => {
    let filtered = [...assessments];

    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }

    setFilteredAssessments(filtered);
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      low: { class: 'severity-low', icon: CheckCircle },
      mild: { class: 'severity-mild', icon: AlertTriangle },
      moderate: { class: 'severity-moderate', icon: AlertTriangle },
      severe: { class: 'severity-severe', icon: AlertTriangle },
      critical: { class: 'severity-critical', icon: AlertTriangle }
    };
    const badge = badges[severity] || badges.low;
    const Icon = badge.icon;
    return (
      <span className={`severity-badge ${badge.class}`}>
        <Icon size={12} />
        {severity}
      </span>
    );
  };

  const columns = [
    {
      header: 'Client',
      accessor: 'clientName'
    },
    {
      header: 'Assessment Type',
      accessor: 'type',
      render: (row) => (
        <span className="assessment-type">{row.type}</span>
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
              style={{ width: `${row.score}%` }}
            />
          </div>
          <span>{row.score}</span>
        </div>
      )
    },
    {
      header: 'Severity',
      accessor: 'severity',
      render: (row) => getSeverityBadge(row.severity)
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => (
        <div className="assessment-date">
          <Clock size={14} />
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      )
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
      icon: <Download size={18} />,
      label: 'Download Report',
      name: 'download',
      className: 'download'
    },
    {
      icon: <BarChart3 size={18} />,
      label: 'View Trends',
      name: 'trends',
      className: 'trends'
    }
  ];

  const handleAction = (actionName, row) => {
    setSelectedAssessment(row);
    switch (actionName) {
      case 'view':
        setShowAssessmentModal(true);
        break;
      case 'download':{
        // Handle download
        const dataStr = JSON.stringify(row, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `assessment-${row.clientName}-${new Date(row.createdAt).toLocaleDateString()}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        toast.success('Assessment downloaded');
        break;}
      case 'trends':
        toast.info('Viewing trends for ' + row.clientName);
        break;
      default:
        break;
    }
  };

  const getAverageScore = (clientId) => {
    const clientAssessments = assessments.filter(a => a.clientId === clientId);
    if (clientAssessments.length === 0) return 0;
    const sum = clientAssessments.reduce((acc, a) => acc + a.score, 0);
    return Math.round(sum / clientAssessments.length);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="clinical-assessment">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinical Assessment</h1>
          <p className="page-subtitle">Review client assessment results</p>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <ClipboardList size={24} />
          <div>
            <span className="stat-value">{assessments.length}</span>
            <span className="stat-label">Total Assessments</span>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <span className="stat-value">{clients.length}</span>
            <span className="stat-label">Clients</span>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <span className="stat-value">
              {Math.round(assessments.reduce((acc, a) => acc + a.score, 0) / (assessments.length || 1))}
            </span>
            <span className="stat-label">Avg Score</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by client or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <Filter size={18} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="anxiety">Anxiety</option>
            <option value="phobia">Phobia</option>
            <option value="depression">Depression</option>
            <option value="ocd">OCD</option>
          </select>
        </div>
      </div>

      <div className="assessments-table-container">
        <Table
          columns={columns}
          data={filteredAssessments}
          actions={actions}
          onAction={handleAction}
        />
      </div>

      {/* Assessment Details Modal */}
      <Modal
        isOpen={showAssessmentModal}
        onClose={() => {
          setShowAssessmentModal(false);
          setSelectedAssessment(null);
        }}
        title={`Assessment Details - ${selectedAssessment?.clientName}`}
        size="lg"
      >
        <div className="assessment-modal">
          <div className="assessment-header">
            <div className="header-info">
              <p><strong>Type:</strong> {selectedAssessment?.type}</p>
              <p><strong>Date:</strong> {new Date(selectedAssessment?.createdAt).toLocaleString()}</p>
              <p><strong>Overall Score:</strong> {selectedAssessment?.score}</p>
              <p><strong>Severity:</strong> {getSeverityBadge(selectedAssessment?.severity)}</p>
            </div>
          </div>

          <div className="responses-section">
            <h4>Question Responses</h4>
            <div className="responses-list">
              {selectedAssessment?.responses?.map((response, index) => {
                const question = questions.find(q => q.questionText === response.question);
                return (
                  <div key={index} className="response-item">
                    <div className="response-question">
                      <strong>Q{index + 1}:</strong> {response.question}
                    </div>
                    <div className="response-answer">
                      <span className="answer-text">{response.answer}</span>
                      <span className="answer-score">Score: {response.score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedAssessment?.notes && (
            <div className="notes-section">
              <h4>Clinical Notes</h4>
              <p>{selectedAssessment.notes}</p>
            </div>
          )}

          <div className="recommendations-section">
            <h4>Recommendations</h4>
            <ul>
              {selectedAssessment?.score > 70 && (
                <li>Consider immediate intervention and increased session frequency</li>
              )}
              {selectedAssessment?.score > 50 && (
                <li>Continue regular therapy sessions and monitor closely</li>
              )}
              {selectedAssessment?.score > 30 && (
                <li>Maintain current treatment plan</li>
              )}
              <li>Schedule follow-up assessment in 4-6 weeks</li>
            </ul>
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowAssessmentModal(false)}
            >
              Close
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                // Handle creating progress note
                toast.success('Creating progress note from assessment');
              }}
            >
              Create Progress Note
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClinicalAssessment;
