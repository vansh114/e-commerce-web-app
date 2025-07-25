import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import alertContext from "../context/alert/alertContext";

const Register = () => {
    const { showAlert } = useContext(alertContext);
    const [userData, setUserData] = useState({ name: "", email: "", password: "", cPassword: "", role: "user" });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("User Registering!");
        if (userData.password !== userData.cPassword) {
            showAlert("Passwords do not match!", "danger");
            return;
        }
        const res = await fetch("http://localhost:4000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                role: userData.role
            }),
        });

        const json = await res.json();
        if (json.success) {
            localStorage.setItem('token', json.authToken);
            showAlert("Registration successful. Please log in.", "success");
            console.log("Registration Complete!");
            navigate("/login");
        } else {
            showAlert("Registration failed. Try again.", "danger");
        }
    };

    const onChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center align-items-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg rounded-4 border-0 p-4">
                        <div className="card-body">
                            <h2 className="text-center mb-4 fw-bold">Register Account</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label fw-semibold">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-pill shadow-sm py-2 px-4"
                                        id="name"
                                        name="name"
                                        minLength={3}
                                        required
                                        onChange={onChange}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
                                    <input
                                        type="email"
                                        onChange={onChange}
                                        className="form-control rounded-pill shadow-sm py-2 px-4"
                                        id="email"
                                        name="email"
                                        value={userData.email}
                                        placeholder="Enter your email address"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label fw-semibold">Password</label>
                                    <input
                                        type="password"
                                        onChange={onChange}
                                        className="form-control rounded-pill shadow-sm py-2 px-4"
                                        id="password"
                                        name="password"
                                        value={userData.password}
                                        minLength={6}
                                        placeholder="Create a password (min 6 characters)"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="cPassword" className="form-label fw-semibold">Confirm Password</label>
                                    <input
                                        type="password"
                                        onChange={onChange}
                                        className="form-control rounded-pill shadow-sm py-2 px-4"
                                        id="cPassword"
                                        name="cPassword"
                                        value={userData.cPassword}
                                        minLength={6}
                                        placeholder="Confirm your password"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="role" className="form-label fw-semibold">Account Type</label>
                                    <select
                                        className="form-select rounded-pill shadow-sm py-2 px-4"
                                        id="role"
                                        name="role"
                                        value={userData.role}
                                        onChange={onChange}
                                    >
                                        <option value="user">User</option>
                                        <option value="retailer">Retailer</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 rounded-pill fw-bold shadow-sm py-2"
                                >
                                    Create Account
                                </button>
                            </form>
                            <div className="text-center mt-4 pt-3 border-top">
                                <span className="text-muted">Already have an account? </span>
                                <button
                                    onClick={() => navigate("/login")}
                                    className="btn btn-outline-primary btn-sm ms-2 rounded-pill px-3 shadow-sm"
                                >
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;