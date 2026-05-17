import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, CheckCircle, Loader, Brain } from "lucide-react";
import toast from "react-hot-toast";
import {
  getAssessmentQuestions,
  createAssessment,
} from "../../../services/clientApi.js";
import "./TakeAssessment.css";

const TakeAssessment = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]); // This should be an array
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCategorySelection, setShowCategorySelection] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  // Assessment categories configuration
  const assessmentCategories = [
    { value: "anxiety", label: "Anxiety Assessment", icon: "😰", description: "Measures anxiety levels and symptoms" },
    { value: "phobia", label: "Phobia Assessment", icon: "😨", description: "Evaluates specific phobias and fears" },
    { value: "depression", label: "Depression Assessment", icon: "😔", description: "Assesses depression symptoms and severity" },
    { value: "OCD", label: "OCD Assessment", icon: "🔄", description: "Evaluates obsessive-compulsive patterns" },
    { value: "general", label: "General Mental Health", icon: "🧠", description: "Overall mental health assessment" },
  ];

  useEffect(() => {
    fetchAllQuestions();
  }, []);

  const fetchAllQuestions = async () => {
    try {
      setLoading(true);
      const response = await getAssessmentQuestions();
      console.log("Questions response:", response);
      
      // Extract questions array from the response - FIXED HERE
      // Check different possible response structures
      let questions = [];
      
      if (response.data && Array.isArray(response.data)) {
        // New structure: { success: true, count: 49, data: [...] }
        questions = response.data;
      } else if (response.questions && Array.isArray(response.questions)) {
        // Old structure: { questions: [...] }
        questions = response.questions;
      } else if (Array.isArray(response)) {
        // Direct array
        questions = response;
      }
      
      console.log("Extracted questions:", questions);
      setAllQuestions(questions);
      
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load assessment questions");
      setAllQuestions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    // Ensure allQuestions is an array before filtering
    if (!Array.isArray(allQuestions)) {
      console.error("allQuestions is not an array:", allQuestions);
      toast.error("Error loading questions. Please refresh.");
      return;
    }
    
    // Filter questions by selected category
    const filtered = allQuestions.filter(
      (q) => q.category?.toLowerCase() === category.toLowerCase()
    );
    
    if (filtered.length === 0) {
      toast.error(`No questions found for ${category} assessment`);
      return;
    }
    
    setSelectedCategory(category);
    setFilteredQuestions(filtered);
    setShowCategorySelection(false);
    setCurrentQuestion(0);
    
    // Initialize responses array
    setResponses(
      filtered.map((q) => ({
        question: q.questionText,
        questionId: q.id,
        answer: "",
        score: 0,
      }))
    );
    
    toast.success(`Starting ${category} assessment with ${filtered.length} questions`);
  };

  const handleAnswerSelect = (questionIndex, option) => {
    const updatedResponses = [...responses];
    updatedResponses[questionIndex] = {
      ...updatedResponses[questionIndex],
      answer: option.text,
      score: option.score,
    };
    setResponses(updatedResponses);
  };

  const handleNext = () => {
    // Check if current question is answered
    if (!responses[currentQuestion]?.answer) {
      toast.error("Please select an answer before proceeding");
      return;
    }

    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Show summary before submitting
      setShowSummary(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

const handleSubmit = async () => {
  // Check if all questions are answered
  const unanswered = responses.filter((r) => !r.answer);
  if (unanswered.length > 0) {
    toast.error("Please answer all questions before submitting");
    setShowSummary(false);
    return;
  }

  try {
    setSubmitting(true);
    
    // Format the data correctly for the backend
    const assessmentData = {
      type: selectedCategory,
      responses: responses.map(r => ({
        question: r.question,
        questionId: r.questionId, // Make sure to include questionId
        answer: r.answer,
        score: r.score
      })),
    };

    console.log("Submitting assessment data:", assessmentData);
    
    const result = await createAssessment(assessmentData);
    console.log("Assessment result:", result);
    
    // Handle different response structures
    const assessment = result.data || result.assessment || result;
    setAssessmentResult(assessment);
    
    toast.success("Assessment completed successfully!");
    
    // Navigate back to assessments list after 3 seconds
    setTimeout(() => {
      navigate("/client/assessments");
    }, 3000);
    
  } catch (error) {
    console.error("Error submitting assessment:", error);
    console.error("Error response:", error.response?.data); // Log the backend error
    toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to submit assessment");
  } finally {
    setSubmitting(false);
  }
};

  const handleBack = () => {
    if (!showCategorySelection && !showSummary) {
      // Go back to category selection
      setShowCategorySelection(true);
      setFilteredQuestions([]);
      setCurrentQuestion(0);
      setResponses([]);
    } else {
      // Go back to assessments page
      navigate("/client/assessments");
    }
  };

  const getProgressPercentage = () => {
    if (!filteredQuestions.length) return 0;
    const answeredCount = responses.filter((r) => r.answer).length;
    return Math.round((answeredCount / filteredQuestions.length) * 100) || 0;
  };

  const getCategoryIcon = (category) => {
    const found = assessmentCategories.find(c => c.value === category);
    return found?.icon || "📋";
  };

  // Add safe check before rendering categories
  const getQuestionCountForCategory = (category) => {
    if (!Array.isArray(allQuestions)) return 0;
    return allQuestions.filter(
      q => q.category?.toLowerCase() === category.toLowerCase()
    ).length;
  };

  if (loading) {
    return (
      <div className="take-assessment-container">
        <div className="loading-state">
          <Loader className="spinner" size={40} />
          <p>Loading assessment questions...</p>
        </div>
      </div>
    );
  }

  if (assessmentResult) {
    return (
      <div className="take-assessment-container">
        <div className="result-card">
          <div className="result-icon">
            <CheckCircle size={64} />
          </div>
          <h2>Assessment Completed!</h2>
          <div className="result-details">
            <div className="result-item">
              <span className="result-label">Category:</span>
              <span className="result-value category">
                {getCategoryIcon(selectedCategory)} {selectedCategory?.toUpperCase()}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">Your Score:</span>
              <span className="result-value score">{assessmentResult.score}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Severity:</span>
              <span className={`result-value severity ${assessmentResult.severity}`}>
                {assessmentResult.severity?.toUpperCase()}
              </span>
            </div>
          </div>
          <p className="redirect-message">Redirecting to assessments page...</p>
        </div>
      </div>
    );
  }

  if (showCategorySelection) {
    return (
      <div className="take-assessment-container">
        <div className="assessment-header">
          <button className="back-button" onClick={handleBack}>
            <ArrowLeft size={20} />
            Back to Assessments
          </button>
          <h1>Select Assessment Type</h1>
          <p className="category-subtitle">Choose the type of assessment you want to take</p>
        </div>

        <div className="categories-grid">
          {assessmentCategories.map((category) => {
            const questionCount = getQuestionCountForCategory(category.value);
            
            return (
              <div
                key={category.value}
                className={`category-card ${questionCount === 0 ? 'disabled' : ''}`}
                onClick={() => questionCount > 0 && handleCategorySelect(category.value)}
              >
                <div className="category-icon">{category.icon}</div>
                <h3 className="category-title">{category.label}</h3>
                <p className="category-description">{category.description}</p>
                <div className="category-meta">
                  <span className="question-count">{questionCount} questions</span>
                  {questionCount > 0 ? (
                    <span className="available-badge">Available</span>
                  ) : (
                    <span className="unavailable-badge">Coming Soon</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (showSummary) {
    const totalScore = responses.reduce((sum, r) => sum + (r.score || 0), 0);
    const maxScore = filteredQuestions.reduce((sum, q) => sum + (q.maxScore || 0), 0);
    const answeredCount = responses.filter((r) => r.answer).length;

    return (
      <div className="take-assessment-container">
        <div className="assessment-header">
          <button className="back-button" onClick={() => setShowSummary(false)}>
            <ArrowLeft size={20} />
            Back to Questions
          </button>
          <h1>
            {getCategoryIcon(selectedCategory)} {selectedCategory} Assessment Summary
          </h1>
        </div>

        <div className="summary-card">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Questions Answered</span>
              <span className="stat-value">{answeredCount}/{filteredQuestions.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Score</span>
              <span className="stat-value">{totalScore}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Maximum Score</span>
              <span className="stat-value">{maxScore}</span>
            </div>
          </div>

          <div className="summary-questions">
            <h3>Your Answers</h3>
            {filteredQuestions.map((q, idx) => (
              <div key={idx} className="summary-question-item">
                <p className="summary-question-text">
                  {idx + 1}. {q.questionText}
                </p>
                <p className="summary-answer">
                  Answer: <span className="answer-text">{responses[idx]?.answer || "Not answered"}</span>
                </p>
                <p className="summary-score">
                  Score: <span className="score-text">{responses[idx]?.score || 0}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="summary-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowSummary(false)}
              disabled={submitting}
            >
              Review Answers
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Add check for filteredQuestions
  if (!filteredQuestions.length || !responses.length) {
    return (
      <div className="take-assessment-container">
        <div className="loading-state">
          <AlertCircle size={40} />
          <p>No questions available for this category.</p>
          <button className="btn btn-primary" onClick={() => setShowCategorySelection(true)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQ = filteredQuestions[currentQuestion];
  const currentResponse = responses[currentQuestion];

  return (
    <div className="take-assessment-container">
      <div className="assessment-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={20} />
          Change Category
        </button>
        <h1>
          {getCategoryIcon(selectedCategory)} {selectedCategory} Assessment
        </h1>
      </div>

      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${getProgressPercentage()}%` }}
        />
        <span className="progress-text">
          Question {currentQuestion + 1} of {filteredQuestions.length} ({getProgressPercentage()}%)
        </span>
      </div>

      <div className="question-card">
        <div className="question-header">
          <span className="question-number">Question {currentQuestion + 1}</span>
          {currentQ?.maxScore > 0 && (
            <span className="max-score">Max Score: {currentQ.maxScore}</span>
          )}
        </div>

        <div className="question-text">
          {currentQ?.questionText}
        </div>

        <div className="options-container">
          {currentQ?.options?.map((option, optIdx) => (
            <label
              key={optIdx}
              className={`option-item ${currentResponse?.answer === option.text ? "selected" : ""}`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value={option.text}
                checked={currentResponse?.answer === option.text}
                onChange={() => handleAnswerSelect(currentQuestion, option)}
              />
              <span className="option-text">{option.text}</span>
              {option.score > 0 && (
                <span className="option-score">({option.score} points)</span>
              )}
            </label>
          ))}
        </div>

        {currentQ?.options?.length === 0 && (
          <div className="no-options-warning">
            <AlertCircle size={18} />
            <span>This question has no options configured. Please contact support.</span>
          </div>
        )}
      </div>

      <div className="navigation-buttons">
        <button
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
        >
          {currentQuestion === filteredQuestions.length - 1 ? "Review & Submit" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default TakeAssessment;
