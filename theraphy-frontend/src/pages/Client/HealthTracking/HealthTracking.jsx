import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Heart,
  TrendingUp,
  Calendar,
  Plus,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../components/Common/Modal';
import { LineChartComponent, BarChartComponent } from '../../../components/Dashboard/Charts';
import { logMood, getMoodHistory, getMoodTrend } from '../../../services/clientApi';
import './HealthTracking.css';

const HealthTracking = () => {
  const navigate = useNavigate();
  const [moodEntries, setMoodEntries] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [moodForm, setMoodForm] = useState({
    moodScore: 5,
    anxietyLevel: 5,
    emotions: [],
    notes: ''
  });

  const emotions = [
    'Happy', 'Calm', 'Anxious', 'Sad', 'Angry', 'Stressed',
    'Hopeful', 'Tired', 'Energetic', 'Overwhelmed', 'Peaceful', 'Worried'
  ];

  useEffect(() => {
    fetchMoodData();
  }, []);

  const fetchMoodData = async () => {
    try {
      const [history, trend] = await Promise.all([
        getMoodHistory(),
        getMoodTrend().catch(() => [])
      ]);
      setMoodEntries(history || []);
      setTrendData(trend || []);
    } catch (error) {
      toast.error('Failed to fetch mood data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogMood = async () => {
    try {
      await logMood({
        moodScore: moodForm.moodScore,
        anxietyLevel: moodForm.anxietyLevel,
        emotion: moodForm.emotions,
        notes: moodForm.notes
      });
      toast.success('Mood logged successfully');
      setShowLogModal(false);
      setMoodForm({
        moodScore: 5,
        anxietyLevel: 5,
        emotions: [],
        notes: ''
      });
      fetchMoodData();
    } catch (error) {
      toast.error('Failed to log mood');
    }
  };

  const toggleEmotion = (emotion) => {
    setMoodForm(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion]
    }));
  };

  const getMoodIcon = (score) => {
    if (score >= 8) return <Smile size={24} color="#10B981" />;
    if (score >= 5) return <Meh size={24} color="#F59E0B" />;
    return <Frown size={24} color="#EF4444" />;
  };

  const getMoodColor = (score) => {
    if (score >= 8) return '#10B981';
    if (score >= 5) return '#F59E0B';
    return '#EF4444';
  };

  const chartData = moodEntries.slice(-14).map(entry => ({
    date: new Date(entry.createdAt).toLocaleDateString().slice(0, 5),
    mood: entry.moodScore,
    anxiety: entry.anxietyLevel || 0
  }));

  const stats = {
    averageMood: moodEntries.length
      ? (moodEntries.reduce((sum, e) => sum + e.moodScore, 0) / moodEntries.length).toFixed(1)
      : 0,
    averageAnxiety: moodEntries.length
      ? (moodEntries.reduce((sum, e) => sum + (e.anxietyLevel || 0), 0) / moodEntries.length).toFixed(1)
      : 0,
    totalEntries: moodEntries.length,
    streak: calculateStreak(moodEntries)
  };

  function calculateStreak(entries) {
    if (!entries.length) return 0;
    let streak = 1;
    const sorted = [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = new Date(sorted[i].createdAt);
      const next = new Date(sorted[i + 1].createdAt);
      const diffDays = Math.floor((curr - next) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) streak++;
      else break;
    }
    return streak;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="health-tracking">
      <div className="page-header">
        <div>
          <h1 className="page-title">Health Tracking</h1>
          <p className="page-subtitle">Monitor your mood and emotional well-being</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowLogModal(true)}
        >
          <Plus size={20} />
          Log Mood
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10B98120', color: '#10B981' }}>
            <Heart size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.averageMood}/10</span>
            <span className="stat-label">Average Mood</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F59E0B20', color: '#F59E0B' }}>
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.averageAnxiety}/10</span>
            <span className="stat-label">Average Anxiety</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3B82F620', color: '#3B82F6' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalEntries}</span>
            <span className="stat-label">Total Entries</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#8B5CF620', color: '#8B5CF6' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.streak}</span>
            <span className="stat-label">Day Streak</span>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Mood & Anxiety Trend (Last 14 Days)</h3>
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
              <p>No mood data yet. Start logging to see trends.</p>
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3>Mood Distribution</h3>
          {moodEntries.length > 0 ? (
            <BarChartComponent
              data={[
                { range: 'High (8-10)', count: moodEntries.filter(m => m.moodScore >= 8).length },
                { range: 'Medium (5-7)', count: moodEntries.filter(m => m.moodScore >= 5 && m.moodScore <= 7).length },
                { range: 'Low (1-4)', count: moodEntries.filter(m => m.moodScore <= 4).length }
              ]}
              xKey="range"
              bars={[
                { dataKey: 'count', color: '#10B981', name: 'Entries' }
              ]}
            />
          ) : (
            <div className="no-data">
              <Activity size={48} />
              <p>No data to display</p>
            </div>
          )}
        </div>
      </div>

      <div className="recent-entries">
        <h3>Recent Mood Entries</h3>
        <div className="entries-list">
          {moodEntries.slice(0, 10).map((entry, index) => (
            <div key={index} className="entry-card">
              <div className="entry-header">
                <div className="entry-date">
                  <Clock size={14} />
                  {new Date(entry.createdAt).toLocaleString()}
                </div>
                <div className="entry-mood">
                  {getMoodIcon(entry.moodScore)}
                  <span style={{ color: getMoodColor(entry.moodScore) }}>
                    {entry.moodScore}/10
                  </span>
                </div>
              </div>
              {entry.emotion?.length > 0 && (
                <div className="entry-emotions">
                  {entry.emotion.map(emotion => (
                    <span key={emotion} className="emotion-tag">{emotion}</span>
                  ))}
                </div>
              )}
              {entry.anxietyLevel && (
                <div className="entry-anxiety">
                  <span className="label">Anxiety Level:</span>
                  <div className="anxiety-bar">
                    <div
                      className="anxiety-fill"
                      style={{ width: `${entry.anxietyLevel * 10}%` }}
                    />
                  </div>
                  <span>{entry.anxietyLevel}/10</span>
                </div>
              )}
              {entry.notes && (
                <p className="entry-notes">{entry.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Log Mood Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={() => {
          setShowLogModal(false);
          setMoodForm({
            moodScore: 5,
            anxietyLevel: 5,
            emotions: [],
            notes: ''
          });
        }}
        title="Log Your Mood"
        size="lg"
      >
        <div className="log-mood-modal">
          <div className="form-section">
            <h4>How are you feeling today?</h4>
            <div className="mood-slider">
              <span>1</span>
              <input
                type="range"
                min="1"
                max="10"
                value={moodForm.moodScore}
                onChange={(e) => setMoodForm({...moodForm, moodScore: parseInt(e.target.value)})}
                className="slider"
                style={{ accentColor: getMoodColor(moodForm.moodScore) }}
              />
              <span>10</span>
            </div>
            <div className="mood-indicator">
              {getMoodIcon(moodForm.moodScore)}
              <span style={{ color: getMoodColor(moodForm.moodScore) }}>
                {moodForm.moodScore}/10 - {
                  moodForm.moodScore >= 8 ? 'Great' :
                  moodForm.moodScore >= 5 ? 'Okay' : 'Difficult'
                }
              </span>
            </div>
          </div>

          <div className="form-section">
            <h4>Anxiety Level</h4>
            <div className="mood-slider">
              <span>1</span>
              <input
                type="range"
                min="1"
                max="10"
                value={moodForm.anxietyLevel}
                onChange={(e) => setMoodForm({...moodForm, anxietyLevel: parseInt(e.target.value)})}
                className="slider"
              />
              <span>10</span>
            </div>
            <div className="anxiety-indicator">
              <Activity size={20} color={moodForm.anxietyLevel >= 7 ? '#EF4444' : '#F59E0B'} />
              <span>
                {moodForm.anxietyLevel}/10 - {
                  moodForm.anxietyLevel >= 7 ? 'High' :
                  moodForm.anxietyLevel >= 4 ? 'Moderate' : 'Low'
                }
              </span>
            </div>
          </div>

          <div className="form-section">
            <h4>Select emotions you're experiencing</h4>
            <div className="emotions-grid">
              {emotions.map(emotion => (
                <button
                  key={emotion}
                  className={`emotion-btn ${moodForm.emotions.includes(emotion) ? 'selected' : ''}`}
                  onClick={() => toggleEmotion(emotion)}
                  type="button"
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h4>Notes (optional)</h4>
            <textarea
              rows={4}
              value={moodForm.notes}
              onChange={(e) => setMoodForm({...moodForm, notes: e.target.value})}
              placeholder="What's on your mind? Any specific thoughts or events?"
              className="form-input"
            />
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowLogModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleLogMood}
            >
              Save Entry
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HealthTracking;