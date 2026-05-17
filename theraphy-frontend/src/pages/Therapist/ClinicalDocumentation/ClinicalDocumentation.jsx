import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import Table from "../../../components/Common/Table";
import Modal from "../../../components/Common/Modal";
import { getTherapistSessions } from "../../../services/therapistApi";
import "./ClinicalDocumentation.css";

const ClinicalDocumentation = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [clients, setClients] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    clientId: "",
    sessionDate: "",
    type: "progress-note",
    title: "",
    content: "",
    tags: [],
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, clientFilter]);

  const fetchDocuments = async () => {
    try {
      const response = await getTherapistSessions();
      // Response is directly an array of sessions
      const sessions = Array.isArray(response) ? response : [];

      // Transform sessions into documents
      const docs = sessions.map((session) => ({
        id: session.id,
        clientId: session.client?.id,
        clientName: session.client?.name || "Unknown",
        date: session.date,
        type: "session-note",
        title: `Session Note - ${new Date(session.date).toLocaleDateString()}`,
        content: session.notes || "",
        status: session.status || "draft",
      }));

      setDocuments(docs);

      // Extract unique clients for filter
      const uniqueClients = [
        ...new Set(docs.map((d) => d.clientId).filter(Boolean)),
      ].map((id) => ({
        id,
        name: docs.find((d) => d.clientId === id)?.clientName,
      }));
      setClients(uniqueClients);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch documentation");
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.content?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (clientFilter !== "all") {
      filtered = filtered.filter((doc) => doc.clientId === clientFilter);
    }

    setFilteredDocs(filtered);
  };

  const handleCreateDocument = () => {
    if (
      !newDocument.clientId ||
      !newDocument.sessionDate ||
      !newDocument.content
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const newDoc = {
      id: Date.now().toString(),
      clientId: newDocument.clientId,
      clientName: clients.find((c) => c.id === newDocument.clientId)?.name,
      date: newDocument.sessionDate,
      type: newDocument.type,
      title:
        newDocument.title ||
        `Clinical Note - ${new Date(newDocument.sessionDate).toLocaleDateString()}`,
      content: newDocument.content,
      status: "draft",
    };

    setDocuments([newDoc, ...documents]);
    setShowNewDocModal(false);
    setNewDocument({
      clientId: "",
      sessionDate: "",
      type: "progress-note",
      title: "",
      content: "",
      tags: [],
    });
    toast.success("Document created successfully");
  };

  const columns = [
    {
      header: "Date",
      accessor: "date",
      render: (row) => (
        <div className="doc-date">
          <Calendar size={14} />
          {new Date(row.date).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Client",
      accessor: "clientName",
    },
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Type",
      accessor: "type",
      render: (row) => (
        <span className={`doc-type ${row.type}`}>
          {row.type.replace("-", " ")}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span className={`doc-status ${row.status}`}>{row.status}</span>
      ),
    },
  ];

  const actions = [
    {
      icon: <Eye size={18} />,
      label: "View",
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
      icon: <Download size={18} />,
      label: "Export",
      name: "export",
      className: "export",
    },
    {
      icon: <Trash2 size={18} />,
      label: "Delete",
      name: "delete",
      className: "delete",
    },
  ];

  const handleAction = (actionName, row) => {
    setSelectedDoc(row);
    switch (actionName) {
      case "view":
        setShowDocModal(true);
        break;
      case "edit":
        setNewDocument({
          clientId: row.clientId,
          sessionDate: row.date,
          type: row.type,
          title: row.title,
          content: row.content,
          tags: [],
        });
        setShowNewDocModal(true);
        break;
      case "export": {
        const dataStr = JSON.stringify(row, null, 2);
        const dataUri =
          "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        const exportFileDefaultName = `clinical-note-${row.clientName}-${new Date(row.date).toLocaleDateString()}.json`;
        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();
        break;
      }
      case "delete":
        if (window.confirm("Are you sure you want to delete this document?")) {
          setDocuments(documents.filter((d) => d.id !== row.id));
          toast.success("Document deleted");
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
    <div className="clinical-documentation">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinical Documentation</h1>
          <p className="page-subtitle">
            Manage session notes and clinical records
          </p>
        </div>
        <button
          className="btn-primary new-doc-btn"
          onClick={() => setShowNewDocModal(true)}
        >
          <Plus size={20} />
          New Document
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <Filter size={18} />
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="all">All Clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <FileText size={24} />
          <div>
            <span className="stat-value">{documents.length}</span>
            <span className="stat-label">Total Documents</span>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <span className="stat-value">
              {documents.filter((d) => d.status === "completed").length}
            </span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <span className="stat-value">
              {documents.filter((d) => d.status === "draft").length}
            </span>
            <span className="stat-label">Drafts</span>
          </div>
        </div>
      </div>

      <div className="documents-table-container">
        <Table
          columns={columns}
          data={filteredDocs}
          actions={actions}
          onAction={handleAction}
        />
      </div>

      {/* View Document Modal */}
      <Modal
        isOpen={showDocModal}
        onClose={() => {
          setShowDocModal(false);
          setSelectedDoc(null);
        }}
        title={`Clinical Note - ${selectedDoc?.clientName}`}
        size="lg"
      >
        <div className="view-doc-modal">
          <div className="doc-header">
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedDoc?.date).toLocaleString()}
            </p>
            <p>
              <strong>Type:</strong> {selectedDoc?.type}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`doc-status ${selectedDoc?.status}`}>
                {selectedDoc?.status}
              </span>
            </p>
          </div>
          <div className="doc-content">
            <h4>{selectedDoc?.title}</h4>
            <p>{selectedDoc?.content}</p>
          </div>
        </div>
      </Modal>

      {/* New Document Modal */}
      <Modal
        isOpen={showNewDocModal}
        onClose={() => {
          setShowNewDocModal(false);
          setNewDocument({
            clientId: "",
            sessionDate: "",
            type: "progress-note",
            title: "",
            content: "",
            tags: [],
          });
        }}
        title="Create New Clinical Document"
        size="lg"
      >
        <div className="new-doc-modal">
          <div className="form-group">
            <label>Client *</label>
            <select
              value={newDocument.clientId}
              onChange={(e) =>
                setNewDocument({ ...newDocument, clientId: e.target.value })
              }
              className="form-input"
              required
            >
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Session Date *</label>
              <input
                type="datetime-local"
                value={newDocument.sessionDate}
                onChange={(e) =>
                  setNewDocument({
                    ...newDocument,
                    sessionDate: e.target.value,
                  })
                }
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Document Type</label>
              <select
                value={newDocument.type}
                onChange={(e) =>
                  setNewDocument({ ...newDocument, type: e.target.value })
                }
                className="form-input"
              >
                <option value="progress-note">Progress Note</option>
                <option value="intake-note">Intake Note</option>
                <option value="treatment-plan">Treatment Plan</option>
                <option value="discharge-summary">Discharge Summary</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={newDocument.title}
              onChange={(e) =>
                setNewDocument({ ...newDocument, title: e.target.value })
              }
              placeholder="Document title"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              rows={8}
              value={newDocument.content}
              onChange={(e) =>
                setNewDocument({ ...newDocument, content: e.target.value })
              }
              placeholder="Write your clinical notes here..."
              className="form-input"
              required
            />
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowNewDocModal(false)}
            >
              Cancel
            </button>
            <button className="btn-primary" onClick={handleCreateDocument}>
              Create Document
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClinicalDocumentation;

