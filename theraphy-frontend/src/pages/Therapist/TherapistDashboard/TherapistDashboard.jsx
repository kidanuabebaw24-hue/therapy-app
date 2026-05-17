import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Brain,
  FileText,
  ClipboardList,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatsCard from '../../../components/Dashboard/StatsCard';
import { getMyClients, getTherapistSessions } from '../../../services/therapistApi';
import './TherapistDashboard.css';

const TherapistDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    todaySessions: 0,
    pendingSessions: 0,
    completedSessions: 0,
    pendingEmergencies: 0,
    averageProgress: 0
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    setGreeting(getGreeting());
    fetchDashboardData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchDashboardData = async () => {
    try {
      const [clientsResponse, sessionsResponse] = await Promise.all([
        getMyClients(),
        getTherapistSessions()
      ]);

      const clients = clientsResponse.clients || [];
      const sessions = sessionsResponse.sessions || [];

      // Calculate stats
      const today = new Date().toDateString();
      const todaySessions = sessions.filter(s => 
        new Date(s.date).toDateString() === today
      );
      
      const pendingSessions = sessions.filter(s => 
        s.status === 'scheduled' && new Date(s.date) > new Date()
      );
      
      const completedSessions = sessions.filter(s => 
        s.status === 'completed'
      );

      // Mock emergency count - replace with actual API call
      const pendingEmergencies = 0;

      // Mock progress - replace with actual calculation
      const averageProgress = 75;

      setStats({
        totalClients: clients.length,
        todaySessions: todaySessions.length,
        pendingSessions: pendingSessions.length,
        completedSessions: completedSessions.length,
        pendingEmergencies,
        averageProgress
      });

      // Get recent sessions (last 5)
      setRecentSessions(sessions.slice(0, 5));
      
      // Get upcoming sessions (next 5)
      setUpcomingSessions(
        sessions
          .filter(s => s.status === 'scheduled' && new Date(s.date) > new Date())
          .slice(0, 5)
      );

    } catch (error) {
      console.log(error)
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: '#3498DB',
      trend: +12,
      path: '/therapist/clients'
    },
    {
      title: "Today's Sessions",
      value: stats.todaySessions,
      icon: Calendar,
      color: '#2ECC71',
      trend: stats.todaySessions > 0 ? +stats.todaySessions : 0,
      path: '/therapist/sessions'
    },
    {
      title: 'Pending Sessions',
      value: stats.pendingSessions,
      icon: Clock,
      color: '#F39C12',
      path: '/therapist/sessions?filter=pending'
    },
    {
      title: 'Completed Sessions',
      value: stats.completedSessions,
      icon: CheckCircle,
      color: '#27AE60',
      trend: +8,
      path: '/therapist/sessions?filter=completed'
    },
    {
      title: 'Pending Emergencies',
      value: stats.pendingEmergencies,
      icon: AlertTriangle,
      color: '#E74C3C',
      path: '/therapist/emergency'
    },
    {
      title: 'Avg. Progress',
      value: `${stats.averageProgress}%`,
      icon: TrendingUp,
      color: '#9B59B6',
      trend: +5,
      path: '/therapist/progress'
    }
  ];

  const quickActions = [
    {
      icon: <FileText size={20} />,
      label: 'Add Session Notes',
      path: '/therapist/documentation',
      color: '#3498DB'
    },
    {
      icon: <Activity size={20} />,
      label: 'Start Exposure Session',
      path: '/therapist/modules',
      color: '#E74C3C'
    },
    {
      icon: <Brain size={20} />,
      label: 'Create CBT Exercise',
      path: '/therapist/cbt',
      color: '#9B59B6'
    },
    {
      icon: <ClipboardList size={20} />,
      label: 'Review Assessments',
      path: '/therapist/assessments',
      color: '#F39C12'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="therapist-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>{greeting}, Dr. {user.name?.split(' ')[0] || 'Therapist'}</h1>
          <p>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        <div className="verification-badge">
          {user.isVerified ? (
            <span className="verified">
              <CheckCircle size={16} />
              Verified Therapist
            </span>
          ) : (
            <span className="unverified">
              <AlertTriangle size={16} />
              Pending Verification
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className="stat-card-wrapper"
            onClick={() => navigate(card.path)}
          >
            <StatsCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              trend={card.trend}
            />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Upcoming Sessions */}
        <div className="dashboard-card upcoming-sessions">
          <div className="card-header">
            <h3>
              <Calendar size={18} />
              Upcoming Sessions
            </h3>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/therapist/sessions')}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="session-list">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session, index) => (
                <div key={index} className="session-item">
                  <div className="session-time">
                    {new Date(session.date).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="session-info">
                    <strong>{session.client?.name}</strong>
                    <span>{session.type}</span>
                  </div>
                  <span className="session-duration">{session.duration}min</span>
                </div>
              ))
            ) : (
              <p className="no-data">No upcoming sessions</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <div className="card-header">
            <h3>
              <Activity size={18} />
              Quick Actions
            </h3>
          </div>
          
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="action-btn"
                onClick={() => navigate(action.path)}
                style={{ '--action-color': action.color }}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card recent-activity">
          <div className="card-header">
            <h3>
              <Clock size={18} />
              Recent Sessions
            </h3>
          </div>
          
          <div className="activity-list">
            {recentSessions.length > 0 ? (
              recentSessions.map((session, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {session.status === 'completed' ? (
                      <CheckCircle size={16} color="#27AE60" />
                    ) : (
                      <Clock size={16} color="#F39C12" />
                    )}
                  </div>
                  <div className="activity-details">
                    <strong>{session.client?.name}</strong>
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <span className={`activity-status ${session.status}`}>
                    {session.status}
                         </span>
                </div>
              ))
            ) : (
              <p className="no-data">No recent sessions</p>
            )}
          </div>
        </div>

        {/* Client Progress Overview  yhe part ke backend gar megenaget alebet  */}
        <div className="dashboard-card client-progress">
          <div className="card-header">
            <h3>
              <TrendingUp size={18} />
              Client Progress Overview
            </h3>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/therapist/progress')}
            >
              View Details <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="progress-list">
            <div className="progress-item">
              <div className="progress-client">
                <span className="client-name">Sarah Johnson</span>
                <span className="progress-value">85%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '85%' }}></div>
              </div>
              <span className="progress-trend positive">↑ 12%</span>
            </div>
            
            <div className="progress-item">
              <div className="progress-client">
                <span className="client-name">Michael Chen</span>
                <span className="progress-value">62%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '62%' }}></div>
              </div>
              <span className="progress-trend positive">↑ 5%</span>
            </div>
            
            <div className="progress-item">
              <div className="progress-client">
                <span className="client-name">Emma Wilson</span>
                <span className="progress-value">45%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '45%' }}></div>
              </div>
              <span className="progress-trend neutral">→ 0%</span>
            </div>
            
            <div className="progress-item">
              <div className="progress-client">
                <span className="client-name">David Brown</span>
                <span className="progress-value">78%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '78%' }}></div>
              </div>
              <span className="progress-trend positive">↑ 8%</span>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="dashboard-card today-schedule">
          <div className="card-header">
            <h3>
              <Calendar size={18} />
              Today's Schedule
            </h3>
          </div>
          
          <div className="schedule-timeline">
            {stats.todaySessions > 0 ? (
              <>
                <div className="timeline-item current">
                  <div className="timeline-time">10:00 AM</div>
                  <div className="timeline-content">
                    <strong>Session with Sarah Johnson</strong>
                    <span>CBT Therapy - 60 min</span>
                    <button className="start-session-btn">Start Session</button>
                  </div>
                </div>
                
                <div className="timeline-item">
                  <div className="timeline-time">11:30 AM</div>
                  <div className="timeline-content">
                    <strong>Session with Michael Chen</strong>
                    <span>Exposure Therapy - 45 min</span>
                  </div>
                </div>
                
                <div className="timeline-item">
                  <div className="timeline-time">2:00 PM</div>
                  <div className="timeline-content">
                    <strong>Session with Emma Wilson</strong>
                    <span>Follow-up - 30 min</span>
                  </div>
                </div>
                
                <div className="timeline-item">
                  <div className="timeline-time">4:30 PM</div>
                  <div className="timeline-content">
                    <strong>Session with David Brown</strong>
                    <span>Initial Consultation - 60 min</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="no-data">No sessions scheduled for today</p>
            )}
          </div>
        </div>

        {/* Recent Assessments   yhe part ke backend gar megenaget alebet*/}
        <div className="dashboard-card recent-assessments">
          <div className="card-header">
            <h3>
              <ClipboardList size={18} />
              Recent Assessments
            </h3>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/therapist/assessments')}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="assessment-list">
            <div className="assessment-item">
              <div className="assessment-info">
                <strong>Anxiety Assessment</strong>
                <span>Sarah Johnson</span>
              </div>
              <div className="assessment-score">
                <span className="score-value">72</span>
                <span className="severity-badge moderate">Moderate</span>
              </div>
            </div>
            
            <div className="assessment-item">
              <div className="assessment-info">
                <strong>Phobia Assessment</strong>
                <span>Michael Chen</span>
              </div>
              <div className="assessment-score">
                <span className="score-value">85</span>
                <span className="severity-badge severe">Severe</span>
              </div>
            </div>
            
            <div className="assessment-item">
              <div className="assessment-info">
                <strong>Depression Assessment</strong>
                <span>Emma Wilson</span>
              </div>
              <div className="assessment-score">
                <span className="score-value">45</span>
                <span className="severity-badge mild">Mild</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Alerts */}
        {stats.pendingEmergencies > 0 && (
          <div className="dashboard-card emergency-alerts">
            <div className="card-header">
              <h3>
                <AlertTriangle size={18} color="#E74C3C" />
                Emergency Alerts
              </h3>
            </div>
            
            <div className="emergency-list">
              <div className="emergency-item critical">
                <AlertTriangle size={20} />
                <div className="emergency-info">
                  <strong>Critical Alert - Sarah Johnson</strong>
                  <p>Client reported severe anxiety attack. Immediate attention required.</p>
                </div>
                <button className="handle-btn">Handle</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Summary  yhe ke backend gar megenaget alabet*/}
      <div className="weekly-summary">
        <h3>Weekly Summary</h3>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-label">Sessions Completed</span>
            <span className="stat-number">{stats.completedSessions}</span>
            <span className="stat-change positive">↑ 3 vs last week</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">New Clients</span>
            <span className="stat-number">2</span>
            <span className="stat-change positive">↑ 1 vs last week</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Avg Session Duration</span>
            <span className="stat-number">52 min</span>
            <span className="stat-change neutral">→ Same</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Client Progress</span>
            <span className="stat-number">78%</span>
            <span className="stat-change positive">↑ 5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;