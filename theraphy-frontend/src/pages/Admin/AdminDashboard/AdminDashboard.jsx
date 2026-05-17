import { useState, useEffect } from 'react';
import { 
  Users, UserCheck, Calendar, CreditCard, 
  ClipboardList, AlertTriangle, DollarSign, Activity 
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatsCard from '../../../components/Dashboard/StatsCard';
import { 
  LineChartComponent, 
  BarChartComponent, 
  PieChartComponent 
} from '../../../components/Dashboard/Charts';
import { getSystemStats, getSystemAnalytics } from '../../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTherapists: 0,
    totalClients: 0,
    totalSessions: 0,
    totalPayments: 0,
    totalAssessments: 0,
    pendingEmergencies: 0,
    totalRevenue: 0
  });
  
  const [analytics, setAnalytics] = useState({
    monthlyStats: [],
    therapistStats: [],
    assessmentDistribution: []
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, analyticsData] = await Promise.all([
        getSystemStats(),
        getSystemAnalytics()
      ]);
      
      setStats(statsData);
      
      // Transform analytics data for charts
      setAnalytics({
        monthlyStats: analyticsData.monthlyStats?.map(stat => ({
          month: `${stat.id?.month}/${stat.id?.year}`,
          sessions: stat.sessions || 0,
          completed: stat.completed || 0
        })) || [],
        
        therapistStats: analyticsData.therapistStats?.map(stat => ({
          name: stat.therapistInfo?.name || 'Unknown',
          sessions: stat.sessions || 0,
          rating: (stat.avgRating || 0).toFixed(1)
        })) || [],
        
        assessmentDistribution: [
          { name: 'Anxiety', value: statsData.totalAssessments ? Math.floor(statsData.totalAssessments * 0.4) : 0 },
          { name: 'Depression', value: statsData.totalAssessments ? Math.floor(statsData.totalAssessments * 0.3) : 0 },
          { name: 'Phobia', value: statsData.totalAssessments ? Math.floor(statsData.totalAssessments * 0.2) : 0 },
          { name: 'General', value: statsData.totalAssessments ? Math.floor(statsData.totalAssessments * 0.1) : 0 },
        ]
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: '#0054A6' },
    { title: 'Therapists', value: stats.totalTherapists, icon: UserCheck, color: '#4D7EB3' },
    { title: 'Clients', value: stats.totalClients, icon: Users, color: '#10B981' },
    { title: 'Sessions', value: stats.totalSessions, icon: Calendar, color: '#F59E0B' },
    { title: 'Payments', value: stats.totalPayments, icon: CreditCard, color: '#8B5CF6' },
    { title: 'Assessments', value: stats.totalAssessments, icon: ClipboardList, color: '#EC4899' },
    { title: 'Pending Emergencies', value: stats.pendingEmergencies, icon: AlertTriangle, color: '#EF4444' },
    { title: 'Revenue', value: `$${stats.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: '#0054A6' },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div className="stats-grid">
        {cards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      <div className="charts-grid">
        <LineChartComponent 
          data={analytics.monthlyStats}
          xKey="month"
          lines={[
            { dataKey: 'sessions', color: '#0054A6', name: 'Total Sessions' },
            { dataKey: 'completed', color: '#10B981', name: 'Completed' }
          ]}
          title="Monthly Sessions Trend"
        />

        <BarChartComponent 
          data={analytics.therapistStats.slice(0, 5)}
          xKey="name"
          bars={[
            { dataKey: 'sessions', color: '#0054A6', name: 'Sessions' }
          ]}
          title="Top 5 Therapists by Sessions"
        />
      </div>

      <div className="charts-grid">
        <PieChartComponent 
          data={analytics.assessmentDistribution}
          title="Assessment Distribution by Category"
        />

        <div className="summary-card">
          <h3 className="summary-title">Key Metrics</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Session Completion Rate</span>
              <span className="summary-value">
                {stats.totalSessions > 0 
                  ? `${Math.round((analytics.monthlyStats?.reduce((acc, curr) => acc + (curr.completed || 0), 0) / stats.totalSessions) * 100)}%` 
                  : '0%'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Avg Sessions/Therapist</span>
              <span className="summary-value">
                {stats.totalTherapists > 0 
                  ? Math.round(stats.totalSessions / stats.totalTherapists) 
                  : 0}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Avg Revenue/Session</span>
              <span className="summary-value">
                ${stats.totalSessions > 0 
                  ? Math.round(stats.totalRevenue / stats.totalSessions) 
                  : 0}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Emergency Response Rate</span>
              <span className="summary-value">
                {stats.pendingEmergencies > 0 
                  ? `${Math.round(((stats.pendingEmergencies) / (stats.pendingEmergencies + 1)) * 100)}%` 
                  : '100%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
