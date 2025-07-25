import React from 'react'
import { useNavigate } from 'react-router-dom';

const OrderConfirmed = () => {
    const navigate = useNavigate();

    return (
        <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
            <div className="card p-5 shadow-lg rounded-4 border-0" style={{ maxWidth: "600px", width: "100%" }}>
                <div className="text-center">
                    <div className="mb-4">
                        <span className="display-1 text-success">
                            <i className="bi bi-check-circle-fill"></i>
                        </span>
                    </div>
                    <h2 className="mb-3 text-success fw-bold">Thank you for your order!</h2>
                    <p className="lead mb-4 text-secondary">Your order has been placed successfully. We appreciate your business!</p>
                    <div className="d-grid gap-3">
                        <button
                            className="btn btn-primary btn-lg rounded-pill fw-semibold shadow-sm"
                            onClick={() => navigate("/")}
                        >
                            Go to Home
                        </button>
                        <button
                            className="btn btn-outline-secondary btn-lg rounded-pill fw-semibold shadow-sm"
                            onClick={() => navigate("/myorders")}
                        >
                            View My Orders
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmed;