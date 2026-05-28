import { useState, useEffect } from "react";
import { UserPlus, Search, CheckCircle, XCircle, Filter, Users, UserX } from "lucide-react";
import toast from "react-hot-toast";
import Table from "../../../components/Common/Table";
import Modal from "../../../components/Common/Modal";
import {
  getClients,
  getTherapists,
  getAllUsers,
  assignTherapist,
  getAllAssignments,
  endAssignment,
} from "../../../services/api";
import "./AssignTherapist.css";

const AssignTherapist = () => {
  const [clients, setClients] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'assigned', 'unassigned'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch clients and therapists
      let processedClients = [];
      let processedTherapists = [];

      try {
        const clientsData = await getClients();
        processedClients = Array.isArray(clientsData)
          ? clientsData
          : clientsData?.clients ?? [];
      } catch (clientErr) {
        console.warn('getClients failed, falling back to admin users:', clientErr);
      }

      try {
        const therapistsData = await getTherapists();
        processedTherapists = Array.isArray(therapistsData)
          ? therapistsData
          : therapistsData?.therapists ?? [];
      } catch (therapistErr) {
        console.warn('getTherapists failed, falling back to admin users:', therapistErr);
      }

      if (processedClients.length === 0 || processedTherapists.length === 0) {
        const allUsers = await getAllUsers({ all: 'true' });
        if (processedClients.length === 0) {
          processedClients = allUsers
            .filter((u) => u.role === 'client' && u.patientId)
            .map((u) => ({
              id: u.patientId,
              userId: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              primaryPhobia: u.primaryPhobia,
              currentAnxietyLevel: u.currentAnxietyLevel,
            }));
        }
        if (processedTherapists.length === 0) {
          processedTherapists = allUsers
            .filter((u) => u.role === 'therapist' && u.therapistId)
            .map((u) => ({
              id: u.therapistId,
              name: u.name,
              email: u.email,
              specialization: u.specialization,
              yearsOfExperience: u.yearsOfExperience,
              isVerified: u.isVerified,
            }));
        }
      }

      // Fetch all assignments
      let assignmentsData = [];
      
      try {
        const allAssignmentsResponse = await getAllAssignments();
        
        if (allAssignmentsResponse?.assignments) {
          assignmentsData = allAssignmentsResponse.assignments
            .filter((item) => item.patient && item.therapist)
            .map((item) => ({
              id: item.id,
              patient: item.patient,
              therapist: item.therapist,
              assignedDate: item.assignedDate || item.assignedAt || item.startDate,
              endDate: item.endDate,
              notes: item.notes,
              isActive: item.isActive ?? item.status === 'active',
              assignedBy: item.assignedBy,
            }));
        }
      } catch (error) {
        console.log("Could not fetch assignments:", error);
      }

      // Create a map of active assignments by patient ID
      const activeAssignmentsByPatient = {};
      assignmentsData.forEach(assignment => {
        if (assignment.isActive && assignment.patient?.id) {
          activeAssignmentsByPatient[assignment.patient.id] = assignment;
        }
      });

      setClients(processedClients);
      setTherapists(processedTherapists);
      setAssignments(assignmentsData);
      
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTherapist) {
      toast.error("Please select a therapist");
      return;
    }

    try {
      const response = await assignTherapist({
        clientId: selectedClient.id,
        therapistId: selectedTherapist,
        notes: assignmentNotes,
      });

      toast.success(response.message || "Therapist assigned successfully");
      setShowAssignModal(false);
      setSelectedTherapist("");
      setAssignmentNotes("");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Assign error:", error);
      toast.error(error.response?.data?.message || "Failed to assign therapist");
    }
  };

  const handleEndAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      const response = await endAssignment(selectedAssignment.id);
      toast.success(response.message || "Assignment ended successfully");
      setShowEndModal(false);
      setSelectedAssignment(null);
      fetchData();
    } catch (error) {
      console.error("End assignment error:", error);
      toast.error(error.response?.data?.message || "Failed to end assignment");
    }
  };

  // Get active assignment for a client
  const getActiveAssignment = (clientId) => {
    return assignments.find(
      (assignment) => 
        assignment.patient?.id === clientId && 
        assignment.isActive === true
    );
  };

  // Get all assignments for a client (history)
  const getClientAssignments = (clientId) => {
    return assignments.filter(
      (assignment) => assignment.patient?.id === clientId
    );
  };

  // Filter clients with active assignments
  const getAssignedClients = () => {
    return clients.filter(client => {
      const activeAssignment = getActiveAssignment(client.id);
      return activeAssignment !== undefined;
    });
  };

  // Filter clients without active assignments
  const getUnassignedClients = () => {
    return clients.filter(client => {
      const activeAssignment = getActiveAssignment(client.id);
      return activeAssignment === undefined;
    });
  };

  // Filter clients based on search
  const filterClientsBySearch = (clientsList) => {
    if (!searchTerm) return clientsList;
    
    return clientsList.filter(
      (client) =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get therapist name from ID
  const getTherapistName = (therapistId) => {
    if (!therapistId) return "Unknown";
    
    if (typeof therapistId === 'object' && therapistId !== null) {
      return therapistId.name || "Unknown";
    }
    
    const therapist = therapists.find(t => t.id === therapistId);
    return therapist?.name || "Unknown";
  };

  // Get therapist specialization
  const getTherapistSpecialization = (therapistId) => {
    if (!therapistId) return "";
    
    if (typeof therapistId === 'object' && therapistId !== null) {
      return therapistId.specialization || "";
    }
    
    const therapist = therapists.find(t => t.id === therapistId);
    return therapist?.specialization || "";
  };

  // Columns for assigned clients table
  const assignedColumns = [
    {
      header: "Client",
      accessor: "name",
      render: (row) => {
        const assignment = getActiveAssignment(row.id);
        return (
          <div className="client-info">
            <strong>{row.name}</strong>
            <small>{row.email}</small>
            {assignment && (
              <small className="assignment-date">
                Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}
              </small>
            )}
          </div>
        );
      },
    },
    {
      header: "Contact",
      accessor: "phone",
      render: (row) => row.phone || "Not provided",
    },
    {
      header: "Primary Phobia",
      accessor: "primaryPhobia",
      render: (row) => row.primaryPhobia || "Not specified",
    },
    {
      header: "Assigned Therapist",
      accessor: "id",
      render: (row) => {
        const assignment = getActiveAssignment(row.id);
        
        if (assignment) {
          const therapistName = getTherapistName(assignment.therapist);
          const specialization = getTherapistSpecialization(assignment.therapist);
          
          return (
            <div className="therapist-info">
              <span className="therapist-name">
                <CheckCircle size={14} className="assigned-icon" />
                {therapistName}
              </span>
              {specialization && (
                <small className="therapist-specialization">
                  {specialization}
                </small>
              )}
              {assignment.notes && (
                <small className="assignment-notes">
                  Note: {assignment.notes.substring(0, 30)}
                  {assignment.notes.length > 30 ? "..." : ""}
                </small>
              )}
            </div>
          );
        }
        
        return null;
      },
    },
    {
      header: "Status",
      accessor: "id",
      render: () => (
        <span className="status-badge assigned">
          <CheckCircle size={14} />
          Active
        </span>
      ),
    },
  ];

  // Columns for unassigned clients table
  const unassignedColumns = [
    {
      header: "Client",
      accessor: "name",
      render: (row) => (
        <div className="client-info">
          <strong>{row.name}</strong>
          <small>{row.email}</small>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: "phone",
      render: (row) => row.phone || "Not provided",
    },
    {
      header: "Primary Phobia",
      accessor: "primaryPhobia",
      render: (row) => row.primaryPhobia || "Not specified",
    },
    {
      header: "Assignment History",
      accessor: "id",
      render: (row) => {
        const clientAssignments = getClientAssignments(row.id);
        
        if (clientAssignments.length > 0) {
          return (
            <div className="history-info">
              <small className="history-count">
                {clientAssignments.length} previous assignment(s)
              </small>
              {clientAssignments.slice(0, 2).map((a, idx) => (
                <small key={idx} className="history-item">
                  {new Date(a.assignedDate).toLocaleDateString()} - 
                  {a.isActive ? 'Active' : 'Ended'}
                </small>
              ))}
            </div>
          );
        }
        
        return <span className="no-history">No assignment history</span>;
      },
    },
    {
      header: "Status",
      accessor: "id",
      render: () => (
        <span className="status-badge unassigned">
          <XCircle size={14} />
          Pending
        </span>
      ),
    },
  ];

  // Actions for assigned clients
  const assignedActions = [
    {
      icon: <XCircle size={18} />,
      label: "End Assignment",
      name: "end",
      className: "end",
    },
  ];

  // Actions for unassigned clients
  const unassignedActions = [
    {
      icon: <UserPlus size={18} />,
      label: "Assign Therapist",
      name: "assign",
      className: "assign",
    },
  ];

  const handleAction = (actionName, row) => {
    if (actionName === "assign") {
      setSelectedClient(row);
      setShowAssignModal(true);
    } else if (actionName === "end") {
      const assignment = getActiveAssignment(row.id);
      setSelectedAssignment(assignment);
      setShowEndModal(true);
    }
  };

  // Get filtered lists
  const assignedClients = filterClientsBySearch(getAssignedClients());
  const unassignedClients = filterClientsBySearch(getUnassignedClients());

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="assign-therapist-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Therapist Assignment</h1>
          <p className="page-subtitle">Manage therapist-client assignments</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-label">Total Clients:</span>
            <span className="stat-value">{clients.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Available Therapists:</span>
            <span className="stat-value">{therapists.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Active Assignments:</span>
            <span className="stat-value">
              {assignments.filter(a => a.isActive).length}
            </span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <Users size={16} />
            All Clients ({clients.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('assigned')}
          >
            <CheckCircle size={16} />
            Assigned ({assignedClients.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'unassigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('unassigned')}
          >
            <UserX size={16} />
            Unassigned ({unassignedClients.length})
          </button>
        </div>
      </div>

      {/* All Clients View */}
      {activeTab === 'all' && (
        <div className="tables-container">
          <div className="table-section">
            <div className="table-header">
              <h3>
                <CheckCircle size={18} className="header-icon assigned" />
                Clients with Active Therapist ({assignedClients.length})
              </h3>
            </div>
            <Table
              columns={assignedColumns}
              data={assignedClients}
              actions={assignedActions}
              onAction={handleAction}
              emptyMessage="No clients with an active therapist yet"
            />
          </div>

          <div className="table-section">
            <div className="table-header">
              <h3>
                <UserX size={18} className="header-icon unassigned" />
                Clients Needing Therapist ({unassignedClients.length})
              </h3>
            </div>
            <Table
              columns={unassignedColumns}
              data={unassignedClients}
              actions={unassignedActions}
              onAction={handleAction}
              emptyMessage="All clients have an active therapist"
            />
          </div>
        </div>
      )}

      {/* Assigned Clients Only View */}
      {activeTab === 'assigned' && (
        <div className="table-section">
          <div className="table-header">
            <h3>
              <CheckCircle size={18} className="header-icon assigned" />
              Clients with Active Therapist ({assignedClients.length})
            </h3>
          </div>
          <Table
            columns={assignedColumns}
            data={assignedClients}
            actions={assignedActions}
            onAction={handleAction}
            emptyMessage="No clients with an active therapist yet"
          />
        </div>
      )}

      {/* Unassigned Clients Only View */}
      {activeTab === 'unassigned' && (
        <div className="table-section">
          <div className="table-header">
            <h3>
              <UserX size={18} className="header-icon unassigned" />
              Clients Needing Therapist ({unassignedClients.length})
            </h3>
          </div>
          <Table
            columns={unassignedColumns}
            data={unassignedClients}
            actions={unassignedActions}
            onAction={handleAction}
            emptyMessage="All clients have an active therapist"
          />
        </div>
      )}

      {/* Assign Therapist Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedTherapist("");
          setAssignmentNotes("");
        }}
        title={`Assign Therapist to ${selectedClient?.name || "Client"}`}
        size="lg"
      >
        <div className="assign-form">
          <div className="client-summary">
            <h4>Client Details</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Email:</span>
                <span className="summary-value">{selectedClient?.email}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Phone:</span>
                <span className="summary-value">
                  {selectedClient?.phone || "Not provided"}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Primary Phobia:</span>
                <span className="summary-value">
                  {selectedClient?.primaryPhobia || "Not specified"}
                </span>
              </div>
            </div>

            {/* Show assignment history */}
            {selectedClient && (
              <div className="history-summary">
                <h5>Assignment History</h5>
                {getClientAssignments(selectedClient.id).length > 0 ? (
                  <div className="history-list">
                    {getClientAssignments(selectedClient.id).map((a, idx) => (
                      <div key={idx} className="history-item">
                        <span className={`history-status ${a.isActive ? 'active' : 'inactive'}`}>
                          {a.isActive ? 'Active' : 'Ended'}
                        </span>
                        <span className="history-therapist">
                          {getTherapistName(a.therapist)}
                        </span>
                        <span className="history-date">
                          {new Date(a.assignedDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-history">No previous assignments</p>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="therapist">
              Select Therapist <span className="required">*</span>
            </label>
            <select
              id="therapist"
              value={selectedTherapist}
              onChange={(e) => setSelectedTherapist(e.target.value)}
              className="form-input"
              required
            >
              <option value="">Choose a therapist...</option>
              {therapists.map((therapist) => (
                <option key={therapist.id} value={therapist.id}>
                  {therapist.name} - {therapist.specialization || "General Therapist"}
                  {therapist.yearsOfExperience ? ` (${therapist.yearsOfExperience} yrs exp)` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Assignment Notes</label>
            <textarea
              id="notes"
              rows={4}
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              placeholder="Add any notes about this assignment"
              className="form-input"
            />
          </div>

          {selectedTherapist && (
            <div className="therapist-preview">
              <h4>Selected Therapist</h4>
              {therapists
                .filter((t) => t.id === selectedTherapist)
                .map((therapist) => (
                  <div key={therapist.id} className="therapist-details">
                    <div className="detail-row">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{therapist.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{therapist.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Specialization:</span>
                      <span className="detail-value">
                        {therapist.specialization || "General"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Experience:</span>
                      <span className="detail-value">
                        {therapist.yearsOfExperience || 0} years
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowAssignModal(false);
                setSelectedTherapist("");
                setAssignmentNotes("");
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAssign}
              disabled={!selectedTherapist}
            >
              Assign Therapist
            </button>
          </div>
        </div>
      </Modal>

      {/* End Assignment Modal */}
      <Modal
        isOpen={showEndModal}
        onClose={() => {
          setShowEndModal(false);
          setSelectedAssignment(null);
        }}
        title="End Assignment"
        size="md"
      >
        <div className="end-assignment-modal">
          <p>Are you sure you want to end this assignment?</p>
          {selectedAssignment && (
            <div className="assignment-summary">
              <p>
                <strong>Client:</strong> {selectedAssignment.patient?.name || "Unknown"}
              </p>
              <p>
                <strong>Therapist:</strong> {getTherapistName(selectedAssignment.therapist)}
              </p>
              <p>
                <strong>Assigned:</strong> {new Date(selectedAssignment.assignedDate).toLocaleDateString()}
              </p>
            </div>
          )}
          <p className="warning-text">This action cannot be undone.</p>

          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowEndModal(false);
                setSelectedAssignment(null);
              }}
            >
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleEndAssignment}>
              End Assignment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssignTherapist;
