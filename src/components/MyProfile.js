import { useContext, useEffect, useState } from 'react';
import userContext from '../context/user/userContext';
import { motion } from "framer-motion";
import { Modal, Button } from 'react-bootstrap';

const MyProfile = () => {
    const { user, passwordData, setPasswordData, fetchProfile, updateProfile, changePassword, deactivateAccount, deleteAccount } = useContext(userContext);
    const [isNameValid, setIsNameValid] = useState(true);
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [isPhoneValid, setIsPhoneValid] = useState(true);
    const [isAddressValid, setIsAddressValid] = useState(true);
    const [editedUser, setEditedUser] = useState({ name: "", phone: "", address: "" });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [actionType, setActionType] = useState("");
    const isUnchanged = JSON.stringify(user) === JSON.stringify(editedUser);
    
    const [showEditModal, setShowEditModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        await changePassword(passwordData);
        setPasswordData({ currentPassword: '', newPassword: '' });
    };

    const handleNameChange = (e) => {
        const value = e.target.value;
        setEditedUser({ ...editedUser, name: value });
        const isValid = value.trim().length >= 3;
        setIsNameValid(isValid);
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        setEditedUser({ ...editedUser, phone: value });
        const isValid = /^[0-9]{10}$/.test(value);
        setIsPhoneValid(isValid);
    };

    const handleAddressChange = (e) => {
        const value = e.target.value;
        setEditedUser({ ...editedUser, address: value });
        const isValid = value.trim().length > 6;
        setIsAddressValid(isValid);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        await updateProfile(editedUser);
        setShowEditModal(false);
    };

    const handleCancel = () => {
        setShowEditModal(false);
        setEditedUser(user);
        if (!(isNameValid && isPhoneValid && isAddressValid)) {
            setIsNameValid(true);
            setIsEmailValid(true);
            setIsPhoneValid(true);
            setIsAddressValid(true);
        }
    }

    const handleDeactivateClick = () => {
        setActionType("deactivate");
        setConfirmPassword("");
        setShowConfirmModal(true);
    };

    const handleDeleteClick = () => {
        setActionType("delete");
        setConfirmPassword("");
        setShowConfirmModal(true);
    };

    const handleConfirmAction = () => {
        if (actionType === "deactivate") {
            deactivateAccount(confirmPassword);
        } else if (actionType === "delete") {
            deleteAccount(confirmPassword);
        }
        setShowConfirmModal(false);
    };

    return (
        <>
            <div className="container mt-4">
                <div className="row g-5">
                    {/* Profile Section */}
                    <motion.div className="col-12 col-md-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h2 className="mb-4 fw-bold text-primary-emphasis">👤 My Profile</h2>
                        <div className="card p-5 shadow-lg rounded-4 border-0 mb-2">
                            <p className="mb-2"><strong>Name:</strong> <span className="text-secondary">{user.name}</span></p>
                            <p className="mb-2"><strong>Email:</strong> <span className="text-secondary">{user.email}</span></p>
                            <p className="mb-2"><strong>Phone:</strong> <span className="text-secondary">{user.phone}</span></p>
                            <p className="mb-2"><strong>Address:</strong> <span className="text-secondary">{user.address}</span></p>
                            <button className="btn btn-outline-primary mt-3 rounded-pill px-4 shadow-sm" onClick={() => {
                                setEditedUser(user);
                                setShowEditModal(true);
                            }}>
                                ✏️ Edit Profile
                            </button>
                        </div>
                    </motion.div>

                    {/* Password Section */}
                    <motion.div className="col-12 col-md-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 2, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                        <h2 className="mb-4 fw-bold text-primary-emphasis">🔐 Change Password</h2>
                        <div className="card p-4 shadow-lg rounded-4 border-0 mb-2">
                            <div className="card-body">
                                <form onSubmit={handlePasswordChange}>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Current Password</label>
                                            <input type="password" className="form-control rounded-pill shadow-sm" name="currentPassword" minLength={6} value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, [e.target.name]: e.target.value })} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">New Password</label>
                                            <input type="password" className="form-control rounded-pill shadow-sm" name="newPassword" minLength={6} value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, [e.target.name]: e.target.value })} />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-warning mt-4 rounded-pill px-4 shadow-sm fw-bold">🔁 Change Password</button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Account Options */}
                <div className="mt-5">
                    <h2 className="mb-3 fw-bold text-primary-emphasis">⚙️ Account Options</h2>
                    <div className="d-flex flex-column flex-md-row gap-3 p-3">
                        <button 
                            className="btn btn-outline-secondary rounded-pill px-4 flex-shrink-0" 
                            style={{ minWidth: '200px' }}
                            onClick={handleDeactivateClick}
                        >
                            ⚠️ Deactivate Account
                        </button>
                        <button 
                            className="btn btn-outline-danger rounded-pill px-4 flex-shrink-0" 
                            style={{ minWidth: '200px' }}
                            onClick={handleDeleteClick}
                        >
                            🗑️ Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton className="bg-gradient bg-primary text-white rounded-top-4">
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Name</label>
                            <input type="text" className="form-control rounded-pill shadow-sm" name="name" minLength={3} required value={editedUser.name} onChange={handleNameChange} />
                            {!isNameValid && <small className="text-danger">Name must be at least 3 characters long.</small>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Phone</label>
                            <input type="tel" className="form-control rounded-pill shadow-sm" name="phone" pattern="[0-9]{10}" maxLength="10" required value={editedUser.phone} onChange={handlePhoneChange} />
                            {!isPhoneValid && <small className="text-danger">Phone number must be 10 digits.</small>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Address</label>
                            <input type="text" className="form-control rounded-pill shadow-sm" name="address" required value={editedUser.address} onChange={handleAddressChange} />
                            {!isAddressValid && <small className="text-danger">Address cannot be empty.</small>}
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleCancel}>Cancel</Button>
                    <Button
                        variant="success"
                        className="rounded-pill px-4"
                        disabled={!isPhoneValid || !isNameValid || !isEmailValid || !isAddressValid || isUnchanged}
                        onClick={handleSave}
                    >
                        💾 Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Confirm Action Modal - Using React Bootstrap */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {actionType === "deactivate" ? "Confirm Deactivation" : "Confirm Deletion"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        {actionType === "deactivate" 
                            ? "Are you sure you want to deactivate your account? You can reactivate it later by logging in." 
                            : "Are you sure you want to permanently delete your account? This action cannot be undone."}
                    </p>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Enter your password to confirm</label>
                        <input 
                            type="password" 
                            className="form-control rounded-pill shadow-sm" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            placeholder="Enter your password"
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                    <Button 
                        variant={actionType === "deactivate" ? "warning" : "danger"}
                        onClick={handleConfirmAction}
                        disabled={!confirmPassword}
                    >
                        {actionType === "deactivate" ? "Deactivate" : "Delete"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MyProfile;