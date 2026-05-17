import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import Table from "../../../components/Common/Table";
import Modal from "../../../components/Common/Modal";
import { getEmergencyLogs, handleEmergency } from "../../../services/api";
import "./Emergency.css";

const Emergency = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showHandleModal, setShowHandleModal] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      const data = await getEmergencyLogs();
      setEmergencies(data.emergencies || []);
    } catch (error) {
      console.log(error.message);
      toast.error("Failed to fetch emergencies");
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyAction = async () => {
    try {
      await handleEmergency(selectedEmergency.id, { notes });
      toast.success("Emergency handled successfully");
      setShowHandleModal(false);
      setNotes("");
      fetchEmergencies();
    } catch (error) {
      console.log(error.message);
      toast.error("Failed to handle emergency");
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "critical":
        return "severity-critical";
      case "high":
        return "severity-high";
      case "medium":
        return "severity-medium";
      case "low":
        return "severity-low";
      default:
        return "";
    }
  };

  const columns = [
    {
      header: "Client",
      accessor: "client",
      render: (row) => row.client?.name || "Unknown",
    },
    {
      header: "Message",
      accessor: "message",
      render: (row) => (
        <div className="emergency-message">
          <AlertCircle size={16} />
          {row.message}
        </div>
      ),
    },
    {
      header: "Severity",
      accessor: "severity",
      render: (row) => (
        <span className={`severity-badge ${getSeverityClass(row.severity)}`}>
          {row.severity}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "handled",
      render: (row) => (
        <span className={`status-badge ${row.handled ? "handled" : "pending"}`}>
          {row.handled ? "Handled" : "Pending"}
        </span>
      ),
    },
    {
      header: "Time",
      accessor: "createdAt",
      render: (row) => (
        <div className="time-cell">
          <Clock size={14} />
          {new Date(row.createdAt).toLocaleString()}
        </div>
      ),
    },
    {
      header: "Handled By",
      accessor: "handledBy",
      render: (row) => row.handledBy?.name || "-",
    },
  ];

  const actions = [
    {
      icon: <CheckCircle size={18} />,
      label: "Handle Emergency",
      name: "handle",
      className: "handle",
      condition: (row) => !row.handled,
    },
  ];

  const handleAction = (actionName, row) => {
    if (actionName === "handle") {
      setSelectedEmergency(row);
      setShowHandleModal(true);
    }
  };

  return (
    <div className="emergency-page">
      <div className="page-header">
        <h1 className="page-title">Emergency Management</h1>
      </div>

      <div className="emergency-stats">
        <div className="stat-card pending">
          <div className="stat-value">
            {emergencies.filter((e) => !e.handled).length}
          </div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card handled">
          <div className="stat-value">
            {emergencies.filter((e) => e.handled).length}
          </div>
          <div className="stat-label">Handled</div>
        </div>
        <div className="stat-card total">
          <div className="stat-value">{emergencies.length}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      <Table
        columns={columns}
        data={emergencies}
        actions={actions}
        onAction={handleAction}
      />

      <Modal
        isOpen={showHandleModal}
        onClose={() => {
          setShowHandleModal(false);
          setNotes("");
        }}
        title="Handle Emergency"
      >
        <div className="handle-emergency-modal">
          <div className="emergency-details">
            <h4>Client: {selectedEmergency?.client?.name}</h4>
            <p className="emergency-message-detail">
              <AlertCircle size={16} />
              {selectedEmergency?.message}
            </p>
            <p className="emergency-severity">
              Severity:{" "}
              <span className={getSeverityClass(selectedEmergency?.severity)}>
                {selectedEmergency?.severity}
              </span>
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Resolution Notes</label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe how this emergency was handled..."
              className="form-input"
            />
          </div>

          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowHandleModal(false);
                setNotes("");
              }}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleEmergencyAction}>
              Mark as Handled
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Emergency;

