import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductList from './ProductList';
import Spinner from './Spinner';
import productContext from '../context/product/productContext';
import cartContext from '../context/cart/cartContext';
import orderContext from '../context/order/orderContext';
import userContext from '../context/user/userContext';
import wishlistContext from '../context/wishlist/wishlistContext';
import SortBar from './SortBar.js.js';

const Home = (props) => {
    const { allProducts, fetchProducts } = useContext(productContext);
    const { fetchCart } = useContext(cartContext);
    const { fetchOrders } = useContext(orderContext);
    const { fetchProfile } = useContext(userContext);
    const { fetchWishlist } = useContext(wishlistContext);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const query = params.get('query');
    const sort = params.get('sort'); // <-- Add this line
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchProducts(query, 1, 20, category, sort),
                    fetchCart(),
                    fetchOrders(),
                    fetchProfile(),
                    fetchWishlist()
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [category, query, sort]);

    return (
        <div className="min-vh-100" style={{ minHeight: "100vh" }}>
            <SortBar />
            <div className="row" style={{ minHeight: "100vh" }}>
                <div className="col-12 mb-5">
                    <div className="container p-0">
                        {loading ? <Spinner /> : <ProductList products={allProducts} showAlert={props.showAlert} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;