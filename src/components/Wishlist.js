import { useContext, useEffect, useState } from "react";
import wishlistContext from "../context/wishlist/wishlistContext";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import productContext from "../context/product/productContext";
import "../Style/Wishlist.css";
import alertContext from "../context/alert/alertContext";

const Wishlist = () => {
    const { wishlist, fetchWishlist, removeFromWishlist } = useContext(wishlistContext);
    const { allProducts, fetchProducts } = useContext(productContext);
    const { showAlert } = useContext(alertContext);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadWishlist = async () => {
            setLoading(true);
            await fetchWishlist();
            setLoading(false);
        };
        loadWishlist();
        if (!allProducts.length) fetchProducts();
    }, []);

    const wishlistItems = wishlist.map(item => {
        const product = allProducts.find(p => p._id === (item.productId || item.product));
        return { ...item, product };
    });

    return (
        <div className="container" style={{ marginTop: "50px" }}>
            <div className="bg-white rounded-4 shadow-sm p-4 border border-light-subtle">
                <h2 className="mb-4 fw-bold"> My Wishlist{wishlistItems.length > 0 ? ` (${wishlistItems.length})` : ""} </h2>
                {loading ? (
                    <div className="text-center py-5"><Spinner /></div>
                ) : wishlistItems.length === 0 ? (
                    <div className="text-center">
                        <h3 className="mb-4">Your wishlist is empty</h3>
                    </div>
                ) : (
                    <div>
                        {wishlistItems.map((item, idx) => (
                            <div
                                key={item.product?._id || item.productId}
                                className="wishlist-row row align-items-center py-3 px-2 g-2 mt-4"
                                style={{
                                    borderBottom: idx !== wishlistItems.length - 1 ? "2px solid #eee" : "none",
                                    background: "#fff"
                                }}
                            >
                                <div className="col-12 col-sm-auto text-center">
                                    <img
                                        src={item.product?.image}
                                        alt={item.product?.title}
                                        className="rounded-3 shadow-sm"
                                        style={{
                                            width: "180px",
                                            height: "180px",
                                            objectFit: "contain",
                                            border: "none",
                                            background: "#fff"
                                          }}                                        
                                    />
                                </div>

                                <div className="col flex-grow-1 ms-3">
                                    <div className="fw-semibold" style={{ fontSize: "1.1rem", color: "#222" }}>
                                        {item.product?.title}
                                    </div>
                                    <div className="mt-2 d-flex flex-wrap align-items-center gap-3">
                                        <span className="fw-bold" style={{ color: "#388e3c", fontSize: "1.2rem" }}>
                                            ${item.product?.price}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-auto d-flex gap-2 justify-content-end">
                                    <button
                                        className="btn btn-link text-danger fs-4"
                                        style={{ textDecoration: "none" }}
                                        title="Remove"
                                        onClick={() => {
                                            removeFromWishlist(item.product?._id || item.productId);
                                            showAlert?.("Item removed from wishlist", "danger");
                                        }}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                    <button
                                        className="btn btn-link text-primary fs-4"
                                        style={{ textDecoration: "none" }}
                                        title="View"
                                        onClick={() => navigate(`/product/${item.product?._id || item.productId}`)}
                                    >
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;