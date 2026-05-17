import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  Heart,
  Calendar,
  Download,
  Eye,
  BarChart3,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/Common/Table';
import Modal from '../../../components/Common/Modal';
import { LineChartComponent, BarChartComponent } from '../../../components/Dashboard/Charts';
import {
  getMyProgress,
  getProgressSummary,
  getMyReports,
  getMoodHistory,
  getMyAssessments
} from '../../../services/clientApi';
import './Progress.css';

const Progress = () => {
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, [timeRange]);

const fetchProgressData = async () => {
  try {
    setLoading(true);
    
    // Use Promise.allSettled to handle individual failures
    const results = await Promise.allSettled([
      getMyProgress(),
      getProgressSummary(),
      getMyReports().catch(() => []),
      getMoodHistory(),
      getMyAssessments().catch(() => ({}))
    ]);

    // Handle each result separately
    if (results[0].status === 'fulfilled') {
      setProgressData(results[0].value.timelineData || []);
    } else {
      console.error('Progress timeline failed:', results[0].reason);
    }

    if (results[1].status === 'fulfilled') {
      setSummary(results[1].value);
    } else {
      console.error('Progress summary failed:', results[1].reason);
    }

    setReports(results[2].status === 'fulfilled' ? results[2].value : []);
    setMoodHistory(results[3].status === 'fulfilled' ? results[3].value : []);
    setAssessments(results[4].status === 'fulfilled' ? results[4].value.assessments || [] : []);

  } catch (error) {
    console.error('Error in fetchProgressData:', error);
    toast.error('Failed to fetch some progress data');
  } finally {
    setLoading(false);
  }
};
  const getProgressLevelColor = (level) => {
    const colors = {
      'worse': '#EF4444',
      'same': '#F59E0B',
      'improving': '#3B82F6',
      'significantly improved': '#10B981'
    };
    return colors[level] || '#6B7280';
  };

  const getProgressLevelIcon = (level) => {
    switch (level) {
      case 'worse': return <TrendingUp size={16} style={{ transform: 'rotate(180deg)' }} />;
      case 'same': return <Activity size={16} />;
      case 'improving': return <TrendingUp size={16} />;
      case 'significantly improved': return <Award size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const chartData = progressData.slice(-30).map(entry => ({
    date: new Date(entry.date).toLocaleDateString().slice(0, 5),
    mood: entry.moodScore,
    anxiety: entry.anxietyScore
  }));

  const reportsColumns = [
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      header: 'Period',
      accessor: 'period',
      render: (row) => (
        <span>
          {new Date(row.period?.startDate).toLocaleDateString()} - {new Date(row.period?.endDate).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Mood Avg',
      accessor: 'averageMoodScore',
      render: (row) => (
        <span className="score-badge">{row.averageMoodScore?.toFixed(1) || 0}/10</span>
      )
    },
    {
      header: 'Anxiety Avg',
      accessor: 'averageAnxietyScore',
      render: (row) => (
        <span className="score-badge">{row.averageAnxietyScore?.toFixed(1) || 0}/10</span>
      )
    },
    {
      header: 'Improvement',
      accessor: 'improvementPercentage',
      render: (row) => (
        <span className={`improvement-badge ${row.improvementPercentage > 0 ? 'positive' : 'negative'}`}>
          {row.improvementPercentage > 0 ? '+' : ''}{row.improvementPercentage}%
        </span>
      )
    }
  ];

  const reportsActions = [
    {
      icon: <Eye size={18} />,
      label: 'View Report',
      name: 'view',
      className: 'view'
    },
    {
      icon: <Download size={18} />,
      label: 'Download',
      name: 'download',
      className: 'download'
    }
  ];

  const handleReportAction = (actionName, row) => {
    if (actionName === 'view') {
      setSelectedReport(row);
      setShowReportModal(true);
    } else if (actionName === 'download') {
      const dataStr = JSON.stringify(row, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', `progress-report-${new Date(row.createdAt).toLocaleDateString()}.json`);
      link.click();
      toast.success('Report downloaded');
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
    <div className="client-progress">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Progress</h1>
          <p className="page-subtitle">Track your mental wellness journey</p>
        </div>
      </div>

      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#10B98120', color: '#10B981' }}>
              <Heart size={24} />
            </div>
            <div className="summary-details">
              <span className="summary-label">Current Mood</span>
              <span className="summary-value">{summary.currentStatus?.mood || 0}/10</span>
              <span className="summary-trend">
                {summary.improvements?.mood > 0 ? '+' : ''}{summary.improvements?.mood}
              </span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#EF444420', color: '#EF4444' }}>
              <Activity size={24} />
            </div>
            <div className="summary-details">
              <span className="summary-label">Current Anxiety</span>
              <span className="summary-value">{summary.currentStatus?.anxiety || 0}/10</span>
              <span className="summary-trend negative">
                {summary.improvements?.anxiety > 0 ? '-' : ''}{Math.abs(summary.improvements?.anxiety || 0)}
              </span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#8B5CF620', color: '#8B5CF6' }}>
              <Calendar size={24} />
            </div>
            <div className="summary-details">
              <span className="summary-label">Days Tracked</span>
              <span className="summary-value">{summary.period?.days || 0}</span>
              <span className="summary-trend">days</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#F59E0B20', color: '#F59E0B' }}>
              <Award size={24} />
            </div>
            <div className="summary-details">
              <span className="summary-label">Progress Level</span>
              <span className="summary-value">{summary.currentStatus?.progressLevel || 'N/A'}</span>
              <span className="summary-trend">
                {getProgressLevelIcon(summary.currentStatus?.progressLevel)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="chart-controls">
        <h3>Mood & Anxiety Trends</h3>
        <div className="time-range-selector">
          <button
            className={`range-btn ${timeRange === '7days' ? 'active' : ''}`}
            onClick={() => setTimeRange('7days')}
          >
            7 Days
          </button>
          <button
            className={`range-btn ${timeRange === '30days' ? 'active' : ''}`}
            onClick={() => setTimeRange('30days')}
          >
            30 Days
          </button>
          <button
            className={`range-btn ${timeRange === '90days' ? 'active' : ''}`}
            onClick={() => setTimeRange('90days')}
          >
            90 Days
          </button>
        </div>
      </div>

      <div className="chart-card">
        {chartData.length > 0 ? (
          <LineChartComponent
            data={chartData}
            xKey="date"
            lines={[
              { dataKey: 'mood', color: '#10B981', name: 'Mood' },
              { dataKey: 'anxiety', color: '#EF4444', name: 'Anxiety' }
            ]}
          />
        ) : (
          <div className="no-data">
            <Activity size={48} />
            <p>No trend data available</p>
          </div>
        )}
      </div>

      <div className="insights-grid">
        <div className="insight-card">
          <h4>Mood Distribution</h4>
          <BarChartComponent
            data={[
              { range: 'High (8-10)', count: moodHistory.filter(m => m.moodScore >= 8).length },
              { range: 'Medium (5-7)', count: moodHistory.filter(m => m.moodScore >= 5 && m.moodScore <= 7).length },
              { range: 'Low (1-4)', count: moodHistory.filter(m => m.moodScore <= 4).length }
            ]}
            xKey="range"
            bars={[{ dataKey: 'count', color: '#10B981' }]}
          />
        </div>

        <div className="insight-card">
          <h4>Assessment Progress</h4>
          <div className="assessment-progress">
            {assessments.slice(0, 5).map((assessment, index) => (
              <div key={index} className="assessment-item" onClick={() => navigate('/client/assessments')}>
                <div>
                  <strong>{assessment.type}</strong>
                  <span>{new Date(assessment.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="assessment-score">
                  <span className="score">{assessment.score}</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
            {assessments.length === 0 && (
              <p className="no-items">No assessments taken yet</p>
            )}
          </div>
        </div>

        <div className="insight-card">
          <h4>Key Insights</h4>
          <div className="insights-list">
            {summary && (
              <>
                <div className="insight-item">
                  <Clock size={16} />
                  <span>Average mood: {summary.averages?.mood || 0}/10</span>
                </div>
                <div className="insight-item">
                  <Activity size={16} />
                  <span>Average anxiety: {summary.averages?.anxiety || 0}/10</span>
                </div>
                <div className="insight-item">
                  <Calendar size={16} />
                  <span>Consistency: {summary.consistency?.entriesPerWeek || 0} entries/week</span>
                </div>
                <div className="insight-item">
                  <Award size={16} />
                  <span>Overall improvement: {summary.improvements?.overall || 0}%</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="reports-section">
        <h3>Progress Reports</h3>
        <Table
          columns={reportsColumns}
          data={reports}
          actions={reportsActions}
          onAction={handleReportAction}
        />
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedReport(null);
        }}
        title="Progress Report"
        size="lg"
      >
        {selectedReport && (
          <div className="report-modal">
            <div className="report-header">
              <h4>Progress Report</h4>
              <p>Generated on {new Date(selectedReport.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="report-period">
              <strong>Period:</strong>
              <span>{new Date(selectedReport.period?.startDate).toLocaleDateString()} - {new Date(selectedReport.period?.endDate).toLocaleDateString()}</span>
            </div>

            <div className="report-stats">
              <div className="stat-row">
                <span>Sessions Completed:</span>
                <strong>{selectedReport.sessionsCompleted}</strong>
              </div>
              <div className="stat-row">
                <span>Average Mood:</span>
                <strong>{selectedReport.averageMoodScore?.toFixed(1)}/10</strong>
              </div>
              <div className="stat-row">
                <span>Average Anxiety:</span>
                <strong>{selectedReport.averageAnxietyScore?.toFixed(1)}/10</strong>
              </div>
              <div className="stat-row">
                <span>Improvement:</span>
                <strong className={selectedReport.improvementPercentage > 0 ? 'positive' : 'negative'}>
                  {selectedReport.improvementPercentage > 0 ? '+' : ''}{selectedReport.improvementPercentage}%
                </strong>
              </div>
            </div>

            {selectedReport.keyFindings && (
              <div className="report-section">
                <h5>Key Findings</h5>
                <p>{selectedReport.keyFindings}</p>
              </div>
            )}

            {selectedReport.recommendations && (
              <div className="report-section">
                <h5>Recommendations</h5>
                <p>{selectedReport.recommendations}</p>
              </div>
            )}

            {selectedReport.goalsAchieved?.length > 0 && (
              <div className="report-section">
                <h5>Goals Achieved</h5>
                <ul>
                  {selectedReport.goalsAchieved.map((goal, i) => (
                    <li key={i}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedReport.nextGoals?.length > 0 && (
              <div className="report-section">
                <h5>Next Goals</h5>
                <ul>
                  {selectedReport.nextGoals.map((goal, i) => (
                    <li key={i}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Progress;