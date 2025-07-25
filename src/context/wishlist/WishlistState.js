import { useState } from "react";
import wishlistContext from "./wishlistContext";

const WishlistState = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);

    const fetchWishlist = async () => {
        try {
            const res = await fetch('/api/wishlist', {
                headers: { 'auth-token': localStorage.getItem('token') }
            });
            const data = await res.json();
            setWishlist(data.items || []);
        } catch (err) {
            console.error("Error fetching wishlist:", err);
            setWishlist([]);
        }
    };

    const addToWishlist = async (productId) => {
        try {
            const res = await fetch('/api/wishlist/add', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token'),
                },
                body: JSON.stringify({ productId }),
            });
            const data = await res.json();
            setWishlist(data.items || []);
        } catch (err) {
            console.error("Add to wishlist failed", err);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const res = await fetch(`/api/wishlist/remove/${productId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token'),
                },
            });
            const data = await res.json();
            setWishlist(data.items || []);
        } catch (err) {
            console.error("Remove from wishlist failed", err);
        }
    };

    return (
        <wishlistContext.Provider value={{
            wishlist,
            fetchWishlist,
            addToWishlist,
            removeFromWishlist
        }}>
            {children}
        </wishlistContext.Provider>
    );
};

export default WishlistState;