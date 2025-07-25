import { useState } from "react";
import orderContext from "./orderContext";

const OrderState = (props) => {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/order/my-orders/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data.orders);
        }
        catch (error) {
            console.error('Error fetching orders:', error.message);
        }
    };

    const removeOrder = (orderId) => {
        setOrders(prev => prev.filter(order => order._id !== orderId));
    };

    const placeOrder = async (orderData) => {
        try {
            const res = await fetch('/api/order/place', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();

            if (res.ok) {
                await fetchOrders();
                return {
                    success: true,
                    message: data.message || "Order placed successfully",
                    order: data.order
                };
            } else {
                return {
                    success: false,
                    message: data.error || "Failed to place order",
                    errors: data.errors
                };
            }
        } 
        catch (error) {
            console.error("Error placing order:", error);
            return {
                success: false,
                message: "An error occurred while placing the order"
            };
        }
    };

    const clearOrders = () => {
        setOrders([]);
    };

    return (
        <orderContext.Provider value={{ orders, fetchOrders, placeOrder, removeOrder, clearOrders }}>
            {props.children}
        </orderContext.Provider>
    );
};

export default OrderState;