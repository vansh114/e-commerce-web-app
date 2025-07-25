import { useState, useContext } from "react";
import authContext from "./authContext";
import alertContext from "../alert/alertContext";

const AuthState = (props) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showAlert } = useContext(alertContext);
    
    const loadUser = async () => {
        if (localStorage.getItem('token')) {
            try {
                const response = await fetch('/api/user/me/', {
                    method: 'GET',
                    headers: {
                        'auth-token': localStorage.getItem('token')
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error loading user:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                setIsAuthenticated(false);
            }
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password }),
            });

            const json = await res.json();
            setLoading(false);
            
            if (json.success) {
                localStorage.setItem("token", json.authToken);
                localStorage.setItem("role", json.user.role);
                setUser(json.user);
                setIsAuthenticated(true);
                return { success: true };
            } else {
                if (json.error && json.error.includes("deactivated")) {
                    return { success: false, deactivated: true };
                } else {
                    showAlert("Invalid Credentials!", "danger");
                    return { success: false, deactivated: false };
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            setLoading(false);
            showAlert("An unexpected error occurred", "danger");
            return { success: false, deactivated: false };
        }
    };
    
    const register = async (userData) => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData),
            });

            const json = await res.json();
            setLoading(false);
            
            if (json.success) {
                showAlert("Registration successful. Please log in.", "success");
                return true;
            } else {
                showAlert("Registration failed. Try again.", "danger");
                return false;
            }
        } catch (error) {
            console.error("Registration error:", error);
            setLoading(false);
            showAlert("An unexpected error occurred", "danger");
            return false;
        }
    };

    const restoreAccount = async (email, password) => {
        setLoading(true);
        try {
            const restoreRes = await fetch("/api/auth/restore", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password }),
            });
            
            const restoreJson = await restoreRes.json();
            setLoading(false);
            
            if (restoreRes.ok && restoreJson.success) {
                localStorage.setItem("token", restoreJson.authToken);
                localStorage.setItem("role", restoreJson.user.role);
                setUser(restoreJson.user);
                setIsAuthenticated(true);
                return true;
            } else {
                showAlert(restoreJson.error || "Failed to restore account", "danger");
                return false;
            }
        } catch (error) {
            console.error("Restore error:", error);
            setLoading(false);
            showAlert("An unexpected error occurred", "danger");
            return false;
        }
    };
    
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <authContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            login,
            register,
            restoreAccount,
            logout,
            loadUser
        }}>
            {props.children}
        </authContext.Provider>
    );
};

export default AuthState;