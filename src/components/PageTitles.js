import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PageTitle() {
    const location = useLocation();
  
    useEffect(() => {
      const pageTitles = {
        '/': 'Home | E-Shop',
        '/cart': 'Your Cart | E-Shop',
        '/login': 'Login | E-Shop',
        '/register': 'Register | E-Shop',
        '/myprofile': 'My Profile | E-Shop',
        '/myorders': 'My Orders | E-Shop',
        '/mywishlist': 'My Wishlist | E-Shop',
        '/myproducts': 'My Products | E-Shop',
        '/admin/users': 'User Management | E-Shop',
        '/retailer/orders': 'Order Management | E-Shop',
        '/orderconfirmed': 'Order Confirmed | E-Shop'
      };
  
      if (location.pathname.startsWith('/product/')) {
        document.title = 'Product Details | E-Shop';
      } else if (location.pathname.startsWith('/checkout/')) {
        document.title = 'Checkout | E-Shop';
      } else if (location.pathname.startsWith('/order/')) {
        document.title = 'Order Details | E-Shop';
      } else {
        document.title = pageTitles[location.pathname] || 'E-Shop - React E-Commerce';
      }
    }, [location]);

    return null; 
  }