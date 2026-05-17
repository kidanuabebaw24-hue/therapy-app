import { useState, useEffect } from "react";
import {
  Brain,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Award,
  Users,
  Filter,
  Search,
  Activity
} from "lucide-react";
import toast from "react-hot-toast";
import Table from "../../../components/Common/Table";
import Modal from "../../../components/Common/Modal";
import {
  getMyClients,
  createCBTExercise,
  getCBTExercises,
} from "../../../services/therapistApi";
import "./CBTInterventions.css";

const CBTInterventions = () => {
  const [exercises, setExercises] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedClient, setSelectedClient] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [newExercise, setNewExercise] = useState({
    title: "",
    description: "",
    category: "thought-record",
    instructions: "",
    duration: 15,
    difficulty: "beginner",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsResponse, exercisesResponse] = await Promise.all([
        getMyClients(),
        getCBTExercises(),
      ]);

      setClients(clientsResponse?.clients || []);

      // Handle multiple possible response formats
      let exercisesData = [];
      if (Array.isArray(exercisesResponse)) {
        exercisesData = exercisesResponse;
      } else if (
        exercisesResponse?.data &&
        Array.isArray(exercisesResponse.data)
      ) {
        exercisesData = exercisesResponse.data;
      } else if (
        exercisesResponse?.exercises &&
        Array.isArray(exercisesResponse.exercises)
      ) {
        exercisesData = exercisesResponse.exercises;
      }

      setExercises(exercisesData);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch data");
      setExercises([]); // Important: reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async () => {
    if (
      !newExercise.title ||
      !newExercise.description ||
      !newExercise.instructions
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await createCBTExercise(newExercise);
      toast.success("CBT exercise created successfully");
      setShowCreateModal(false);
      setNewExercise({
        title: "",
        description: "",
        category: "thought-record",
        instructions: "",
        duration: 15,
        difficulty: "beginner",
      });
      fetchData();
    } catch (error) {
      console.log(error);
      toast.error("Failed to create exercise");
    }
  };

  const handleAssignExercise = () => {
    if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }
    toast.success(`Exercise assigned to client`);
    setShowAssignModal(false);
    setSelectedClient("");
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "thought-record":
        return <Brain size={16} />;
      case "behavioral":
        return <Activity size={16} />;
      case "cognitive":
        return <Brain size={16} />;
      case "mindfulness":
        return <Award size={16} />;
      default:
        return <Brain size={16} />;
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      beginner: { class: "difficulty-beginner", label: "Beginner" },
      intermediate: { class: "difficulty-intermediate", label: "Intermediate" },
      advanced: { class: "difficulty-advanced", label: "Advanced" },
    };
    const badge = badges[difficulty] || badges.beginner;
    return (
      <span className={`difficulty-badge ${badge.class}`}>{badge.label}</span>
    );
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || ex.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      header: "Title",
      accessor: "title",
      render: (row) => (
        <div className="exercise-title">
          {getCategoryIcon(row.category)}
          <span>{row.title}</span>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "category",
      render: (row) => (
        <span className="category-badge">{row.category.replace("-", " ")}</span>
      ),
    },
    {
      header: "Duration",
      accessor: "duration",
      render: (row) => (
        <div className="duration">
          <Clock size={14} />
          {row.duration} min
        </div>
      ),
    },
    {
      header: "Difficulty",
      accessor: "difficulty",
      render: (row) => getDifficultyBadge(row.difficulty),
    },
    {
      header: "Usage",
      accessor: "usageCount",
      render: (row) => (
        <span className="usage-count">{row.usageCount || 0} clients</span>
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
      icon: <Users size={18} />,
      label: "Assign to Client",
      name: "assign",
      className: "assign",
    },
    {
      icon: <Trash2 size={18} />,
      label: "Delete",
      name: "delete",
      className: "delete",
    },
  ];

  const handleAction = (actionName, row) => {
    setSelectedExercise(row);
    switch (actionName) {
      case "view":
        toast.info(`Viewing: ${row.title}`);
        break;
      case "edit":
        setNewExercise(row);
        setShowCreateModal(true);
        break;
      case "assign":
        setShowAssignModal(true);
        break;
      case "delete":
        if (window.confirm("Are you sure you want to delete this exercise?")) {
          setExercises(exercises.filter((e) => e.id !== row.id));
          toast.success("Exercise deleted");
        }
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
    <div className="cbt-interventions">
      <div className="page-header">
        <div>
          <h1 className="page-title">CBT Interventions</h1>
          <p className="page-subtitle">Create and manage CBT exercises</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          New Exercise
        </button>
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
            <option value="behavioral">Behavioral</option>
            <option value="cognitive">Cognitive</option>
            <option value="mindfulness">Mindfulness</option>
          </select>
        </div>
      </div>

      <div className="exercises-table-container">
        <Table
          columns={columns}
          data={filteredExercises}
          actions={actions}
          onAction={handleAction}
        />
      </div>

      {/* Create Exercise Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewExercise({
            title: "",
            description: "",
            category: "thought-record",
            instructions: "",
            duration: 15,
            difficulty: "beginner",
          });
        }}
        title="Create CBT Exercise"
        size="lg"
      >
        <div className="create-exercise-modal">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={newExercise.title}
              onChange={(e) =>
                setNewExercise({ ...newExercise, title: e.target.value })
              }
              placeholder="e.g., Thought Record Worksheet"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              rows={3}
              value={newExercise.description}
              onChange={(e) =>
                setNewExercise({ ...newExercise, description: e.target.value })
              }
              placeholder="Brief description of the exercise..."
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={newExercise.category}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, category: e.target.value })
                }
                className="form-input"
              >
                <option value="thought-record">Thought Record</option>
                <option value="behavioral">Behavioral Activation</option>
                <option value="cognitive">Cognitive Restructuring</option>
                <option value="mindfulness">Mindfulness</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={newExercise.difficulty}
                onChange={(e) =>
                  setNewExercise({ ...newExercise, difficulty: e.target.value })
                }
                className="form-input"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={newExercise.duration}
              onChange={(e) =>
                setNewExercise({
                  ...newExercise,
                  duration: parseInt(e.target.value),
                })
              }
              min="5"
              max="120"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Instructions *</label>
            <textarea
              rows={6}
              value={newExercise.instructions}
              onChange={(e) =>
                setNewExercise({ ...newExercise, instructions: e.target.value })
              }
              placeholder="Step-by-step instructions for the exercise..."
              className="form-input"
              required
            />
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button className="btn-primary" onClick={handleCreateExercise}>
              Create Exercise
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Exercise Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedClient("");
        }}
        title={`Assign Exercise to Client`}
        size="md"
      >
        <div className="assign-exercise-modal">
          <div className="exercise-preview">
            <h4>{selectedExercise?.title}</h4>
            <p>{selectedExercise?.description}</p>
          </div>

          <div className="form-group">
            <label>Select Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="form-input"
            >
              <option value="">Choose a client...</option>
              {clients.map((client) => (
                <option key={client.patient.id} value={client.patient.id}>
                  {client.patient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Due Date (optional)</label>
            <input type="date" className="form-input" />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              rows={3}
              placeholder="Additional instructions for the client..."
              className="form-input"
            />
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                setShowAssignModal(false);
                setSelectedClient("");
              }}
            >
              Cancel
            </button>
            <button className="btn-primary" onClick={handleAssignExercise}>
              Assign Exercise
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CBTInterventions;

