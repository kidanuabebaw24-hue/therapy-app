import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar,
  Download,
  RefreshCw,
  Users,
  Activity,
  Brain
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  LineChartComponent, 
  BarChartComponent, 
  PieChartComponent,
  AreaChartComponent 
} from '../../../components/Dashboard/Charts';
import { getMyClients, getClientMoodHistory } from '../../../services/therapistApi';
import './DataVisualization.css';

const DataVisualization = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [assessmentData, setAssessmentData] = useState([]);
  const [timeRange, setTimeRange] = useState('30days'); // 7days, 30days, 90days
  const [chartType, setChartType] = useState('line');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchVisualizationData();
    }
  }, [selectedClient, timeRange]);

  const fetchClients = async () => {
    try {
      const response = await getMyClients();
      setClients(response.clients || []);
      if (response.clients?.length > 0) {
        setSelectedClient(response.clients[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchVisualizationData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockMoodData = generateMockMoodData();
      const mockAssessmentData = generateMockAssessmentData();
      
      setMoodData(mockMoodData);
      setAssessmentData(mockAssessmentData);
    } catch (error) {
      toast.error('Failed to fetch visualization data');
    }
  };

  const generateMockMoodData = () => {
    const data = [];
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString(),
        mood: Math.floor(Math.random() * 5) + 5, // 5-10
        anxiety: Math.floor(Math.random() * 5) + 3, // 3-8
        sleep: Math.floor(Math.random() * 4) + 6, // 6-10
        energy: Math.floor(Math.random() * 5) + 5 // 5-10
      });
    }
    return data;
  };

  const generateMockAssessmentData = () => {
    return [
      { name: 'Anxiety', score: 65 },
      { name: 'Depression', score: 45 },
      { name: 'Phobia', score: 55 },
      { name: 'Stress', score: 70 },
      { name: 'Well-being', score: 60 }
    ];
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case '90days': return 'Last 90 Days';
      default: return 'Last 30 Days';
    }
  };

  const handleExportData = () => {
    const exportData = {
      client: selectedClient?.patient?.name,
      timeRange: getTimeRangeLabel(),
      moodData,
      assessmentData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `client-data-${selectedClient?.patient?.name}-${new Date().toLocaleDateString()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Data exported successfully');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="data-visualization">
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Visualization</h1>
          <p className="page-subtitle">Visualize client progress and patterns</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={handleExportData}
          >
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      <div className="controls-section">
        <div className="client-selector">
          <label>Select Client:</label>
          <select
            value={selectedClient?.patient?.id || ''}
            onChange={(e) => {
              const client = clients.find(c => c.patient.id === e.target.value);
              setSelectedClient(client);
            }}
            className="client-select"
          >
            {clients.map(client => (
              <option key={client.patient.id} value={client.patient.id}>
                {client.patient.name}
              </option>
            ))}
          </select>
        </div>

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

        <div className="chart-type-selector">
          <button
            className={`type-btn ${chartType === 'line' ? 'active' : ''}`}
            onClick={() => setChartType('line')}
          >
            <TrendingUp size={16} />
            Line
          </button>
          <button
            className={`type-btn ${chartType === 'bar' ? 'active' : ''}`}
            onClick={() => setChartType('bar')}
          >
            <BarChart3 size={16} />
            Bar
          </button>
          <button
            className={`type-btn ${chartType === 'area' ? 'active' : ''}`}
            onClick={() => setChartType('area')}
          >
            <Activity size={16} />
            Area
          </button>
        </div>
      </div>

      <div className="visualization-grid">
        <div className="chart-card">
          <h3>Mood & Anxiety Trends - {getTimeRangeLabel()}</h3>
          {chartType === 'line' && (
            <LineChartComponent
              data={moodData}
              xKey="date"
              lines={[
                { dataKey: 'mood', color: '#3498DB', name: 'Mood' },
                { dataKey: 'anxiety', color: '#E74C3C', name: 'Anxiety' },
                { dataKey: 'sleep', color: '#9B59B6', name: 'Sleep' },
                { dataKey: 'energy', color: '#27AE60', name: 'Energy' }
              ]}
            />
          )}
          {chartType === 'bar' && (
            <BarChartComponent
              data={moodData.slice(-10)}
              xKey="date"
              bars={[
                { dataKey: 'mood', color: '#3498DB', name: 'Mood' },
                { dataKey: 'anxiety', color: '#E74C3C', name: 'Anxiety' }
              ]}
            />
          )}
          {chartType === 'area' && (
            <AreaChartComponent
              data={moodData}
              xKey="date"
              areas={[
                { dataKey: 'mood', color: '#3498DB', name: 'Mood' },
                { dataKey: 'anxiety', color: '#E74C3C', name: 'Anxiety' }
              ]}
            />
          )}
        </div>

        <div className="chart-card">
          <h3>Assessment Scores</h3>
          <BarChartComponent
            data={assessmentData}
            xKey="name"
            bars={[
              { dataKey: 'score', color: '#9B59B6', name: 'Score' }
            ]}
          />
        </div>

        <div className="chart-card">
          <h3>Mood Distribution</h3>
          <PieChartComponent
            data={[
              { name: 'High (8-10)', value: 25 },
              { name: 'Medium (5-7)', value: 45 },
              { name: 'Low (1-4)', value: 30 }
            ]}
          />
        </div>

        <div className="chart-card">
          <h3>Weekly Patterns</h3>
          <BarChartComponent
            data={[
              { day: 'Mon', mood: 7.5, anxiety: 5.2 },
              { day: 'Tue', mood: 6.8, anxiety: 5.8 },
              { day: 'Wed', mood: 7.2, anxiety: 5.5 },
              { day: 'Thu', mood: 6.5, anxiety: 6.2 },
              { day: 'Fri', mood: 7.8, anxiety: 4.8 },
              { day: 'Sat', mood: 8.2, anxiety: 4.2 },
              { day: 'Sun', mood: 8.0, anxiety: 4.5 }
            ]}
            xKey="day"
            bars={[
              { dataKey: 'mood', color: '#3498DB', name: 'Mood' },
              { dataKey: 'anxiety', color: '#E74C3C', name: 'Anxiety' }
            ]}
          />
        </div>
      </div>

      <div className="insights-section">
        <h3>Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card positive">
            <TrendingUp size={24} />
            <div>
              <h4>Improving Trend</h4>
              <p>Mood has improved by 15% over the last 30 days</p>
            </div>
          </div>
          <div className="insight-card warning">
            <Activity size={24} />
            <div>
              <h4>Anxiety Pattern</h4>
              <p>Anxiety peaks on Wednesdays and Thursdays</p>
            </div>
          </div>
          <div className="insight-card info">
            <Brain size={24} />
            <div>
              <h4>Sleep Correlation</h4>
              <p>Better sleep correlates with improved mood scores</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;
