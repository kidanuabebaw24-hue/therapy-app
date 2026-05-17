import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Activity,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Brain,
  Video,
  CreditCard,
  ArrowRight,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatsCard from '../../../components/Dashboard/StatsCard';
import { LineChartComponent } from '../../../components/Dashboard/Charts';
import { getClientDashboardStats, getMoodHistory } from '../../../services/clientApi';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    completedAssessments: 0,
    moodEntries: 0,
    averageMood: 0,
    nextSession: null
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    setGreeting(getGreeting());
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchDashboardData = async () => {
    try {
      const [dashboardStats, moodHistory] = await Promise.all([
        getClientDashboardStats(),
        getMoodHistory().catch(() => [])
      ]);

      setStats(dashboardStats.stats);
      setRecentActivity(dashboardStats.recentActivity || []);

      // Format mood data for chart
      const last7Days = moodHistory.slice(-7).map(m => ({
        date: new Date(m.createdAt).toLocaleDateString().slice(0, 5),
        mood: m.moodScore,
        anxiety: m.anxietyLevel || 0
      }));
      setMoodData(last7Days);
    } catch (error) {
      console.log(error)
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: <ClipboardList size={20} />,
      label: 'Take Assessment',
      path: '/client/assessments',
      color: '#8B5CF6'
    },
    {
      icon: <Activity size={20} />,
      label: 'Log Mood',
      path: '/client/mood',
      color: '#10B981'
    },
    {
      icon: <Calendar size={20} />,
      label: 'Book Session',
      path: '/client/sessions/book',
      color: '#3B82F6'
    },
    {
      icon: <Brain size={20} />,
      label: 'CBT Exercises',
      path: '/client/therapy/cbt',
      color: '#EC4899'
    }
  ];

  const cards = [
    {
      title: 'Upcoming Sessions',
      value: stats.upcomingSessions,
      icon: Calendar,
      color: '#3B82F6',
      path: '/client/sessions'
    },
    {
      title: 'Assessments Done',
      value: stats.completedAssessments,
      icon: ClipboardList,
      color: '#8B5CF6',
      path: '/client/assessments'
    },
    {
      title: 'Mood Entries',
      value: stats.moodEntries,
      icon: Activity,
      color: '#10B981',
      path: '/client/mood'
    },
    {
      title: 'Average Mood',
      value: `${stats.averageMood}/10`,
      icon: Heart,
      color: '#EC4899',
      path: '/client/progress'
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
    <div className="client-dashboard">
      <div className="welcome-section">
        <div>
          <h1 className="page-title">{greeting}, {user.name?.split(' ')[0] || 'Client'}</h1>
          <p className="welcome-text">Here's your mental wellness summary</p>
        </div>
        {stats.nextSession && (
          <div className="next-session-card">
            <Clock size={18} />
            <div>
              <span>Next Session</span>
              <strong>{new Date(stats.nextSession.date).toLocaleString()}</strong>
            </div>
            <button onClick={() => navigate('/client/sessions')}>View</button>
          </div>
        )}
      </div>

      <div className="stats-grid">
        {cards.map((card, index) => (
          <div key={index} onClick={() => navigate(card.path)} className="stat-card-wrapper">
            <StatsCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="chart-card">
          <h3>Mood Trend (Last 7 Days)</h3>
          {moodData.length > 0 ? (
            <LineChartComponent
              data={moodData}
              xKey="date"
              lines={[
                { dataKey: 'mood', color: '#10B981', name: 'Mood' },
                { dataKey: 'anxiety', color: '#EF4444', name: 'Anxiety' }
              ]}
            />
          ) : (
            <div className="no-data-chart">
              <Activity size={40} />
              <p>No mood data yet. <button onClick={() => navigate('/client/mood')}>Log your first mood</button></p>
            </div>
          )}
        </div>

        <div className="quick-actions-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={() => navigate(action.path)}
                style={{ '--action-color': action.color }}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="recent-activity-card">
          <h3>Recent Activity</h3>
          <div className="activity-timeline">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'assessment' && <ClipboardList size={16} />}
                    {activity.type === 'mood' && <Activity size={16} />}
                    {activity.type === 'session' && <Calendar size={16} />}
                  </div>
                  <div className="activity-content">
                    <p>{activity.description}</p>
                    <span>{new Date(activity.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-activity">No recent activity</p>
            )}
          </div>
        </div>

        <div className="recommendations-card">
          <h3>Recommended for You</h3>
          <div className="recommendations-list">
            {!stats.completedAssessments && (
              <div className="recommendation-item">
                <AlertTriangle size={18} color="#F59E0B" />
                <div>
                  <strong>Complete your first assessment</strong>
                  <p>Help us understand your needs better</p>
                </div>
                <button onClick={() => navigate('/client/assessments')}>Start</button>
              </div>
            )}
            {stats.averageMood < 5 && (
              <div className="recommendation-item">
                <Brain size={18} color="#10B981" />
                <div>
                  <strong>Try CBT Exercises</strong>
                  <p>Research shows CBT helps improve mood</p>
                </div>
                <button onClick={() => navigate('/client/therapy/cbt')}>Explore</button>
              </div>
            )}
            {!stats.nextSession && (
              <div className="recommendation-item">
                <Calendar size={18} color="#3B82F6" />
                <div>
                  <strong>Book a therapy session</strong>
                  <p>Connect with a therapist today</p>
                </div>
                <button onClick={() => navigate('/client/sessions/book')}>Book Now</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;