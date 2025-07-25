import { useState } from "react";
import cartContext from "./cartContext";

const CartState = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);

    const fetchCart = async () => {
        try {
            const res = await fetch('/api/cart', {
                headers: {
                    'auth-token': localStorage.getItem('token')
                }
            });
            const data = await res.json();
            setCart(data.items || []); 
            setTotal(data.total || 0);
        } 
        catch (err) {
            console.error("Error fetching cart:", err);
            setCart([]);
        }
    };
    
    const addToCart = async (cart, productId, quantity = 1) => {
        try {
            const existingItem = cart.find(item => item.productId === productId);

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;

                await fetch(`/api/cart/update/${productId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": localStorage.getItem('token'),
                    },
                    body: JSON.stringify({ quantity: newQuantity }),
                });

                setCart(cart.map(item =>
                    item.productId === productId
                        ? { ...item, quantity: newQuantity }
                        : item
                ));
            }
            else {
                const response = await fetch("/api/cart/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": localStorage.getItem('token'),
                    },
                    body: JSON.stringify({ productId, quantity }),
                });
                const data = await response.json();
                setCart(data.items);
            }
        }
        catch (err) {
            console.error("Add to cart failed", err);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const res = await fetch(`/api/cart/remove/${productId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token'),
                },
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Backend Error:", errorData);
                return;
            }
            const updatedCart = cart.filter(item => item.productId !== productId);
            setCart(updatedCart);
        } catch (err) {
            console.error("Remove from cart failed", err);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            await fetch(`/api/cart/update/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token'),
                },
                body: JSON.stringify({ quantity }),
            });
            setCart(cart.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            ));
        }
        catch (err) {
            console.error("Update quantity failed", err);
        }
    };

    const clearCart = async () => {
        try {
            await fetch("/api/cart/clear", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token'),
                }
            });
            setCart([]);
        } catch (err) {
            console.error("Clear cart failed", err);
        }
    };

    return (
        <cartContext.Provider
            value={{
                cart,
                setCart,
                fetchCart,
                total,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart
            }}
        >
            {children}
        </cartContext.Provider>
    );
};

export default CartState;