import { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, UserCheck, Search, Filter, 
  RefreshCw, Users, Briefcase, Shield, Award, Clock 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/Common/Table';
import { getAllUsers, verifyTherapist } from '../../../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [allUsers, roleFilter, verificationFilter, searchTerm]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const users = await getAllUsers({ all: 'true' });
      setAllUsers(Array.isArray(users) ? users : []);
      setError(null);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to fetch users. Please check your API connection.');
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    try {
      let filtered = [...allUsers];

      if (roleFilter !== 'all') {
        filtered = filtered.filter(user => user.role === roleFilter);
      }

      if (verificationFilter !== 'all') {
        filtered = filtered.filter(user => {
          if (user.role !== 'therapist') return true;
          return verificationFilter === 'verified' ? user.isVerified : !user.isVerified;
        });
      }

      if (searchTerm) {
        filtered = filtered.filter(user => 
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredUsers(filtered);
    } catch (err) {
      console.error('Filter error:', err);
    }
  };

  const handleVerify = async (user) => {
    try {
      await verifyTherapist({
        therapistId: user.therapistId,
        userId: user.id,
      });
      toast.success(`${user.name} verified successfully`);
      fetchAllUsers();
    } catch (error) {
      console.error('Verify therapist error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to verify therapist';
      toast.error(message);
    }
  };

  const getStats = () => {
    return {
      total: allUsers.length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      therapists: allUsers.filter(u => u.role === 'therapist').length,
      clients: allUsers.filter(u => u.role === 'client').length,
      verifiedTherapists: allUsers.filter(u => u.role === 'therapist' && u.isVerified).length,
      unverifiedTherapists: allUsers.filter(u => u.role === 'therapist' && !u.isVerified).length
    };
  };

  const stats = getStats();

  const columns = [
    { 
      header: 'User', 
      accessor: 'name',
      render: (row) => (
        <div className="user-info-cell">
          <div className="user-avatar" style={{
            background: row.role === 'admin' ? '#ef4444' : 
                        row.role === 'therapist' ? '#0054a6' : '#10b981'
          }}>
            {row.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="user-name">
              {row.name}
              {row.role === 'therapist' && !row.isVerified && (
                <span className="pending-badge">Pending</span>
              )}
            </div>
            <div className="user-email">{row.email}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Role', 
      accessor: 'role',
      render: (row) => {
        const roleIcons = {
          admin: <Shield size={14} />,
          therapist: <Briefcase size={14} />,
          client: <Users size={14} />
        };
        return (
          <span className={`role-badge role-${row.role}`}>
            {roleIcons[row.role]}
            {row.role === 'admin' ? ' Admin' : 
             row.role === 'therapist' ? ' Therapist' : ' Client'}
          </span>
        );
      }
    },
    { 
      header: 'Details', 
      accessor: 'role',
      render: (row) => {
        if (row.role === 'therapist') {
          return (
            <div className="therapist-details">
              <div><Award size={12} /> {row.specialization || 'General'}</div>
              <div><Clock size={12} /> {row.yearsOfExperience || 0} yrs</div>
              {row.hourlyRate && <div>💰 ${row.hourlyRate}/hr</div>}
            </div>
          );
        } else {
          return (
            <div className="user-details">
              <div>📱 {row.phone || 'No phone'}</div>
              {row.age && <div>🎂 {row.age} yrs</div>}
            </div>
          );
        }
      }
    },
    { 
      header: 'Status', 
      accessor: 'isVerified',
      render: (row) => {
        if (row.role === 'therapist') {
          return row.isVerified ? 
            <span className="status-badge verified">
              <CheckCircle size={14} /> Verified
            </span> : 
            <span className="status-badge unverified">
              <XCircle size={14} /> Unverified
            </span>;
        } else {
          return <span className="status-badge active">Active</span>;
        }
      }
    },
    { 
      header: 'Joined', 
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    }
  ];

  const actions = [
    {
      icon: <UserCheck size={18} />,
      label: 'Verify Therapist',
      name: 'verify',
      className: 'verify-btn',
      condition: (row) => row.role === 'therapist' && !row.isVerified
    }
  ];

  const handleAction = (action, row) => {
    if (action === 'verify') {
      handleVerify(row);
    }
  };

  if (error) {
    return (
      <div className="user-management">
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
        </div>
        <div className="error-container">
          <strong>Error:</strong> {error}
          <button onClick={fetchAllUsers} className="retry-btn">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <div className="stats-grid">
          <div className="stat-card total">
            <Users size={14} />
            <span>Total</span>
            <span className="stat-number">{stats.total}</span>
          </div>
          <div className="stat-card admin">
            <Shield size={14} />
            <span>Admin</span>
            <span className="stat-number">{stats.admins}</span>
          </div>
          <div className="stat-card therapist">
            <Briefcase size={14} />
            <span>Therapist</span>
            <span className="stat-number">{stats.therapists}</span>
          </div>
          <div className="stat-card client">
            <Users size={14} />
            <span>Client</span>
            <span className="stat-number">{stats.clients}</span>
          </div>
          {stats.unverifiedTherapists > 0 && (
            <div className="stat-card pending">
              <XCircle size={14} />
              <span>Pending</span>
              <span className="stat-number">{stats.unverifiedTherapists}</span>
            </div>
          )}
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, role, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <div className="filter-select">
            <Filter size={18} />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="therapist">Therapists</option>
              <option value="client">Clients</option>
            </select>
          </div>

          <div className="filter-select">
            <select 
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              disabled={roleFilter === 'admin' || roleFilter === 'client'}
            >
              <option value="all">All Status</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <p>No users found</p>
          {(searchTerm || roleFilter !== 'all' || verificationFilter !== 'all') && (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setVerificationFilter('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <Table 
            columns={columns}
            data={filteredUsers}
            actions={actions}
            onAction={handleAction}
          />
        </div>
      )}
    </div>
  );
};

export default UserManagement;
