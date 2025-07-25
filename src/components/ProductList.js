import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Spinner from "./Spinner";
import { useContext, useEffect, useState } from "react";
import cartContext from "../context/cart/cartContext";
import "../Style/ProductList.css";

const ProductList = ({ products, loading }) => {
    const { addToCart, cart = [], fetchCart } = useContext(cartContext);
    const navigate = useNavigate();
    
    const [showModal, setShowModal] = useState(false);
    const [modalProduct, setModalProduct] = useState(null);
    const [modalType, setModalType] = useState("success");

    const handleAddToCart = async (product, e) => {
        e.stopPropagation();
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        try {
            await fetchCart();
            await addToCart(cart, product._id, 1);
            setModalProduct(product);
            setModalType("success");
            setShowModal(true);
            setTimeout(() => setShowModal(false), 5000);
        } catch (err) {
            // Show error modal
            setModalProduct(product);
            setModalType("error");
            setShowModal(true);
            setTimeout(() => setShowModal(false), 5000);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const CartModal = () => {
        if (!showModal || !modalProduct) return null;
        
        return (
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header bg-light">
                            <h5 className="modal-title">
                                {modalType === "success" ? "Added to Cart" : "Error"}
                            </h5>
                            <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex align-items-center">
                                <img 
                                    src={modalProduct.image} 
                                    alt={modalProduct.title} 
                                    className="me-3" 
                                    style={{ width: '60px', height: '60px', objectFit: 'contain' }} 
                                />
                                <div>
                                    <h6 className="mb-1">{modalProduct.title}</h6>
                                    <p className="mb-0 text-success fw-bold">${modalProduct.price}</p>
                                </div>
                            </div>
                            <p className="mt-3 mb-0">
                                {modalType === "success" 
                                    ? "Product has been added to your cart." 
                                    : "Failed to add product to cart. Please try again."}
                            </p>
                        </div>
                        <div className="modal-footer">
                            {modalType === "success" && (
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={() => {
                                        setShowModal(false);
                                        navigate('/cart');
                                    }}
                                >
                                    Go to Cart
                                </button>
                            )}
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => setShowModal(false)}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-3 bg-custom min-vh-100">
            <CartModal />
            
            {loading ? (
                <div className="text-center mt-5"><Spinner /></div>
            ) : (
                <div className="d-flex flex-wrap bg-custom gap-4">
                    {products.length === 0 ? (
                        <p className="productlist-empty">No products found.</p>
                    ) : (
                        products.map(product => {
                            const rating = product.averageRating;
                            const count = product.numReviews;
                            return (
                                <div 
                                    key={product._id} 
                                    className="bg-white rounded-3 shadow-sm p-2 cursor-pointer d-flex flex-column align-items-start custom-width custom-position" 
                                    role="button"
                                    style={{ transition: "box-shadow 0.2s" }} 
                                    onClick={() => navigate(`/product/${product._id}`)}
                                >
                                    <img src={product.image} alt={product.title} className="product-card-img" />
                                    <h4 className="product-card-title">
                                        {product.title.length > 40 ? product.title.slice(0, 39) + '...' : product.title}
                                    </h4>
                                    <div className="product-card-rating align-items-center">
                                        <span className="product-card-rating-value ms-1">{rating} ★</span>
                                        <span className="product-card-rating-count ms-1">({count})</span>
                                    </div>
                                    <div className="product-card-price">${product.price}</div>
                                    <button 
                                        onClick={e => handleAddToCart(product, e)} 
                                        className="product-card-btn rounded-2"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

ProductList.propTypes = {
    products: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            price: PropTypes.number.isRequired,
            image: PropTypes.string.isRequired,
            rating: PropTypes.object
        })
    ).isRequired,
    showAlert: PropTypes.func,
    loading: PropTypes.bool
};

export default ProductList;