import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import authContext from "../context/auth/authContext";

const Login = () => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [showRestoreOption, setShowRestoreOption] = useState(false);
    const { login, restoreAccount, loading } = useContext(authContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(credentials.email, credentials.password);
        
        if (result.success) {
            navigate("/");
        } else if (result.deactivated) {
            setShowRestoreOption(true);
        }
    };

    const handleRestore = async (e) => {
        e.preventDefault();
        const success = await restoreAccount(credentials.email, credentials.password);
        
        if (success) {
            navigate("/");
        }
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const redirectToRegister = () => {
        navigate("/register");
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center align-items-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-md rounded-4 border-0 p-4">
                        <div className="card-body">
                            <h2 className="text-center mb-4 fw-bold">Login to E-Shop</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label fw-semibold">Email address</label>
                                    <input
                                        type="email"
                                        onChange={onChange}
                                        className="form-control rounded-pill shadow-sm"
                                        id="email"
                                        name="email"
                                        value={credentials.email}
                                        aria-describedby="emailHelp"
                                        placeholder="Enter your email"
                                    />
                                    <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label fw-semibold">Password</label>
                                    <input
                                        type="password"
                                        onChange={onChange}
                                        className="form-control rounded-pill shadow-sm"
                                        id="password"
                                        name="password"
                                        value={credentials.password}
                                        placeholder="Enter your password"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold shadow-sm py-2" disabled={loading}>
                                    {loading ? "Logging in..." : "Login"}
                                </button>
                            </form>
                            
                            {/* Account Restoration Section */}
                            {showRestoreOption && (
                                <div className="mt-4 pt-3 border-top">
                                    <div className="alert alert-warning">
                                        <h5 className="alert-heading">Account Deactivated</h5>
                                        <p>Your account has been deactivated. Would you like to restore it?</p>
                                        <button 
                                            onClick={handleRestore} 
                                            className="btn btn-warning w-100 rounded-pill fw-bold shadow-sm py-2"
                                            disabled={loading}
                                        >
                                            {loading ? "Restoring..." : "Restore My Account"}
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="text-center mt-4 pt-3 border-top">
                                <span className="text-muted">Don't have an account?</span>
                                <button onClick={redirectToRegister} className="btn btn-outline-primary btn-sm ms-2 rounded-pill px-3 shadow-sm">
                                    Sign up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;