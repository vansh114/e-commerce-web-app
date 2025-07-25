import { useContext, useState } from "react";
import userContext from "./userContext";
import alertContext from "../alert/alertContext";

const UserState = (props) => {
    const { showAlert } = useContext(alertContext);
    const [user, setUser] = useState({
        name: '',
        email: '',
        address: '',
        phone: '',
        role: localStorage.getItem('role') || ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: ''
    });

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/user/me/', {
                method: 'GET',
                headers: {
                    'auth-token': localStorage.getItem('token')
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch User!');
            }

            const data = await response.json();
            setUser({
                name: data.name || '',
                email: data.email || '',
                address: data.address || '',
                phone: data.phone || '',
                role: data.role || 'user'
            });
        }
        catch (error) {
            console.error('Error fetching user profile: ', error.message);
        }
    };

    const updateProfile = async (updatedUser) => {
        try {
            const res = await fetch('/api/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify(updatedUser)
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                await fetchProfile(); // Refresh user data
                showAlert('Profile updated successfully!', 'success');
            }
            else {
                showAlert(data.error || 'Profile update failed.', 'danger');
            }
        }
        catch (error) {
            console.error('Update error:', error);
            showAlert('An unexpected error occurred. Please try again later.', 'danger');
        }
    };

    const changePassword = async (passwordData) => {
        try {
            const res = await fetch('/api/user/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify(passwordData)
            });
            const data = await res.json();
            if (res.ok) {
                showAlert('Password Changed Successfully!', 'success');
                setPasswordData({ currentPassword: '', newPassword: '' });
            }
            else {
                showAlert(data.error || 'Password Change Failed. Please Try Again.', 'danger');
            }
        }
        catch (error) {
            console.error('Password change error:', error);
            showAlert(error || 'An unexpected error occurred. Please try again later.', 'danger');
        }
    };

    const deactivateAccount = async (password) => {
        try {
            const res = await fetch('/api/user/me/deactivate', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                showAlert(data.error || 'Failed to deactivate account', 'danger');
            }
        } catch (error) {
            console.error('Deactivation error:', error);
            showAlert('An unexpected error occurred. Please try again later.', 'danger');
        }
    };

    const deleteAccount = async (password) => {
        try {
            const res = await fetch('/api/user/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                showAlert(data.error || 'Failed to delete account', 'danger');
            }
        } catch (error) {
            console.error('Deletion error:', error);
            showAlert('An unexpected error occurred. Please try again later.', 'danger');
        }
    };

    return (
        <userContext.Provider value={{ 
            user, 
            setUser, 
            passwordData, 
            setPasswordData, 
            fetchProfile, 
            updateProfile, 
            changePassword,
            deactivateAccount,
            deleteAccount
        }}>
            {props.children}
        </userContext.Provider>
    )
}

export default UserState;