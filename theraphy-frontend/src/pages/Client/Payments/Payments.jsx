import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Plus,
  Wallet,
  Landmark
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table from '../../../components/Common/Table';
import Modal from '../../../components/Common/Modal';
import { getMyPayments, getPaymentStats, createPayment } from '../../../services/clientApi';
import './Payments.css';

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalPaid: 0,
    completedPayments: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    sessionId: '',
    amount: 0,
    paymentMethod: 'card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const [paymentsData, statsData] = await Promise.all([
        getMyPayments(),
        getPaymentStats()
      ]);
      setPayments(paymentsData || []);
      setStats(statsData || { totalPaid: 0, completedPayments: 0, pendingPayments: 0 });
    } catch (error) {
      toast.error('Failed to fetch payment data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      await createPayment({
        sessionId: paymentForm.sessionId,
        amount: paymentForm.amount,
        paymentMethod: paymentForm.paymentMethod,
        transactionId: generateTransactionId()
      });
      toast.success('Payment completed successfully');
      setShowPaymentModal(false);
      setPaymentForm({
        sessionId: '',
        amount: 0,
        paymentMethod: 'card',
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
      });
      fetchPayments();
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  const generateTransactionId = () => {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card': return <CreditCard size={16} />;
      case 'mobile': return <Wallet size={16} />;
      case 'bank': return <Landmark size={16} />;
      default: return <DollarSign size={16} />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { class: 'status-completed', icon: CheckCircle },
      pending: { class: 'status-pending', icon: Clock },
      failed: { class: 'status-failed', icon: XCircle },
      refunded: { class: 'status-refunded', icon: XCircle }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`status-badge ${badge.class}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  const columns = [
    {
      header: 'Date',
      accessor: 'paymentDate',
      render: (row) => (
        <div className="date-cell">
          <Calendar size={14} />
          {new Date(row.paymentDate).toLocaleDateString()}
        </div>
      )
    },
    {
      header: 'Session',
      accessor: 'session',
      render: (row) => (
        <div className="session-info">
          <strong>{row.session?.type} Session</strong>
          <small>{new Date(row.session?.date).toLocaleDateString()}</small>
        </div>
      )
    },
    {
      header: 'Therapist',
      accessor: 'therapist',
      render: (row) => row.therapist?.name || 'N/A'
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => (
        <span className="amount">${row.amount}</span>
      )
    },
    {
      header: 'Method',
      accessor: 'paymentMethod',
      render: (row) => (
        <span className="payment-method">
          {getPaymentMethodIcon(row.paymentMethod)}
          {row.paymentMethod}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="payments">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Manage your payments and billing</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">${stats.totalPaid}</span>
            <span className="stat-label">Total Spent</span>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.completedPayments}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.pendingPayments}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      <div className="payment-methods-section">
        <h3>Saved Payment Methods</h3>
        <div className="payment-methods-grid">
          <div className="payment-method-card">
            <CreditCard size={24} />
            <div>
              <strong>•••• 4242</strong>
              <span>Expires 12/25</span>
            </div>
            <span className="default-badge">Default</span>
          </div>
          <button className="add-payment-method">
            <Plus size={20} />
            Add New Card
          </button>
        </div>
      </div>

      <div className="payments-table-container">
        <h3>Payment History</h3>
        <Table columns={columns} data={payments} />
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentForm({
            sessionId: '',
            amount: 0,
            paymentMethod: 'card',
            cardNumber: '',
            cardName: '',
            expiryDate: '',
            cvv: ''
          });
        }}
        title="Complete Payment"
        size="lg"
      >
        <div className="payment-modal">
          <div className="session-summary">
            <h4>Session Details</h4>
            <p><strong>Therapist:</strong> {selectedSession?.therapist?.name}</p>
            <p><strong>Date:</strong> {new Date(selectedSession?.date).toLocaleString()}</p>
            <p><strong>Amount:</strong> ${selectedSession?.therapist?.hourlyRate}</p>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <div className="payment-method-selector">
              <button
                className={`method-btn ${paymentForm.paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentForm({...paymentForm, paymentMethod: 'card'})}
              >
                <CreditCard size={20} />
                Card
              </button>
              <button
                className={`method-btn ${paymentForm.paymentMethod === 'mobile' ? 'active' : ''}`}
                onClick={() => setPaymentForm({...paymentForm, paymentMethod: 'mobile'})}
              >
                <Wallet size={20} />
                Mobile Money
              </button>
              <button
                className={`method-btn ${paymentForm.paymentMethod === 'bank' ? 'active' : ''}`}
                onClick={() => setPaymentForm({...paymentForm, paymentMethod: 'bank'})}
              >
                <Landmark size={20} />
                Bank Transfer
              </button>
            </div>
          </div>

          {paymentForm.paymentMethod === 'card' && (
            <>
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                  className="form-input"
                  maxLength="19"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={paymentForm.cardName}
                    onChange={(e) => setPaymentForm({...paymentForm, cardName: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={paymentForm.expiryDate}
                    onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                    className="form-input"
                    maxLength="5"
                  />
                </div>

                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={paymentForm.cvv}
                    onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                    className="form-input"
                    maxLength="3"
                  />
                </div>
              </div>
            </>
          )}

          {paymentForm.paymentMethod === 'mobile' && (
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                placeholder="+1234567890"
                className="form-input"
              />
            </div>
          )}

          {paymentForm.paymentMethod === 'bank' && (
            <div className="bank-details">
              <p><strong>Bank:</strong> TherapyManager Financial</p>
              <p><strong>Account Name:</strong> TherapyManager Inc.</p>
              <p><strong>Account Number:</strong> 1234567890</p>
              <p><strong>Routing Number:</strong> 021000021</p>
              <p className="note">Please use your email as reference</p>
            </div>
          )}

          <div className="payment-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${selectedSession?.therapist?.hourlyRate || 0}</span>
            </div>
            <div className="summary-row">
              <span>Fee:</span>
              <span>$0.00</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${selectedSession?.therapist?.hourlyRate || 0}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handlePayment}
            >
              Pay ${selectedSession?.therapist?.hourlyRate || 0}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;