import { useState } from "react";
import reviewContext from "./reviewContext";

const ReviewState = (props) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async (productId, page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/review/${productId}?page=${page}&limit=${limit}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (productId, rating, comment) => {
    setLoading(true);
    try {
      const res = await fetch("/api/review/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviews((prev) => [data.review, ...prev]);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || "Failed to add review" };
      }
    } catch (err) {
      console.error("Failed to add review:", err);
      return { success: false, message: "Failed to add review" };
    } finally {
      setLoading(false);
    }
  };

  const editReview = async (reviewId, rating, comment) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/review/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, rating, comment } : r))
        );
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || "Failed to edit review" };
      }
    } catch (err) {
      console.error("Failed to edit review:", err);
      return { success: false, message: "Failed to edit review" };
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/review/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || "Failed to delete review" };
      }
    } catch (err) {
      console.error("Failed to delete review:", err);
      return { success: false, message: "Failed to delete review" };
    } finally {
      setLoading(false);
    }
  };

  return (
    <reviewContext.Provider
      value={{
        reviews,
        loading,
        fetchReviews,
        addReview,
        editReview,
        deleteReview,
      }}
    >
      {props.children}
    </reviewContext.Provider>
  );
};

export default ReviewState;