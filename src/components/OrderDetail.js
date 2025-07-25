import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from './Spinner';
import { useContext } from 'react';
import userContext from '../context/user/userContext';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(userContext); 

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/order/${id}`, {
          headers: { 'auth-token': localStorage.getItem('token') }
        });
        const data = await res.json();
        if (res.ok) {
          console.log('Order data:', data); // Add this line to debug
          setOrder(data);
        } else {
          setError(data.error || 'Failed to fetch order details.');
        }
      } catch (err) {
        setError('Something went wrong.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="text-center py-5"><Spinner /></div>;
  if (error) return <div className="alert alert-danger text-center">{error}</div>;
  if (!order) return null;

  return (
    <div className="container py-0 mt-4">
      <h2 className="fw-bold mb-4">Order Details</h2>
      <div className="card mb-4">
        <div className="card-body px-3 py-3">
          <h5 className="card-title fw-bold mb-3">Order ID: {order._id}</h5>
          <p><strong>Status:</strong> {order.status}</p>
          <p className='mb-0'><strong>Order Date:</strong> {order.createdAt ? order.createdAt.slice(0, 10) : ''}</p>
          {user && (user.role === 'admin' || user.role === 'retailer') && (
            <p className='mt-3 mb-0'><strong>Customer:</strong> {order.user?.name || 'N/A'}</p>
          )}
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-body px-3 py-3">
        <h4 className="mb-3 fw-bold">Shipping Address</h4>
          <p><strong>Name:</strong> {order.shippingAddress.fullName}</p>
          <p className='mb-0'><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.pinCode}, {order.shippingAddress.country}</p>
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <h4 className="mb-4 fw-bold">Order Items</h4>
          <div className="row g-3">
            {order.orderItems.map(item => (
              <div key={item._id} className="col-12">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="row g-0">
                    <div className="col-md-2 col-sm-3 col-4 d-flex align-items-center justify-content-center p-2">
                      <img 
                        src={item.image.replace(/`/g, '').trim()} 
                        alt={item.name} 
                        className="img-fluid rounded" 
                        style={{maxHeight: '90px', objectFit: 'contain'}} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/90x90?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="col-md-10 col-sm-9 col-8">
                      <div className="card-body py-2">
                        <h5 className="card-title">{item.name}</h5>
                        <div className="row mt-2">
                          <div className="col-md-4 col-6 mb-2">
                            <small className="text-muted d-block">Price</small>
                            <span>${item.price.toFixed(2)}</span>
                          </div>
                          <div className="col-md-4 col-6 mb-2">
                            <small className="text-muted d-block">Quantity</small>
                            <span>{item.quantity}</span>
                          </div>
                          <div className="col-md-4 col-12 mb-2">
                            <small className="text-muted d-block">Subtotal</small>
                            <span className="fw-bold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-body px-3 py-3">
          <h4 className="mb-3 fw-bold">Payment & Summary</h4>
          <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          <p><strong>Items Price:</strong> ${order.itemsPrice.toFixed(2)}</p>
          <p><strong>Tax Price:</strong> ${order.taxPrice.toFixed(2)}</p>
          <p><strong>Shipping Price:</strong> ${order.shippingPrice.toFixed(2)}</p>
          <p><strong>Total Price:</strong> <span className="fw-bold text-success">${order.totalPrice.toFixed(2)}</span></p>
          <p><strong>Paid:</strong> {order.isPaid ? `Yes (at ${order.paidAt ? new Date(order.paidAt).toLocaleString() : ''})` : 'No'}</p>
          <p className='mb-0'><strong>Delivered:</strong> {order.isDelivered ? `Yes (at ${order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : ''})` : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;