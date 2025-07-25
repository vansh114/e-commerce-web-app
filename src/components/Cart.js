import { useContext, useEffect, useState } from "react";
import cartContext from "../context/cart/cartContext";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import alertContext from "../context/alert/alertContext";
import { Modal, Button } from "react-bootstrap";

const Cart = () => {
  const { cart = [], fetchCart, total, removeFromCart, updateQuantity, clearCart } = useContext(cartContext);
  const { showAlert } = useContext(alertContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [removedProduct, setRemovedProduct] = useState(null);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        if (localStorage.getItem('token')) {
          await fetchCart();
        } else {
          navigate('/login');
        }
      } catch (error) {
        showAlert("Failed to load cart", "danger");
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [navigate, showAlert]);

  const confirmRemove = (productId) => {
    const product = cart.find(item => item.productId === productId);
    if (product) {
      setProductToRemove({
        id: productId,
        title: product.product.title,
        price: product.product.price,
        quantity: product.quantity,
        subtotal: (product.product.price * product.quantity).toFixed(2),
        image: product.product.image
      });
      setShowConfirmModal(true);
    }
  };

  const handleRemove = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      await removeFromCart(productToRemove.id);
      setRemovedProduct(productToRemove);

      setSuccessMessage("Item removed from cart");
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        setRemovedProduct(null);
      }, 1500);
    } finally {
      setLoading(false);
      setProductToRemove(null);
    }
  };

  const handleUpdateQuantity = async (productId, value) => {
    setLoading(true);
    try {
      await updateQuantity(productId, value);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    setLoading(true);
    try {
      await clearCart();

      setSuccessMessage("Cart cleared");
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-2">Shopping Cart</h2>
      {
        loading ?
          (
            <Spinner />
          )
          :
          cart.length !== 0 ?
            (
              <div>
                <div className="d-flex justify-content-end">
                  <button className="btn btn-danger rounded-1" onClick={handleClearCart}>Clear Cart</button>
                </div>
                <div className="container row g-3 justify-content-start mt-3">
                  {cart.map((item) => (
                    <div key={item.product._id} className="container col-12 col-md-12 col-lg-7 mb-3">
                      <div className="card shadow-sm h-100">
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex align-items-center mb-3">
                            <img
                              src={item.product.image}
                              alt={item.product.title}
                              style={{ width: "70px", height: "70px", objectFit: "contain" }}
                              className="me-3 border rounded"
                            />
                            <div>
                              <h5
                                className="card-title mb-1"
                                role="button"
                                onClick={() => navigate(`/product/${item.productId}`)}
                              >{item.product.title}</h5>
                              <div className="text-muted">${item.product.price}</div>
                            </div>
                          </div>
                          <div className="mb-2">
                            <label className="form-label mb-1">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                if (!isNaN(value) && value > 0) {
                                  handleUpdateQuantity(item.productId, value);
                                }
                              }}
                              style={{ width: "80px" }}
                              className="form-control d-inline-block"
                            />
                          </div>
                          <div className="mb-2">
                            <strong>Subtotal: </strong>${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="mt-auto d-flex gap-3 justify-content-end">
                            <button
                              className="btn btn-outline-danger btn-sm rounded-1 w-100"
                              onClick={() => confirmRemove(item.productId)}
                            >
                              Remove
                            </button>
                            <button
                              className="btn btn-outline-success btn-sm rounded-1 w-100"
                              onClick={() => navigate(`/checkout/${item.productId}`)}
                            >
                              Order Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-end mt-4">
                  <h4>Total: ${total}</h4>
                  <button
                    className="btn btn-success mt-2 rounded-1 mb-5"
                    onClick={() => navigate('/checkout/allcart', { state: { cartItems: JSON.stringify(cart) } })}
                  >Proceed to Order</button>
                </div>
              </div>
            )
            :
            (
              <h3 className="text-center mt-5 mb-4">Your cart is empty.</h3>
            )
      }

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
            Confirm Remove Item
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productToRemove && (
            <>
              <p>Are you sure you want to remove this item from your cart?</p>
              <div className="alert alert-info">
                <div className="d-flex align-items-center mb-2">
                  <img
                    src={productToRemove.image}
                    alt={productToRemove.title}
                    style={{ width: "50px", height: "50px", objectFit: "contain" }}
                    className="me-3 border rounded"
                  />
                  <h5 className="mb-0">{productToRemove.title}</h5>
                </div>
                <p className="mb-1"><strong>Price:</strong> ${productToRemove.price}</p>
                <p className="mb-1"><strong>Quantity:</strong> {productToRemove.quantity}</p>
                <p className="mb-0"><strong>Subtotal:</strong> <span className="text-success fw-bold">${productToRemove.subtotal}</span></p>
              </div>
              <p className="text-danger mb-0">This action cannot be undone.</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : 'Confirm Remove'}
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
          <div className="d-flex flex-column align-items-center justify-content-center py-3">
            <div className="mb-3">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
            </div>
            <h5 className="text-center">{successMessage}</h5>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Cart;