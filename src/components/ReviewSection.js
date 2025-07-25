import React, { useContext, useEffect, useState } from "react";
import reviewContext from "../context/review/reviewContext";
import { FaStar, FaRegStar } from "react-icons/fa";
import { jwtDecode } from 'jwt-decode'; // Corrected import statement

const ReviewSection = ({ productId, showAlert }) => {
  const { reviews, fetchReviews, addReview, editReview, deleteReview, loading } = useContext(reviewContext);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [deleteId, setDeleteId] = useState(null);
  
  useEffect(() => {
    if (productId) fetchReviews(productId);
    // eslint-disable-next-line
  }, [productId]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (hasReviewed) {
      showAlert("You have already reviewed this product.", "info");
      return;
    }
    const res = await addReview(productId, rating, comment);
    if (res.success) {
      showAlert("Review added!", "success");
      setComment("");
      setRating(5);
      fetchReviews(productId);
    } else {
      showAlert(res.message || "Failed to add review", "danger");
    }
  };

  const handleEditReview = async (e) => {
    e.preventDefault();
    const res = await editReview(editingId, editRating, editComment);
    if (res.success) {
      showAlert("Review updated!", "success");
      setEditingId(null);
    } else {
      showAlert(res.message || "Failed to update review", "danger");
    }
  };

  const handleDeleteReview = async () => {
    if (deleteId) {
      const res = await deleteReview(deleteId);
      if (res.success) {
        showAlert("Review deleted!", "success");
        setDeleteId(null);
      } else {
        showAlert(res.message || "Failed to delete review", "danger");
      }
    }
  };

  const token = localStorage.getItem("token");
  const currentUserId = token ? jwtDecode(token).user?.id : null;

  const hasReviewed = reviews.some(
    (r) => r.user && (r.user._id === currentUserId)
  );

  const renderStars = (value) => {
    return (
      <>
        {[...Array(5)].map((_, i) =>
          i < value ? (
            <FaStar key={i} className="text-warning" />
          ) : (
            <FaRegStar key={i} className="text-warning" />
          )
        )}
      </>
    );
  };

  return (
    <div className="mt-5">
      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <h3 className="mb-4 fw-bold">Customer Reviews</h3>
      <div className="card mb-4 shadow-lg rounded-4 border-0">
        <div className="card-body p-4">
          {hasReviewed ? (
            <div className="alert alert-info rounded-3 shadow-sm mb-0">
              You have already reviewed this product.
            </div>
          ) : (
            <form onSubmit={handleAddReview}>
              <div className="mb-3 d-flex align-items-center">
                <label className="me-2 mb-0 fw-semibold">Rating:</label>
                <div className="d-flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <span
                      key={r}
                      style={{ cursor: "pointer", fontSize: "1.5rem" }}
                      onClick={() => setRating(r)}
                    >
                      {r <= rating ? <FaStar className="text-warning" /> : <FaRegStar className="text-warning" />}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <textarea
                  className="form-control rounded-3 shadow-sm"
                  placeholder="Write your review..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  maxLength={500}
                  required
                  rows={4}
                />
                <small className="text-muted">{comment.length}/500 characters</small>
              </div>
              <button className="btn btn-primary rounded-pill px-4 shadow-sm" type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Review'}
              </button>
            </form>
          )}
        </div>
      </div>
      <div>
        {reviews.length === 0 && <div className="alert alert-info rounded-3 shadow-sm">No reviews yet.</div>}
        {reviews.map(r => (
          <div key={r._id} className="card mb-3 shadow-sm rounded-4 border-light">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <strong className="fs-5">{r.user?.name || "User"}</strong>
                  <span className="ms-3">{renderStars(r.rating)}</span>
                </div>
                <span className="text-muted small">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
              <div className="border-top pt-3 d-flex justify-content-between align-items-center">
                <div className="mb-2 fs-6">{r.comment}</div>
                {r.user?._id === currentUserId && (
                  <div className="dropdown">
                    <button 
                      className="btn btn-link text-secondary p-0" 
                      type="button" 
                      id={`dropdownMenuButton-${r._id}`} 
                      data-bs-toggle="dropdown" 
                      aria-expanded="false"
                    >
                      <i className="bi bi-three-dots-vertical fs-5"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow rounded-3" aria-labelledby={`dropdownMenuButton-${r._id}`}>
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => {
                            setEditingId(r._id);
                            setEditComment(r.comment);
                            setEditRating(r.rating);
                          }}
                        >
                          <i className="bi bi-pencil me-2"></i>Edit
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item text-danger" 
                          onClick={() => setDeleteId(r._id)}
                          data-bs-toggle="modal" 
                          data-bs-target="#deleteModal"
                        >
                          <i className="bi bi-trash me-2"></i>Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              {editingId === r._id && (
                <form onSubmit={handleEditReview} className="bg-light p-4 rounded-4 mt-3 shadow-sm">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Rating:</label>
                    <div className="d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <span
                          key={val}
                          className={`fs-4 ${val <= editRating ? 'text-warning' : 'text-secondary'}`}
                          style={{ cursor: "pointer" }}
                          onClick={() => setEditRating(val)}
                        >
                          {val <= editRating ? <FaStar /> : <FaRegStar />}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <textarea
                      className="form-control shadow-sm border-0"
                      value={editComment}
                      onChange={e => setEditComment(e.target.value)}
                      required
                      rows={3}
                      placeholder="Edit your review..."
                      style={{ minHeight: "100px" }}
                    />
                    <small className="text-muted d-block mt-1">{editComment.length}/500 characters</small>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-success flex-grow-1 fw-medium rounded-pill" 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </button>
                    <button 
                      className="btn btn-outline-secondary fw-medium rounded-pill" 
                      type="button" 
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <div className="modal fade" id="deleteModal" tabIndex="-1" aria-labelledby="deleteModalLabel">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteModalLabel">Confirm Delete</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this review?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteReview} data-bs-dismiss="modal">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;