import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaShoppingCart } from 'react-icons/fa';
import { useContext, useEffect, useState } from 'react';
import cartContext from '../context/cart/cartContext';
import orderContext from '../context/order/orderContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { cart = [], fetchCart, setCart, clearCart } = useContext(cartContext);
    const { clearOrders } = useContext(orderContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState("");
    const categories = [
        "All",
        "electronics",
        "women's clothing",
        "men's clothing",
        "jewelery"
    ];

    useEffect(() => {
        fetchCart();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/?query=${encodeURIComponent(searchQuery.trim())}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setCart([]);
        clearCart();
        clearOrders();
        navigate('/');
    }

    const isLoggedIn = !!localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3 py-4 w-100">
            <div className="container-fluid">
                <Link className="navbar-brand text-white fw-bold fs-3" to="/" onClick={() => setSearchQuery("")}>E-Shop</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <form className="d-flex ms-lg-5 my-2 my-lg-0 flex-grow-1 align-items-center" onSubmit={handleSearch} role="search" style={{ maxWidth: 500 }}>
                        <input
                            type="text"
                            className="form-control border-0 rounded-3"
                            placeholder="Search for products, brands and more"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            aria-label="Search"
                        />
                        <button className="btn btn-warning ms-3 px-3 fw-semibold rounded-3" aria-label="Search products" type="submit">Search</button>
                    </form>
                    <ul className="navbar-nav ms-auto align-items-center gap-2">
                        <li className="nav-item dropdown mt-1">
                            <button
                                className="btn btn-link nav-link dropdown-toggle text-white d-flex align-items-center fw-medium p-0 ms-2"
                                id="categoryDropdown"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                type="button"
                            >
                                Category
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow rounded-2 border-0 mt-2" aria-labelledby="categoryDropdown">
                                {categories.map(cat => (
                                    <li key={cat}>
                                        <button
                                            className={`dropdown-item py-2${category === cat ? " active" : ""}`}
                                            onClick={() => {
                                                setCategory(cat);
                                                if (cat === "All") {
                                                    navigate("/");
                                                } else {
                                                    navigate(`/?category=${encodeURIComponent(cat)}`);
                                                }
                                            }}
                                        >
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white fw-medium mt-1 ms-2" to="/mywishlist">My Wishlist</Link>
                        </li>
                        <li className="nav-item position-relative">
                            <Link className="nav-link text-white d-flex align-items-center mt-1 fw-medium ms-2" to="/cart">
                                <FaShoppingCart className="fs-4" />
                                <span>Cart</span>
                                {cart.length > 0 && (
                                    <span className="position-absolute top-0 start-100 rounded-5 translate-middle badge bg-warning text-primary fw-bold" style={{ fontSize: "0.8rem" }}>
                                        {cart.length}
                                    </span>
                                )}
                            </Link>
                        </li>
                        {!isLoggedIn ? (
                            <li className="nav-item">
                                <Link className="nav-link p-0 mt-1 fw-medium ms-3" to="/login">
                                    <button className="btn bg-white text-primary fw-bold px-3 py-1">Login</button>
                                </Link>
                            </li>
                        ) : (
                            <li className="nav-item dropdown mt-1">
                                <button
                                    className="btn btn-link nav-link dropdown-toggle text-white d-flex align-items-center fw-medium fs-3 p-0 ms-3"
                                    id="profileDropdown"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    type="button"
                                >
                                    <FaUserCircle />
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow rounded-2 border-0 mt-2" aria-labelledby="profileDropdown">
                                    <li><Link className="dropdown-item py-2" to="/myprofile">My Profile</Link></li>
                                    {userRole === 'admin' && <li><Link className="dropdown-item py-2" to="/admin/users">User Management</Link></li>}
                                    {userRole === 'retailer' && <li><Link className="dropdown-item py-2" to="/myproducts">My Products</Link></li>}
                                    {userRole === 'retailer' && <li><Link className="dropdown-item py-2" to="/retailer/orders">Order Management</Link></li>}
                                    <li><Link className="dropdown-item py-2" to="/myorders">My Orders</Link></li>
                                    <li><button className="dropdown-item text-danger py-2" onClick={handleLogout}>Logout</button></li>
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;