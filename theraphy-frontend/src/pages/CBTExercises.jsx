import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, SkipForward, ArrowRight, Heart } from 'lucide-react';
import api from '../services/api'; // Changed from axios to api
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './CBTExercises.css';

const CBTExercises = () => {
    const navigate = useNavigate();
    const { completeCBT, user } = useAuth();
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState({});
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        fetchAssignedExercises();
    }, []);

    // In CBTExercises.jsx, update the fetchAssignedExercises function
    const fetchAssignedExercises = async () => {
        try {
            const response = await api.get('/cbt/assigned/my');
            console.log('Assigned exercises response:', response.data);

            if (response.data.pendingExercises && response.data.pendingExercises.length > 0) {
                setExercises(response.data.pendingExercises);
            } else if (response.data.allExercises && response.data.allExercises.length > 0) {
                // If no pending exercises but there are completed ones, mark as complete
                if (response.data.hasCompletedInitialCBT) {
                    // Already completed, go to dashboard
                    const user = getCurrentUser();
                    const updatedUser = { ...user, hasCompletedInitialCBT: true, requiresCBT: false };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    navigate('/client/dashboard');
                    return;
                }
                setExercises(response.data.allExercises);
            } else {
                // No exercises found, mark as complete and redirect
                toast.info('No exercises assigned. Redirecting to dashboard...');
                const user = getCurrentUser();
                const updatedUser = { ...user, hasCompletedInitialCBT: true, requiresCBT: false };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                navigate('/client/dashboard');
            }
        } catch (error) {
            console.error('Error fetching exercises:', error);
            toast.error('Failed to load exercises');
            // On error, still redirect to dashboard
            navigate('/client/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleResponseChange = (exerciseId, response) => {
        setResponses({
            ...responses,
            [exerciseId]: response
        });
    };

    const handleComplete = async () => {
        setCompleting(true);
        try {
            await api.post('/cbt/assigned/complete', { responses });
            toast.success('Great job! You\'ve completed the initial exercises.');
            completeCBT();
            navigate('/client/dashboard');
        } catch (error) {
            console.error('Error completing exercises:', error);
            toast.error('Failed to save your responses');
        } finally {
            setCompleting(false);
        }
    };

    const handleSkip = async () => {
        if (window.confirm('You can complete these exercises later from your dashboard. Are you sure you want to skip?')) {
            try {
                await api.post('/cbt/assigned/skip');
                toast.success('You can complete the exercises later from your dashboard.');
                completeCBT();
                navigate('/client/dashboard');
            } catch (error) {
                console.error('Error skipping exercises:', error);
                toast.error('Failed to skip exercises');
            }
        }
    };

    const currentExercise = exercises[currentIndex];
    const isLastExercise = currentIndex === exercises.length - 1;

    if (loading) {
        return (
            <div className="cbt-loading">
                <div className="loading-spinner"></div>
                <p>Loading your therapeutic exercises...</p>
            </div>
        );
    }

    if (exercises.length === 0) {
        return (
            <div className="cbt-container">
                <div className="cbt-card glass-card">
                    <Heart size={48} className="welcome-icon" />
                    <h2>Welcome to Your Journey</h2>
                    <p>No exercises are currently assigned. Start exploring your dashboard!</p>
                    <button className="glass-button" onClick={() => navigate('/client/dashboard')}>
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cbt-container">
            <div className="cbt-header glass-card">
                <h1>Welcome {user?.name}!</h1>
                <p>Complete these introductory CBT exercises to personalize your experience</p>
                <div className="progress-indicator">
                    <span>Exercise {currentIndex + 1} of {exercises.length}</span>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="cbt-content">
                {currentExercise && currentExercise.exercise && (
                    <div className="exercise-card glass-card">
                        <div className="exercise-header">
                            <div className="exercise-icon">
                                <BookOpen size={32} />
                            </div>
                            <div className="exercise-info">
                                <h2>{currentExercise.exercise.title}</h2>
                                <div className="exercise-meta">
                                    <span className="category-badge">{currentExercise.exercise.category}</span>
                                    <span className="duration">
                                        <Clock size={14} />
                                        {currentExercise.exercise.estimatedTime || 10} minutes
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="exercise-body">
                            {currentExercise.exercise.description && (
                                <p className="description">{currentExercise.exercise.description}</p>
                            )}

                            <div className="instructions">
                                <h3>Instructions</h3>
                                <p>{currentExercise.exercise.instructions || 'Take your time to reflect and write your thoughts below.'}</p>
                            </div>

                            <div className="response-section">
                                <h3>Your Response</h3>
                                <textarea
                                    className="glass-input response-textarea"
                                    rows="6"
                                    placeholder="Write your thoughts, reflections, or answers here..."
                                    value={responses[currentExercise.exercise.id] || ''}
                                    onChange={(e) => handleResponseChange(currentExercise.exercise.id, e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="exercise-footer">
                            <button
                                className="glass-button-secondary skip-btn"
                                onClick={handleSkip}
                            >
                                <SkipForward size={16} />
                                Skip for Now
                            </button>

                            {isLastExercise ? (
                                <button
                                    className="glass-button complete-btn"
                                    onClick={handleComplete}
                                    disabled={completing}
                                >
                                    <CheckCircle size={16} />
                                    {completing ? 'Saving...' : 'Complete & Continue'}
                                </button>
                            ) : (
                                <button
                                    className="glass-button next-btn"
                                    onClick={() => setCurrentIndex(currentIndex + 1)}
                                >
                                    Next Exercise
                                    <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CBTExercises;
