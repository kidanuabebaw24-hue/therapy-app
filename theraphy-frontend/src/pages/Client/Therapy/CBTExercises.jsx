import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Clock,
  CheckCircle,
  Play,
  FileText,
  Award,
  Filter,
  Search,
  BookOpen,
  PenTool,
  Activity,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/Common/Table';
import Modal from '../../../components/Common/Modal';
import { getCBTExercises, getMyCBTProgress, submitCBTProgress } from '../../../services/clientApi';
import './Therapy.css';

const CBTExercises = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [myProgress, setMyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressForm, setProgressForm] = useState({
    exerciseId: '',
    reflection: '',
    score: 5,
    duration: 15
  });
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalMinutes: 0,
    averageScore: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exercisesData, progressResponse] = await Promise.all([
        getCBTExercises(),
        getMyCBTProgress().catch(err => {
          console.error("Progress fetch error:", err);
          return { data: [], stats: { totalCompleted: 0, totalMinutes: 0, averageScore: 0 } };
        })
      ]);
      
      // Handle exercises data - ensure it's an array
      setExercises(Array.isArray(exercisesData) ? exercisesData : []);
      
      // Handle progress data - extract data array from response
      if (progressResponse && progressResponse.data) {
        setMyProgress(progressResponse.data);
        setStats(progressResponse.stats || {
          totalCompleted: progressResponse.data.length,
          totalMinutes: progressResponse.data.reduce((sum, p) => sum + (p.duration || 0), 0),
          averageScore: progressResponse.data.length
            ? (progressResponse.data.reduce((sum, p) => sum + (p.score || 0), 0) / progressResponse.data.length).toFixed(1)
            : 0
        });
      } else if (Array.isArray(progressResponse)) {
        // Fallback if it's directly an array
        setMyProgress(progressResponse);
        setStats({
          totalCompleted: progressResponse.length,
          totalMinutes: progressResponse.reduce((sum, p) => sum + (p.duration || 0), 0),
          averageScore: progressResponse.length
            ? (progressResponse.reduce((sum, p) => sum + (p.score || 0), 0) / progressResponse.length).toFixed(1)
            : 0
        });
      } else {
        setMyProgress([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error('Failed to fetch CBT exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExercise = (exercise) => {
    setSelectedExercise(exercise);
    setProgressForm({
      exerciseId: exercise.id,
      reflection: '',
      score: 5,
      duration: exercise.duration || 15
    });
    setShowExerciseModal(true);
  };

  const handleSubmitProgress = async () => {
    if (!progressForm.reflection.trim()) {
      toast.error('Please write your reflection');
      return;
    }
    
    try {
      await submitCBTProgress(progressForm);
      toast.success('Progress saved successfully');
      setShowExerciseModal(false);
      setSelectedExercise(null);
      fetchData();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || 'Failed to save progress');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'thought-record': return <PenTool size={16} />;
      case 'behavioral': return <Activity size={16} />;
      case 'cognitive': return <Brain size={16} />;
      case 'mindfulness': return <Award size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  // Safely filter exercises
  const filteredExercises = Array.isArray(exercises) 
    ? exercises.filter(ex => {
        if (!ex) return false;
        const matchesSearch = searchTerm === '' || (
          (ex.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ex.description?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        const matchesCategory = categoryFilter === 'all' || ex.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
    : [];

  const columns = [
    {
      header: 'Exercise',
      accessor: 'title',
      render: (row) => (
        <div className="exercise-info">
          <div className="exercise-icon" style={{ background: `${getDifficultyColor(row.difficulty)}20` }}>
            {getCategoryIcon(row.category)}
          </div>
          <div>
            <strong>{row.title}</strong>
            <small>{row.description}</small>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <span className="category-badge">{row.category?.replace('-', ' ')}</span>
      )
    },
    {
      header: 'Duration',
      accessor: 'duration',
      render: (row) => (
        <span className="duration">
          <Clock size={14} />
          {row.duration} min
        </span>
      )
    },
    {
      header: 'Difficulty',
      accessor: 'difficulty',
      render: (row) => (
        <span
          className="difficulty-badge"
          style={{
            background: `${getDifficultyColor(row.difficulty)}20`,
            color: getDifficultyColor(row.difficulty)
          }}
        >
          {row.difficulty}
        </span>
      )
    }
  ];

  const actions = [
    {
      icon: <Play size={18} />,
      label: 'Start Exercise',
      name: 'start',
      className: 'start'
    }
  ];

  const handleAction = (actionName, row) => {
    if (actionName === 'start') {
      handleStartExercise(row);
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
    <div className="cbt-exercises">
      <div className="page-header">
        <div>
          <h1 className="page-title">CBT Exercises</h1>
          <p className="page-subtitle">Cognitive Behavioral Therapy exercises for mental wellness</p>
        </div>
      </div>

      <div className="progress-stats">
        <div className="stat-card">
          <Brain size={24} color="#8B5CF6" />
          <div>
            <span className="stat-value">{stats.totalCompleted}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card">
          <Clock size={24} color="#10B981" />
          <div>
            <span className="stat-value">{stats.totalMinutes}</span>
            <span className="stat-label">Minutes</span>
          </div>
        </div>
        <div className="stat-card">
          <Award size={24} color="#F59E0B" />
          <div>
            <span className="stat-value">{exercises.length}</span>
            <span className="stat-label">Available</span>
          </div>
        </div>
        <div className="stat-card">
          <Activity size={24} color="#3B82F6" />
          <div>
            <span className="stat-value">{stats.averageScore}</span>
            <span className="stat-label">Avg Score</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <Filter size={18} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="thought-record">Thought Record</option>
            <option value="behavioral">Behavioral Activation</option>
            <option value="cognitive">Cognitive Restructuring</option>
            <option value="mindfulness">Mindfulness</option>
          </select>
        </div>
      </div>

      {filteredExercises.length === 0 ? (
        <div className="no-exercises">
          <Brain size={48} />
          <p>No exercises found</p>
        </div>
      ) : (
        <div className="exercises-grid">
          {filteredExercises.map(exercise => (
            <div key={exercise.id} className="exercise-card">
              <div className="card-header">
                <div className="exercise-icon-large" style={{ background: `${getDifficultyColor(exercise.difficulty)}20` }}>
                  {getCategoryIcon(exercise.category)}
                </div>
                <span className="difficulty-tag" style={{ background: getDifficultyColor(exercise.difficulty) }}>
                  {exercise.difficulty}
                </span>
              </div>
              <h3>{exercise.title}</h3>
              <p>{exercise.description}</p>
              <div className="card-footer">
                <span className="duration">
                  <Clock size={14} />
                  {exercise.duration} min
                </span>
                <button
                  className="btn-start"
                  onClick={() => handleStartExercise(exercise)}
                >
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise Modal */}
      <Modal
        isOpen={showExerciseModal}
        onClose={() => {
          setShowExerciseModal(false);
          setSelectedExercise(null);
        }}
        title={selectedExercise?.title || "CBT Exercise"}
        size="lg"
      >
        <div className="exercise-modal">
          <div className="exercise-content">
            <div className="exercise-instructions">
              <h4>Instructions</h4>
              <p>{selectedExercise?.instructions || "No instructions provided."}</p>
            </div>

            <div className="form-group">
              <h4>Your Reflection</h4>
              <textarea
                rows={6}
                value={progressForm.reflection}
                onChange={(e) => setProgressForm({...progressForm, reflection: e.target.value})}
                placeholder="Write your thoughts, insights, or observations..."
                className="form-control"
              />
            </div>

            <div className="form-group">
              <h4>How helpful was this exercise? (1-10)</h4>
              <input
                type="range"
                min="1"
                max="10"
                value={progressForm.score}
                onChange={(e) => setProgressForm({...progressForm, score: parseInt(e.target.value)})}
                className="slider"
              />
              <div className="score-display">{progressForm.score}/10</div>
            </div>

            <div className="form-group">
              <h4>Time spent (minutes)</h4>
              <input
                type="number"
                min="1"
                max="120"
                value={progressForm.duration}
                onChange={(e) => setProgressForm({...progressForm, duration: parseInt(e.target.value) || 0})}
                className="form-control"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowExerciseModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmitProgress}
            >
              Complete & Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CBTExercises;
