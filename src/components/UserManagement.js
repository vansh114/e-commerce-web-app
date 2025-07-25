import React, { useState, useEffect, useContext } from 'react';
import Spinner from './Spinner';
import alertContext from '../context/alert/alertContext';

const UserManagement = () => {
  const { showAlert } = useContext(alertContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentAction, setCurrentAction] = useState({ type: '', userId: '' });

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        }
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        showAlert(data.error || 'Failed to fetch users', 'danger');
      }
    } catch (error) {
      showAlert('Error fetching users', 'danger');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordConfirm = () => {
    if (!adminPassword) {
      showAlert('Password is required', 'danger');
      return;
    }

    switch (currentAction.type) {
      case 'deactivate':
        performDeactivate(currentAction.userId, adminPassword);
        break;
      case 'restore':
        performRestore(currentAction.userId, adminPassword);
        break;
      case 'delete':
        performDelete(currentAction.userId, adminPassword);
        break;
      default:
        break;
    }
    setAdminPassword('');
    setShowPasswordModal(false);
  };

  const handleDeactivate = (userId) => {
    setCurrentAction({ type: 'deactivate', userId });
    setShowPasswordModal(true);
  };

  const performDeactivate = async (userId, password) => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/deactivate/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      if (response.ok) {
        showAlert(data.message || 'User deactivated successfully', 'success');
        fetchUsers();
      } else {
        showAlert(data.error || 'Failed to deactivate user', 'danger');
      }
    } catch (error) {
      showAlert('Error deactivating user', 'danger');
      console.error('Error:', error);
    }
  };

  const handleRestore = (userId) => {
    setCurrentAction({ type: 'restore', userId });
    setShowPasswordModal(true);
  };
  
  const performRestore = async (userId, password) => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/restore/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        } else if (response.status === 400) {
          throw new Error(data.error || 'User is already active');
        }
        throw new Error(data.error || 'Failed to restore user');
      }

      showAlert(data.message || 'User restored successfully', 'success');
      fetchUsers();
    } catch (error) {
      showAlert(error.message || 'Error restoring user', 'danger');
      console.error('Restore Error:', error);
    }
  };
  
  const handleDelete = (userId) => {
    setCurrentAction({ type: 'delete', userId });
    setShowPasswordModal(true);
  };

  const performDelete = async (userId, password) => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      if (response.ok) {
        showAlert(data.message || 'User deleted successfully', 'success');
        fetchUsers();
      } else {
        showAlert(data.error || 'Failed to delete user', 'danger');
      }
    } catch (error) {
      showAlert('Error deleting user', 'danger');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    try {
      setLoading(true);
      fetchUsers();
    }
    catch (error) {
      showAlert('Error fetching users', 'danger');
      console.error('Error:', error);
    }
    finally {
      setLoading(false);
    }
  }, []);

  const capitalize = (word) => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.toLowerCase().slice(1);
  };

  return (
    <>
      <div className="container mt-4 px-3 bg-custom min-vh-100">
        <h2 className="text-dark mb-4 fw-bold">User Management</h2>
        {loading && <Spinner />}

        <div className="row g-4">
          {users.length === 0 ? (
            <div className="col-12 text-center py-4 productlist-empty">
              No users found.
            </div>
          ) : (
            users.map((user) => (
              <div key={user._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card shadow-sm h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="card-title fw-semibold">{user.name}</h5>
                      <p className="card-text mb-1 text-muted">{user.email}</p>
                      <p className="card-text">
                        <span className={`badge ${user.role === 'admin' ? 'bg-danger me-2' : 'bg-secondary me-2'} rounded-pill`}>
                          {capitalize(user.role)}
                        </span>
                        <span className={`badge ${user.isDeleted ? 'bg-warning text-dark' : 'bg-success'} rounded-pill`}>
                          {user.isDeleted ? 'Deactivated' : 'Active'}
                        </span>
                      </p>
                    </div>
                    <div className="mt-3">
                      {!user.isDeleted ? (
                        <>
                          <button
                            className="btn btn-outline-danger btn-sm me-2 mb-2 rounded-pill shadow-sm w-100"
                            onClick={() => handleDeactivate(user._id)}
                          >
                            Deactivate
                          </button>
                          <button
                            className="btn btn-danger btn-sm rounded-pill shadow-sm w-100"
                            onClick={() => handleDelete(user._id)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-success btn-sm rounded-pill shadow-sm w-100"
                          onClick={() => handleRestore(user._id)}
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal d-block" tabIndex="-1" style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1050
        }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Admin Authentication Required</h5>
                <button type="button" className="btn-close" onClick={() => setShowPasswordModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Please enter your admin password to continue:</p>
                <input
                  type="password"
                  className="form-control"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handlePasswordConfirm}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>

  );
};

export default UserManagement;