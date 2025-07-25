import { useContext, useEffect, useState } from 'react';
import orderContext from '../context/order/orderContext';
import Spinner from './Spinner';
import { useNavigate } from 'react-router-dom';
import '../Style/MyOrders.css';
import alertContext from '../context/alert/alertContext';

const MyOrders = () => {
    const { orders, fetchOrders } = useContext(orderContext);
    const { showAlert } = useContext(alertContext);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);
    
    const cancelReasons = [
        "Changed my mind",
        "Found a better price elsewhere",
        "Ordered by mistake",
        "Shipping takes too long",
        "Other"
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (orders.length === 0) {
                    await fetchOrders();
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const openCancelModal = (orderId, e) => {
        e.stopPropagation();
        setCancelOrderId(orderId);
        setShowCancelModal(true);
    };
    
    const closeCancelModal = () => {
        setShowCancelModal(false);
        setCancelOrderId(null);
        setCancelReason('');
        setOtherReason('');
    };
    
    const handleCancelOrder = async () => {
        if (!cancelReason) {
            showAlert("Please select a reason for cancellation");
            return;
        }
        
        if (cancelReason === "Other" && !otherReason.trim()) {
            showAlert("Please provide a reason for cancellation");
            return;
        }
        
        const finalReason = cancelReason === "Other" ? otherReason : cancelReason;
        
        setCancelLoading(true);
        try {
            const response = await fetch(`/api/order/cancel-request/${cancelOrderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ reason: finalReason })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showAlert("Cancellation request sent successfully", "success")
                await fetchOrders();
                closeCancelModal();
            } else {
                showAlert(data.error, "danger");
            }
        } catch (error) {
            console.error("Error requesting cancellation:", error);
            showAlert("An error occurred while requesting cancellation", "danger");
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4 fw-bold">My Orders</h2>
            {
                loading ? (
                    <div className="d-flex flex-column align-items-center justify-content-center my-5 py-5">
                            <Spinner />
                    </div>
                ) : (
                    orders.length === 0 ? (
                        <div className="text-center my-5 py-5">
                            <i className="bi bi-box-seam fs-1 text-muted mb-3"></i>
                            <h3 className="fs-4 text-muted mb-2">No orders found</h3>
                            <p className="text-muted mb-4">Your order history will appear here</p>
                            <button
                                className="btn btn-primary px-4 rounded-pill"
                                onClick={() => navigate('/')}
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {orders.map((order) => (
                                <div key={order._id} className="col-lg-6">
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-header bg-transparent border-0 pt-3 pb-0">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="card-title mb-0 text-truncate" style={{ maxWidth: '200px' }}>
                                                    <span className="text-muted">Order #</span>
                                                    <span className="fw-bold text-dark ms-1">{order._id.slice(-6).toUpperCase()}</span>
                                                </h5>
                                                <span className={`badge rounded-pill px-3 py-2 bg-opacity-10 ${order.status === 'Delivered' ? 'bg-success text-success' :
                                                        order.status === 'Cancelled' ? 'bg-danger text-danger' :
                                                            'bg-warning text-warning'
                                                    } fw-semibold`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-body pt-2 pb-3">
                                            <div className="d-flex justify-content-between mb-3">
                                                <div>
                                                    <small className="text-muted">Date</small>
                                                    <p className="mb-0 fw-medium">
                                                        <i className="bi bi-calendar me-1"></i>
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-end">
                                                    <small className="text-muted">Total</small>
                                                    <p className="mb-0 fw-bold text-success">${order.totalPrice.toFixed(2)}</p>
                                                </div>
                                            </div>

                                            <hr className="my-2 opacity-25" />

                                            <div className="mb-3">
                                                <small className="text-muted">Payment method</small>
                                                <p className="mb-0 fw-medium text-capitalize">
                                                    <i className={`bi ${order.paymentMethod === 'credit card' ? 'bi-credit-card' :
                                                            order.paymentMethod === 'paypal' ? 'bi-paypal' :
                                                                'bi-cash'
                                                        } me-1`}></i>
                                                    {order.paymentMethod}
                                                </p>
                                            </div>

                                            <div className="mt-3">
                                                <small className="text-muted">Items ({order.orderItems.length})</small>
                                                <div className="list-group list-group-flush">
                                                    {order.orderItems.slice(0, 3).map((item) => (
                                                        <div key={item._id} className="list-group-item border-0 px-0 py-2">
                                                            <div className="d-flex align-items-center">
                                                                <div className="flex-shrink-0 me-3">
                                                                    <img
                                                                        src={item.image}
                                                                        alt={item.name}
                                                                        width="48"
                                                                        height="48"
                                                                        onError={(e) => (e.target.src = '/default-product.png')}
                                                                        className="rounded-2 border object-fit-cover bg-light"
                                                                    />
                                                                </div>
                                                                <div className="flex-grow-1 overflow-hidden">
                                                                    <h6 className="mb-0 fw-medium text-truncate" style={{ maxWidth: '250px' }}>
                                                                        {item.name}
                                                                    </h6>
                                                                    <small className="text-muted">Qty: {item.quantity}</small>
                                                                </div>
                                                                <div className="flex-shrink-0 text-end ms-2">
                                                                    <div className="fw-bold text-dark">${item.price.toFixed(2)}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {order.orderItems.length > 3 && (
                                                        <div className="text-center pt-1">
                                                            <small className="text-muted">
                                                                +{order.orderItems.length - 3} more items
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-footer bg-transparent border-0 pt-0 pb-3">
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-outline-primary flex-grow-1 rounded-pill"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/order/${order._id}`);
                                                    }}
                                                >
                                                    View Details
                                                </button>
                                                {/* Only show cancel button for orders that are not delivered or already cancelled */}
                                                {!['Delivered', 'Cancelled'].includes(order.status) && (
                                                    <button
                                                        className={`btn ${order.cancellationRequest ? 
                                                            order.cancellationRequest.status === 'Approved' ? 'btn-outline-success' : 
                                                            order.cancellationRequest.status === 'Rejected' ? 'btn-outline-danger' : 
                                                            'btn-outline-secondary' : 'btn-outline-danger'} rounded-pill`}
                                                        onClick={(e) => openCancelModal(order._id, e)}
                                                        disabled={order.cancellationRequest}
                                                    >
                                                        {order.cancellationRequest ? 
                                                            order.cancellationRequest.status === 'Approved' ? 'Cancellation Approved' : 
                                                            order.cancellationRequest.status === 'Rejected' ? 'Cancellation Rejected' : 
                                                            'Cancellation Requested' : 'Cancel Order'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )
            }
            
            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Cancel Order</h5>
                                <button type="button" className="btn-close" onClick={closeCancelModal}></button>
                            </div>
                            <div className="modal-body">
                                <p>Please select a reason for cancellation:</p>
                                <div className="mb-3">
                                    {cancelReasons.map((reason) => (
                                        <div className="form-check mb-2" key={reason}>
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="cancelReason"
                                                id={`reason-${reason.replace(/\s+/g, '-').toLowerCase()}`}
                                                value={reason}
                                                checked={cancelReason === reason}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                            />
                                            <label className="form-check-label" htmlFor={`reason-${reason.replace(/\s+/g, '-').toLowerCase()}`}>
                                                {reason}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                
                                {cancelReason === "Other" && (
                                    <div className="mb-3">
                                        <label htmlFor="otherReason" className="form-label">Please specify:</label>
                                        <textarea
                                            className="form-control"
                                            id="otherReason"
                                            rows="3"
                                            value={otherReason}
                                            onChange={(e) => setOtherReason(e.target.value)}
                                            placeholder="Please provide details..."
                                        ></textarea>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeCancelModal}>Close</button>
                                <button 
                                    type="button" 
                                    className="btn btn-danger"
                                    onClick={handleCancelOrder}
                                    disabled={cancelLoading}
                                >
                                    {cancelLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Processing...
                                        </>
                                    ) : 'Submit Cancellation Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;