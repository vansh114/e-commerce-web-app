import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Alert from './components/Alert';
import Home from './components/Home';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Wishlist from './components/Wishlist';
import Login from './components/Login';
import Register from './components/Register';
import MyProfile from './components/MyProfile';
import MyOrders from './components/MyOrders';
import PlaceOrder from './components/PlaceOrder';
import OrderConfirmed from "./components/OrderConfirmed";
import MyProducts from './components/MyProducts';
import UserManagement from './components/UserManagement';
import OrderManagement from './components/OrderManagement';
import CartState from './context/cart/CartState';
import ProductState from './context/product/ProductState';
import UserState from './context/user/UserState';
import OrderState from './context/order/OrderState';
import WishlistState from './context/wishlist/WishlistState';
import ReviewState from './context/review/ReviewState';
import AlertState from './context/alert/AlertState';
import OrderDetail from './components/OrderDetail';
import AuthState from './context/auth/AuthState';
import PageTitle from './components/PageTitles';

function App() {
  return (
    <div className="overflow-hidden">
      <AlertState>
        <AuthState>
          <UserState>
            <ProductState>
              <CartState>
                <WishlistState>
                  <OrderState>
                    <ReviewState>
                      <Router>
                        <PageTitle />
                        <Navbar />
                        <Alert />
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/product/:id" element={<ProductDetail />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/myprofile" element={<MyProfile />} />
                          <Route path="/myorders" element={<MyOrders />} />
                          <Route path='/checkout/:id' element={<PlaceOrder />} />
                          <Route path='/orderconfirmed' element={<OrderConfirmed />} />
                          <Route path="/mywishlist" element={<Wishlist />} />
                          <Route path="/myproducts" element={<MyProducts />} />
                          <Route path="/admin/users" element={<UserManagement />} />
                          <Route path="/retailer/orders" element={<OrderManagement />} />
                          <Route path="/order/:id" element={<OrderDetail />} />
                        </Routes>
                      </Router>
                    </ReviewState>
                  </OrderState>
                </WishlistState>
              </CartState>
            </ProductState>
          </UserState>
        </AuthState>
      </AlertState>
    </div>
  );
}

export default App;