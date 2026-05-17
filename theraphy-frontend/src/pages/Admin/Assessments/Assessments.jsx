import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import Table from "../../../components/Common/Table";
import Modal from "../../../components/Common/Modal";
import {
  getAssessmentQuestions,
  deleteAssessmentQuestion,
  getAssessmentQuestionById,
  updateAssessmentQuestion,
} from "../../../services/api";
import "./Assessments.css";

const Assessments = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showInactive, setShowInactive] = useState(true); // Show inactive by default

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editFormData, setEditFormData] = useState({
    questionText: "",
    category: "anxiety",
    options: [{ text: "", score: 0 }],
    maxScore: 0,
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchQuestions();
  }, [categoryFilter, showInactive]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      // Build params object
      const params = {};
      
      // Add category filter if not "all"
      if (categoryFilter !== "all") {
        params.category = categoryFilter;
      }
      
      // Add active filter based on toggle
      // If showInactive is true, don't send active param (shows both)
      // If showInactive is false, send active=true (shows only active)
      if (!showInactive) {
        params.active = "true";
      }
      
      console.log("Fetching with params:", params);
      const response = await getAssessmentQuestions(params);
      console.log("Full API response:", response);
      
      // Handle the nested data structure
      let questionsArray = [];
      
      if (response.data && Array.isArray(response.data.data)) {
        // Structure: { data: { count: 50, data: [...] } }
        questionsArray = response.data.data;
      } else if (response.data && Array.isArray(response.data.questions)) {
        // Structure: { data: { questions: [...] } }
        questionsArray = response.data.questions;
      } else if (response.questions && Array.isArray(response.questions)) {
        // Structure: { questions: [...] }
        questionsArray = response.questions;
      } else if (Array.isArray(response)) {
        // Direct array
        questionsArray = response;
      } else if (response.data && Array.isArray(response.data)) {
        // Structure: { data: [...] }
        questionsArray = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        questionsArray = response.data.data;
      }
      
      console.log("Extracted questions array:", questionsArray);
      setQuestions(questionsArray);
      
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (question) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteAssessmentQuestion(question.id);
        toast.success("Question deleted successfully");
        fetchQuestions();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete question",
        );
      }
    }
  };

  const handleView = async (question) => {
    try {
      // First set the selected question and open modal
      setSelectedQuestion(question);
      setViewModalOpen(true);
      
      // Fetch full details - this will work even for inactive questions
      const response = await getAssessmentQuestionById(question.id);
      console.log("View response:", response);
      
      // Handle different response structures
      const questionData = response.data || response;
      setSelectedQuestion(questionData);
      
    } catch (error) {
      console.error("View error:", error);
      toast.error("Failed to load question details");
      // Close modal if error occurs
      setViewModalOpen(false);
    }
  };

  const handleEdit = (question) => {
    try {
      // Use the existing data from the table immediately
      const options =
        question.options && question.options.length > 0
          ? question.options.map((opt) => ({
              text: opt.text || "",
              score: opt.score || 0,
            }))
          : [{ text: "", score: 0 }];

      // Calculate max score from options
      const calculatedMaxScore = options.reduce(
        (sum, opt) => sum + (Number(opt.score) || 0),
        0,
      );

      // Set the form data with EXISTING data immediately
      setEditFormData({
        questionText: question.questionText || "",
        category: question.category || "anxiety",
        options: options,
        maxScore: question.maxScore || calculatedMaxScore,
        order: question.order || 0,
        isActive: question.isActive !== undefined ? question.isActive : true,
      });

      setSelectedQuestion(question);

      // Open modal immediately with existing data
      setEditModalOpen(true);

      // Fetch fresh data in the background if needed
      const fetchFreshData = async () => {
        try {
          const response = await getAssessmentQuestionById(question.id);
          const freshData = response.data || response;

          // Only update if we got newer/better data
          if (freshData) {
            const freshOptions =
              freshData.options && freshData.options.length > 0
                ? freshData.options.map((opt) => ({
                    text: opt.text || "",
                    score: opt.score || 0,
                  }))
                : options;

            const freshMaxScore = freshOptions.reduce(
              (sum, opt) => sum + (Number(opt.score) || 0),
              0,
            );

            setEditFormData((prev) => ({
              ...prev,
              questionText: freshData.questionText || prev.questionText,
              category: freshData.category || prev.category,
              options: freshOptions,
              maxScore: freshData.maxScore || freshMaxScore,
              order: freshData.order || prev.order,
              isActive:
                freshData.isActive !== undefined
                  ? freshData.isActive
                  : prev.isActive,
            }));

            setSelectedQuestion(freshData);
          }
        } catch (error) {
          console.error("Background fetch error:", error);
          // Don't show error toast since we already have working data
        }
      };

      // Run background fetch if needed
      if (!question.options || question.options.length === 0) {
        fetchFreshData();
      }
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Failed to load question for editing");
    }
  };

  const handleUpdate = async () => {
    try {
      // Validate form data
      if (!editFormData.questionText.trim()) {
        toast.error("Question text is required");
        return;
      }

      if (editFormData.options.some((opt) => !opt.text.trim())) {
        toast.error("All options must have text");
        return;
      }

      // Show loading toast
      toast.loading("Updating question...", { id: "update-loading" });

      // Log the data being sent
      console.log("Sending update data:", {
        id: selectedQuestion.id,
        data: editFormData,
      });

      // Make the API call
      const response = await updateAssessmentQuestion(
        selectedQuestion.id,
        editFormData,
      );

      console.log("Update response:", response);

      toast.dismiss("update-loading");
      toast.success("Question updated successfully");

      // Close modal
      setEditModalOpen(false);

      // Reset form
      setSelectedQuestion(null);
      setEditFormData({
        questionText: "",
        category: "anxiety",
        options: [{ text: "", score: 0 }],
        maxScore: 0,
        order: 0,
        isActive: true,
      });

      // Refresh questions
      fetchQuestions();
    } catch (error) {
      console.error("Update error details:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      toast.dismiss("update-loading");

      // Show more specific error message
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update question";

      toast.error(errorMessage);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...editFormData.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setEditFormData((prev) => ({ ...prev, options: updatedOptions }));

    // Recalculate max score
    const totalScore = updatedOptions.reduce(
      (sum, opt) => sum + (Number(opt.score) || 0),
      0,
    );
    setEditFormData((prev) => ({ ...prev, maxScore: totalScore }));
  };

  const addOption = () => {
    setEditFormData((prev) => ({
      ...prev,
      options: [...prev.options, { text: "", score: 0 }],
    }));
  };

  const removeOption = (index) => {
    if (editFormData.options.length > 1) {
      const updatedOptions = editFormData.options.filter((_, i) => i !== index);
      setEditFormData((prev) => ({ ...prev, options: updatedOptions }));

      // Recalculate max score
      const totalScore = updatedOptions.reduce(
        (sum, opt) => sum + (Number(opt.score) || 0),
        0,
      );
      setEditFormData((prev) => ({ ...prev, maxScore: totalScore }));
    }
  };

  const filteredQuestions = questions; // Already filtered by API

  const columns = [
    {
      header: "Question",
      accessor: "questionText",
      render: (row) => (
        <div className={`question-cell ${!row.isActive ? 'inactive-question' : ''}`}>
          <div className="question-text">{row.questionText}</div>
          <div className="question-meta">
            <span className={`category-badge category-${row.category?.toLowerCase()}`}>
              {row.category}
            </span>
            <span
              className={`status-dot ${row.isActive ? "active" : "inactive"}`}
            />
            {!row.isActive && (
              <span className="inactive-label">Inactive</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Max Score",
      accessor: "maxScore",
      render: (row) => <span className="score-badge">{row.maxScore || 0}</span>,
    },
    {
      header: "Order",
      accessor: "order",
      render: (row) => <span className="order-badge">#{row.order || 0}</span>,
    },
    {
      header: "Options",
      accessor: "options",
      render: (row) => (
        <span className="options-count">
          {row.options?.length || 0} options
        </span>
      ),
    },
  ];

  const actions = [
    {
      icon: <Eye size={18} />,
      label: "View Details",
      name: "view",
      className: "view",
    },
    {
      icon: <Edit size={18} />,
      label: "Edit",
      name: "edit",
      className: "edit",
    },
    {
      icon: <Trash2 size={18} />,
      label: "Delete",
      name: "delete",
      className: "delete",
    },
  ];

  const handleAction = (actionName, row) => {
    switch (actionName) {
      case "view":
        handleView(row);
        break;
      case "edit":
        handleEdit(row);
        break;
      case "delete":
        handleDelete(row);
        break;
      default:
        break;
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
    <div className="assessments-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assessment Management</h1>
          <p className="page-subtitle">
            Manage psychological assessment questions
          </p>
        </div>
        <button
          className="btn btn-primary add-question-btn"
          onClick={() => navigate("/admin/assessments/new")}
        >
          <Plus size={20} />
          Add Question
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <div className="category-filter">
            <label>Filter by Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="anxiety">Anxiety</option>
              <option value="phobia">Phobia</option>
              <option value="depression">Depression</option>
              <option value="general">General</option>
              <option value="OCD">OCD</option>
            </select>
          </div>
          
          <div className="status-filter">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
              <span>Show Inactive Questions</span>
            </label>
          </div>
        </div>
        
        <div className="questions-count">
          Total: <span>{filteredQuestions.length}</span> questions
          {!showInactive && (
            <span className="active-only-badge">Active Only</span>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredQuestions}
        actions={actions}
        onAction={handleAction}
      />

      {/* View Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedQuestion(null);
        }}
        title="Question Details"
        size="lg"
      >
        {selectedQuestion && (
          <div className="modal-body">
            <div className="detail-group">
              <label>Question:</label>
              <p className="detail-value">{selectedQuestion.questionText}</p>
            </div>

            <div className="detail-row">
              <div className="detail-group">
                <label>Category:</label>
                <span
                  className={`category-badge category-${selectedQuestion.category?.toLowerCase()}`}
                >
                  {selectedQuestion.category}
                </span>
              </div>
              <div className="detail-group">
                <label>Status:</label>
                <span
                  className={`status-badge ${selectedQuestion.isActive ? "active" : "inactive"}`}
                >
                  {selectedQuestion.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-group">
                <label>Max Score:</label>
                <span className="score-value">
                  {selectedQuestion.maxScore || 0}
                </span>
              </div>
              <div className="detail-group">
                <label>Order:</label>
                <span className="order-value">
                  #{selectedQuestion.order || 0}
                </span>
              </div>
            </div>

            <div className="detail-group">
              <label>Options:</label>
              <div className="options-list">
                {selectedQuestion.options?.map((opt, idx) => (
                  <div key={idx} className="option-item">
                    <span className="option-text">{opt.text}</span>
                    <span className="option-score">Score: {opt.score}</span>
                  </div>
                ))}
                {(!selectedQuestion.options ||
                  selectedQuestion.options.length === 0) && (
                  <p className="no-options">No options available</p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedQuestion(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedQuestion(null);
          setEditFormData({
            questionText: "",
            category: "anxiety",
            options: [{ text: "", score: 0 }],
            maxScore: 0,
            order: 0,
            isActive: true,
          });
        }}
        title="Edit Question"
        size="lg"
      >
        {editFormData.questionText ? (
          <div className="modal-body">
            <div className="form-group">
              <label>Question Text:</label>
              <textarea
                name="questionText"
                value={editFormData.questionText}
                onChange={handleInputChange}
                rows="3"
                className="form-control"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category:</label>
                <select
                  name="category"
                  value={editFormData.category}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="anxiety">Anxiety</option>
                  <option value="phobia">Phobia</option>
                  <option value="depression">Depression</option>
                  <option value="general">General</option>
                  <option value="OCD">OCD</option>
                </select>
              </div>

              <div className="form-group">
                <label>Order:</label>
                <input
                  type="number"
                  name="order"
                  value={editFormData.order}
                  onChange={handleInputChange}
                  min="0"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status:</label>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editFormData.isActive}
                    onChange={handleInputChange}
                    id="isActive"
                  />
                  <label htmlFor="isActive">Active</label>
                </div>
              </div>

              <div className="form-group">
                <label>Max Score (Auto-calculated):</label>
                <input
                  type="number"
                  name="maxScore"
                  value={editFormData.maxScore}
                  onChange={handleInputChange}
                  min="0"
                  className="form-control"
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label>Options:</label>
              {editFormData.options.map((opt, index) => (
                <div key={index} className="option-input-row">
                  <input
                    type="text"
                    placeholder="Option text"
                    value={opt.text}
                    onChange={(e) =>
                      handleOptionChange(index, "text", e.target.value)
                    }
                    className="form-control option-text-input"
                  />
                  <input
                    type="number"
                    placeholder="Score"
                    value={opt.score}
                    onChange={(e) =>
                      handleOptionChange(
                        index,
                        "score",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="form-control option-score-input"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="btn-icon remove-option-btn"
                    disabled={editFormData.options.length <= 1}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="btn btn-secondary add-option-btn"
              >
                + Add Option
              </button>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedQuestion(null);
                  setEditFormData({
                    questionText: "",
                    category: "anxiety",
                    options: [{ text: "", score: 0 }],
                    maxScore: 0,
                    order: 0,
                    isActive: true,
                  });
                }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpdate}>
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-body loading-container">
            <div className="loader"></div>
            <p style={{ textAlign: "center", marginTop: "1rem" }}>
              Loading question details...
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Assessments;
