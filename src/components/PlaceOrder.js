import { useContext, useEffect, useState } from "react";
import orderContext from "../context/order/orderContext";
import '../Style/PlaceOrder.css';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import cartContext from "../context/cart/cartContext";
import Spinner from "./Spinner";

const PlaceOrder = () => {
    const { id } = useParams();
    const location = useLocation();
    const { cartItems, product: stateProduct } = location.state || {};
    const { placeOrder } = useContext(orderContext);
    const { cart, fetchCart, clearCart, removeFromCart } = useContext(cartContext);
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState({
        orderItems: [],
        shippingAddress: {
            fullName: "",
            address: "",
            city: "",
            pinCode: "",
            country: ""
        },
        paymentMethod: "Cash on Delivery"
    });
    const [message, setMessage] = useState({
        type: '',
        title: '',
        text: ''
    });
    const [cproducts, setCproducts] = useState([]);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchCart().then(() => {
            if (stateProduct) {
                setOrderData(prev => ({
                    ...prev,
                    orderItems: [{
                        product: stateProduct._id,
                        name: stateProduct.title,
                        image: stateProduct.image,
                        price: stateProduct.price,
                        quantity: 1
                    }]
                }));
            }
            else if (id === 'allcart') {
                let items = [];
                try {
                    if (cartItems) {
                        items = JSON.parse(cartItems);
                    }
                } catch (e) {
                    items = [];
                }
                setOrderData(prev => ({
                    ...prev,
                    orderItems: items.map(item => ({
                        product: item.productId,
                        name: item.product.title,
                        image: item.product.image,
                        price: item.product.price,
                        quantity: item.quantity
                    }))
                }));
            }
            else if (id) {
                const cartItem = cart.find(item => item.productId === id);
                if (cartItem) {
                    setOrderData(prev => ({
                        ...prev,
                        orderItems: [{
                            product: cartItem.productId,
                            name: cartItem.product.title,
                            image: cartItem.product.image,
                            price: cartItem.product.price,
                            quantity: cartItem.quantity
                        }]
                    }));
                }
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [id, stateProduct, cartItems]);

    useEffect(() => {
        try {
            if (cartItems) {
                setCproducts(JSON.parse(cartItems));
            }
        } catch (error) {
            console.error("Error parsing cart items:", error);
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    const isFormValid = () => {
        const addr = orderData.shippingAddress;
        return (
            addr.fullName.trim() &&
            addr.address.trim() &&
            addr.city.trim() &&
            addr.pinCode.trim() &&
            addr.country.trim() &&
            orderData.paymentMethod.trim() &&
            orderData.orderItems.length > 0
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrderData({
            ...orderData,
            shippingAddress: {
                ...orderData.shippingAddress,
                [name]: value
            }
        });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (placingOrder) return;
        setPlacingOrder(true);
        try {
            const result = await placeOrder(orderData);
            if (result.success) {
                setMessage({
                    type: 'success',
                    title: 'Order Successful',
                    text: result.message
                });

                if (id === 'allcart') {
                    clearCart();
                }
                else if (id) {
                    removeFromCart(id);
                }

                setTimeout(() => {
                    navigate('/orderconfirmed');
                }, 1500);
            }
            else {
                setMessage({
                    type: 'error',
                    title: 'Order Failed',
                    text: result.message
                });
                setPlacingOrder(false);
            }
        }
        catch (error) {
            setMessage({
                type: 'error',
                title: 'Error',
                text: 'An unexpected error occurred'
            });
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="container shadow-lg rounded-4 border-0 p-4">
                        <h2 className="mb-4 text-center fw-bold">Place a New Order</h2>
                        <form onSubmit={handlePlaceOrder}>
                            <h5 className="mb-3 fw-semibold">Shipping Address</h5>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <input type="text" name="fullName" className="form-control rounded-pill shadow-sm" placeholder="Full Name" value={orderData.shippingAddress.fullName} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <input type="text" name="address" className="form-control rounded-pill shadow-sm" placeholder="Address" value={orderData.shippingAddress.address} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <input type="text" name="city" className="form-control rounded-pill shadow-sm" placeholder="City" value={orderData.shippingAddress.city} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <input type="text" name="pinCode" className="form-control rounded-pill shadow-sm" placeholder="Pin Code" value={orderData.shippingAddress.pinCode} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <input type="text" name="country" className="form-control rounded-pill shadow-sm" placeholder="Country" value={orderData.shippingAddress.country} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <h5 className="mb-3 fw-semibold">Payment Method</h5>
                            <div className="mb-4">
                                <select name="paymentMethod" className="form-select rounded-pill shadow-sm" value={orderData.paymentMethod} onChange={e => setOrderData({ ...orderData, paymentMethod: e.target.value })}>
                                    <option value="Cash on Delivery">Cash on Delivery</option>
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Net Banking">Net Banking</option>
                                </select>
                            </div>
                            
                            {/* ADDED: Payment Details Section for non-COD methods */}
                            {orderData.paymentMethod !== 'Cash on Delivery' && (
                                <div className="mb-4 p-3 border rounded-3 bg-light">
                                    <h6 className="mb-3 fw-semibold">Payment Details</h6>
                                    {/* ADDED: Credit Card fields */}
                                    {orderData.paymentMethod === 'Credit Card' && (
                                        <div className="row">
                                            <div className="col-md-12 mb-3">
                                                <input type="text" className="form-control rounded-pill shadow-sm" placeholder="Card Number" required minLength={16} maxLength={16} pattern="[0-9]{16}" />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <input type="text" className="form-control rounded-pill shadow-sm" placeholder="Expiry Date (MM/YY)" required pattern="(0[1-9]|1[0-2])\/([0-9]{2})" />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <input type="text" className="form-control rounded-pill shadow-sm" placeholder="CVV" required minLength={3} maxLength={4} pattern="[0-9]{3,4}" />
                                            </div>
                                        </div>
                                    )}
                                    {orderData.paymentMethod === 'UPI' && (
                                        <div className="row">
                                            <div className="col-md-12 mb-3">
                                                <input type="text" className="form-control rounded-pill shadow-sm" placeholder="UPI ID" required minLength={5} pattern="[\w.-]+@[\w.-]+" />
                                            </div>
                                        </div>
                                    )}
                                    {orderData.paymentMethod === 'Net Banking' && (
                                        <div className="row">
                                            <div className="col-md-12 mb-3">
                                                <select className="form-select rounded-pill shadow-sm" required>
                                                    <option value="">Select Bank</option>
                                                    <option value="SBI">State Bank of India</option>
                                                    <option value="HDFC">HDFC Bank</option>
                                                    <option value="ICICI">ICICI Bank</option>
                                                    <option value="Axis">Axis Bank</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="d-grid gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-success btn-lg rounded-pill fw-bold shadow-sm"
                                    disabled={!isFormValid() || placingOrder}
                                >
                                    {placingOrder ? "Placing Order..." : "Place Order"}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-lg rounded-pill fw-semibold shadow-sm"
                                    onClick={() => navigate('/cart')}
                                    disabled={placingOrder}
                                >
                                    Back to Cart
                                </button>
                            </div>
                        </form>
                        <div className="mt-5 border-top pt-4">
                            <h5 className="mb-3 text-secondary fw-semibold">Order Summary</h5>
                            {loading ?
                                (
                                    <Spinner />
                                )
                                :
                                (
                                    orderData.orderItems.length > 0 ? (
                                        <>
                                            <ul className="list-group mb-3">
                                                {orderData.orderItems.map((item, index) => (
                                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center rounded-3 shadow-sm mb-2">
                                                        <div className="d-flex align-items-center">
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="bg-light rounded-3 shadow-sm"
                                                                style={{ width: '50px', height: '50px', objectFit: 'contain', marginRight: '10px' }}
                                                            />
                                                            <span className="fw-semibold">{item.name}</span>
                                                        </div>
                                                        <span className="text-muted">
                                                            ₹{item.price} × {item.quantity}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="d-flex justify-content-between align-items-center fw-bold fs-5 px-2">
                                                <span>Total:</span>
                                                <span className="text-success">
                                                    ₹{orderData.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0)}
                                                </span>
                                            </div>
                                        </>
                                    )
                                        :
                                        (
                                            <p className="text-muted">No items in order</p>
                                        )
                                )
                            }
                        </div>

                        {message && message.text && (
                            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-info'} mt-4 rounded-3 shadow-sm text-center`}>
                                {message.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrder;