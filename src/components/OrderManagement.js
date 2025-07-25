import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from './Spinner';
import orderContext from '../context/order/orderContext';
import '../Style/OrderManagement.css'
import { Modal, Button } from 'react-bootstrap';
import alertContext from '../context/alert/alertContext';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  const navigate = useNavigate();
  const { removeOrder } = useContext(orderContext);
  const { showAlert } = useContext(alertContext);
  
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/order/retailer/all', {
          headers: {
            'auth-token': localStorage.getItem('token')
          }
        });
        const data = await res.json();
        if (res.ok && data.orders) {
          const sortedOrders = data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOrders(sortedOrders);
        } else {
          setError(data.error || data.message || 'Failed to fetch orders.');
        }
      } catch (err) {
        setError('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    setActionLoading(true);
    setProcessingOrderId(orderId);
    try {
      const res = await fetch(`/api/order/retailer/update-status/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders(orders => orders.map(o => o._id === orderId ? data.order : o));
      } else {
        showAlert(data.error || 'Failed to update status.');
      }
    } catch (err) {
      showAlert('Something went wrong.');
    } finally {
      setActionLoading(false);
      setProcessingOrderId(null);
    }
  };

  const openConfirmationModal = (orderId, action, order) => {
    setSelectedOrderId(orderId);
    setModalAction(action);
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCancellationRequest = async (orderId, action) => {
    setShowModal(false);
    
    setActionLoading(true);
    setProcessingOrderId(orderId);
    
    try {
      const res = await fetch(`/api/order/retailer/cancellation-request/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ 
          action: action
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.order) {
        setOrders(orders => orders.map(o => o._id === orderId ? data.order : o));
        showAlert(`Cancellation request ${action}ed successfully`);
      } else {
        showAlert(data.error || `Failed to ${action} cancellation request.`);
      }
    } catch (err) {
      console.error(err);
      showAlert('Something went wrong.');
    } finally {
      setActionLoading(false);
      setProcessingOrderId(null);
    }
  };

  const deleteOrder = async (orderId) => {
    setShowModal(false);
    setActionLoading(true);
    setProcessingOrderId(orderId);
    try {
      const res = await fetch(`/api/order/retailer/delete/${orderId}`, {
        method: 'DELETE',
        headers: {
          'auth-token': localStorage.getItem('token')
        }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(orders => orders.filter(o => o._id !== orderId));
        removeOrder(orderId);
        
        setSuccessMessage('Order deleted successfully');
        setShowSuccessModal(true);
        
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 1500);
      } else {
        showAlert(data.error || 'Failed to delete order.', 'danger');
      }
    } catch (err) {
      showAlert('Something went wrong.', 'danger');
    } finally {
      setActionLoading(false);
      setProcessingOrderId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="badge bg-success rounded-pill px-3 py-2">Delivered</span>;
      case 'Pending':
        return <span className="badge bg-warning text-dark rounded-pill px-3 py-2">Pending</span>;
      case 'Cancelled':
        return <span className="badge bg-danger rounded-pill px-3 py-2">Cancelled</span>;
      case 'Processing':
        return <span className="badge bg-info text-dark rounded-pill px-3 py-2">Processing</span>;
      case 'Shipped':
        return <span className="badge bg-primary rounded-pill px-3 py-2">Shipped</span>;
      default:
        return <span className="badge bg-secondary rounded-pill px-3 py-2">{status}</span>;
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/order/${order._id}`);
  };

  const handleViewProduct = (order) => {
    if (order.orderItems && order.orderItems.length > 0) {
      navigate(`/product/${order.orderItems[0].product}`);
    } else {
      showAlert('No product found in this order.');
    }
  };

  return (
    <div className="container py-3"> 
      <h2 className="mb-4 fw-bold">Order Management</h2>
      {loading ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : orders.length === 0 ? (
        <p className="text-center">No orders found.</p>
      ) : (
        <div className="row g-3">
          {orders.map(order => (
            <div key={order._id} className="col-12 col-sm-6 col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h6 className="card-title fw-bold mb-2">Order ID: {order._id}</h6>
                    <p className="mb-1"><strong>Customer:</strong> {order.customerName || order.user?.name || 'N/A'}</p>
                    <p className="mb-1"><strong>Total:</strong> <span className="text-success fw-bold">${order.totalPrice?.toFixed(2) || '0.00'}</span></p>
                    <p className="mb-1"><strong>Status:</strong> {getStatusBadge(order.status)}</p>
                    <p className="mb-3"><strong>Date:</strong> {order.createdAt?.slice(0, 10) || 'N/A'}</p>
                    
                    {/* Display cancellation request if exists */}
                    {order.cancellationRequest && order.cancellationRequest.status === 'Pending' && (
                      <div className="alert alert-warning py-2 px-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong>Cancellation Request</strong>
                          <small>{new Date(order.cancellationRequest.requestedAt).toLocaleDateString()}</small>
                        </div>
                        <p className="mb-2 small">
                          <strong>Reason:</strong> {order.cancellationRequest.reason}
                        </p>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-success w-50" 
                            onClick={() => openConfirmationModal(order._id, 'approve', order)}
                            disabled={actionLoading && processingOrderId === order._id}
                          >
                            {(actionLoading && processingOrderId === order._id) ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : 'Approve'}
                          </button>
                          <button 
                            className="btn btn-sm btn-danger w-50" 
                            onClick={() => openConfirmationModal(order._id, 'reject', order)}
                            disabled={actionLoading && processingOrderId === order._id}
                          >
                            {(actionLoading && processingOrderId === order._id) ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : 'Reject'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Show rejected cancellation request */}
                    {order.cancellationRequest && order.cancellationRequest.status === 'Rejected' && (
                      <div className="alert alert-danger py-2 px-3 mb-3">
                        <small>
                          <strong>Cancellation request rejected</strong>
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-auto">
                    <select
                      className="form-select form-select-sm"
                      value={order.status}
                      disabled={actionLoading || order.status === 'Delivered' || order.status === 'Cancelled'}
                      onChange={e => updateStatus(order._id, e.target.value)}
                    >
                      {ORDER_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button
                      className="btn btn-outline-primary btn-sm w-100"
                      disabled={actionLoading && processingOrderId === order._id}
                      onClick={() => handleViewOrder(order)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm w-100"
                      disabled={actionLoading && processingOrderId === order._id}
                      onClick={() => openConfirmationModal(order._id, 'delete', order)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalAction === 'approve' ? 'Confirm Cancellation Approval' : 
            modalAction === 'reject' ? 'Confirm Cancellation Rejection' : 
            'Confirm Delete Order'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              {modalAction === 'approve' ? (
                <p>Are you sure you want to approve this cancellation request?</p>
              ) : (
                <p>Are you sure you want to delete this order?</p>
              )}
              <div className="alert alert-info">
                <p className="mb-1"><strong>Order ID:</strong> {selectedOrder._id}</p>
                <p className="mb-1"><strong>Customer:</strong> {selectedOrder.customerName || selectedOrder.user?.name || 'N/A'}</p>
                <p className="mb-1"><strong>Total:</strong> <span className="text-success fw-bold">${selectedOrder.totalPrice?.toFixed(2) || '0.00'}</span></p>
                {modalAction === 'approve' && (
                  <p className="mb-0"><strong>Reason:</strong> {selectedOrder.cancellationRequest?.reason}</p>
                )}
              </div>
              <p className="text-danger mb-0">
                {modalAction === 'approve' 
                  ? 'This action will cancel the order and cannot be undone.'
                  : modalAction === 'reject'
                  ? 'This action will reject the cancellation request and cannot be undone.'
                  : 'This action will permanently delete the order and cannot be undone.'}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={modalAction === 'approve' ? 'success' : modalAction === 'reject' ? 'danger' : 'danger'}
            onClick={() => modalAction === 'delete' 
              ? deleteOrder(selectedOrderId)
              : handleCancellationRequest(selectedOrderId, modalAction)
            }
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : modalAction === 'approve' ? 'Confirm Approval' : 
               modalAction === 'reject' ? 'Confirm Rejection' : 'Confirm Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-check-circle-fill text-success me-2"></i>
            Success
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column align-items-center justify-content-center py-2 mb-3">
            <div className="mb-2">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
            </div>
            <h5 className="text-center">{successMessage}</h5>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OrderManagement;