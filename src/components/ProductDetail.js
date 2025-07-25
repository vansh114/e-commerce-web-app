import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import cartContext from '../context/cart/cartContext';
import '../Style/ProductDetail.css';
import Spinner from './Spinner';
import productContext from '../context/product/productContext';
import wishlistContext from '../context/wishlist/wishlistContext';
import ReviewSection from "./ReviewSection";
import alertContext from '../context/alert/alertContext';

const ProductDetail = () => {
    const { id } = useParams();
    const { product, fetchProduct, loading } = useContext(productContext);
    const { addToCart, cart = [], fetchCart } = useContext(cartContext);
    const { wishlist, fetchWishlist, addToWishlist, removeFromWishlist } = useContext(wishlistContext);
    const { showAlert } = useContext(alertContext);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const navigate = useNavigate();

    const isWishlisted = wishlist.some(item => (item.productId || item.product) === id);

    useEffect(() => {
        fetchProduct(id);
        if (localStorage.getItem('token')) {
            fetchWishlist();
        }
    }, [id]);

    const toggleWishlist = async () => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        setWishlistLoading(true);
        try {
            if (isWishlisted) {
                await removeFromWishlist(id);
                showAlert("Removed from wishlist", "info");
            } else {
                await addToWishlist(id);
                showAlert("Added to wishlist", "info");
            }
        }
        catch (err) {
            showAlert("Wishlist action failed", "danger");
        }
        finally {
            setWishlistLoading(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) stars.push(<FaStar key={i} className="text-warning" />);
            else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
            else stars.push(<FaRegStar key={i} className="text-warning" />);
        }
        return stars;
    };

    const rating = product.averageRating || 0;
    const reviewCount = product.numReviews || 0;

    const handleAddToCart = async () => {
        if (!localStorage.getItem('token')) return navigate('/login');
        if (loading) return; // Prevent double clicks
        try {
            fetchCart();
            await addToCart(cart, product._id, 1);
            showAlert("Product added to cart!", "success");
        }
        catch (err) {
            console.error(err);
            showAlert("Failed to add to cart.", "danger");
        }
    };

    const handleOrderNow = () => {
        if (localStorage.getItem('token')) {
            navigate(`/checkout/${product.id}`, { state: { product } });
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="container my-5 bg-custom">
            {
                loading ?
                    (
                        <h2 className="text-center mt-5" > <Spinner /></h2>
                    )
                    :
                    (
                        product ?
                            (
                                <div className="row justify-content-center">
                                    <div className="col-lg-10">
                                        <div className="card shadow-lg rounded-4 border-0 p-4 bg-white">
                                            <div className="row align-items-start">
                                                
                                                <div className="col-md-6 text-center position-relative">
                                                    <div className="bg-light rounded-4 shadow-sm p-3 mb-4 d-inline-block">
                                                        <img
                                                            src={product.image}
                                                            alt={product.title}
                                                            className="img-fluid rounded-3 shadow-lg hover-scale product-image"
                                                            style={{ maxHeight: "350px", objectFit: "contain" }}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={toggleWishlist}
                                                        className="btn position-absolute"
                                                        style={{
                                                            top: "20px",
                                                            right: "30px",
                                                            zIndex: 10,
                                                            backgroundColor: "white",
                                                            borderRadius: "50%",
                                                            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                                            padding: "10px"
                                                        }}
                                                        disabled={wishlistLoading}
                                                    >
                                                        {isWishlisted ? (
                                                            <FaHeart className="text-danger fs-4" />
                                                        ) : (
                                                            <FaRegHeart className="text-dark fs-4" />
                                                        )}
                                                    </button>
                                                    
                                                    <div className="d-flex mt-3 mx-auto mb-3" style={{ width: "100%" }}>
                                                        <div className="w-50 pe-2">
                                                            <button
                                                                className="btn w-100 px-4 py-2 shadow-sm rounded-pill fw-semibold"
                                                                onClick={handleAddToCart}
                                                                style={{ backgroundColor: "#ff9f00", color: "white" }}
                                                            >
                                                                Add to Cart
                                                            </button>
                                                        </div>
                                                        <div className="w-50 ps-2">
                                                            <button
                                                                className="btn w-100 px-4 py-2 shadow-sm rounded-pill fw-semibold"
                                                                onClick={handleOrderNow}
                                                                style={{ backgroundColor: "#388e3c", color: "white" }}
                                                            >
                                                                Order Now
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="col-md-6 text-start">
                                                    <h2 className="mb-3 text-dark fw-bold">{product.title}</h2>
                                                    <p className="mb-2"><strong>Category:</strong> {product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                                                    <h4 className="mb-2 fw-bold">
                                                        <span className="">Price:</span> <span className="text-success" style={{ color: "#388e3c" }}>${product.price}</span>
                                                    </h4>
                                                    <p className="mb-3">
                                                        <strong>Rating:</strong>
                                                        <span className="ms-2">
                                                            {renderStars(rating)}
                                                            <span className="ms-2" style={{ color: "#388e3c", fontWeight: "600" }}>{rating} ★</span>
                                                            <span className="ms-2 text-muted">({reviewCount} reviews)</span>
                                                        </span>
                                                    </p>
                                                    <p className="mb-4"><strong>Description:</strong> {product.description}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <ReviewSection productId={product._id} showAlert={showAlert} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                            :
                            (
                                <h2 className="text-center mt-5">Product Not Found</h2>
                            )
                    )
            }
        </div>
    );
};

export default ProductDetail;