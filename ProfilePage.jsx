import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Payment History State
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchProfileAndPayments = async () => {
      try {
        setLoading(true);
        const [profileRes, paymentsRes] = await Promise.all([
          axiosClient.get('/users/profile'),
          axiosClient.get('/payments/history'),
        ]);

        if (profileRes.data?.success) {
          const u = profileRes.data.user;
          setName(u.name || '');
          setPhone(u.phone || '');
          setBio(u.bio || '');
          setStats(profileRes.data.stats);
        }

        if (paymentsRes.data?.success) {
          setPayments(paymentsRes.data.payments || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPayments();
  }, []);

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      const res = await axiosClient.put('/users/profile', { name, phone, bio });
      if (res.data?.success) {
        updateUser(res.data.user);
        setSuccess('Profile updated successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setSaving(true);
      const res = await axiosClient.put('/users/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading user profile settings..." fullPage />;
  }

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Profile Header */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-2 shadow-sm"
                style={{ width: '70px', height: '70px' }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="fw-bold text-dark mb-1">{user?.name}</h3>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-secondary small">{user?.email}</span>
                  <span
                    className={`badge rounded-pill ${
                      user?.role === 'admin' ? 'bg-danger' : 'bg-primary-subtle text-primary'
                    }`}
                  >
                    {user?.role === 'admin' ? 'Administrator' : 'Student'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats badges */}
            {stats && (
              <div className="d-flex gap-3">
                <div className="bg-light border rounded-3 px-3 py-2 text-center">
                  <span className="small text-muted d-block">Enrolled</span>
                  <strong className="text-dark fs-5">{stats.enrolledCount || 0}</strong>
                </div>
                <div className="bg-light border rounded-3 px-3 py-2 text-center">
                  <span className="small text-muted d-block">Completed</span>
                  <strong className="text-success fs-5">{stats.completedCount || 0}</strong>
                </div>
                <div className="bg-light border rounded-3 px-3 py-2 text-center">
                  <span className="small text-muted d-block">Transactions</span>
                  <strong className="text-primary fs-5">{stats.paymentsCount || 0}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Tab Navigation */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="border-bottom px-4 pt-3 bg-light">
            <ul className="nav nav-tabs border-0">
              <li className="nav-item">
                <button
                  className={`nav-link border-0 fw-semibold pb-3 ${
                    activeTab === 'profile'
                      ? 'active text-primary border-bottom border-primary border-3 bg-transparent'
                      : 'text-secondary'
                  }`}
                  onClick={() => {
                    setActiveTab('profile');
                    setError('');
                    setSuccess('');
                  }}
                >
                  <i className="bi bi-person-lines-fill me-2"></i> Account Details
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link border-0 fw-semibold pb-3 ${
                    activeTab === 'security'
                      ? 'active text-primary border-bottom border-primary border-3 bg-transparent'
                      : 'text-secondary'
                  }`}
                  onClick={() => {
                    setActiveTab('security');
                    setError('');
                    setSuccess('');
                  }}
                >
                  <i className="bi bi-shield-lock me-2"></i> Security & Password
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link border-0 fw-semibold pb-3 ${
                    activeTab === 'payments'
                      ? 'active text-primary border-bottom border-primary border-3 bg-transparent'
                      : 'text-secondary'
                  }`}
                  onClick={() => {
                    setActiveTab('payments');
                    setError('');
                    setSuccess('');
                  }}
                >
                  <i className="bi bi-receipt-cutoff me-2"></i> Simulated Receipts ({payments.length})
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-4 p-md-5">
            {/* Tab 1: Profile Details */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} style={{ maxWidth: '650px' }}>
                <h5 className="fw-bold text-dark mb-4">Edit Profile Information</h5>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Full Name</label>
                  <input
                    type="text"
                    className="form-control shadow-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    className="form-control bg-light shadow-none"
                    value={user?.email || ''}
                    disabled
                  />
                  <small className="text-muted">Email is tied to your account login identifier.</small>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                  <input
                    type="text"
                    className="form-control shadow-none"
                    placeholder="e.g. +1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">Bio / About Me</label>
                  <textarea
                    className="form-control shadow-none"
                    rows="4"
                    placeholder="Tell us a little bit about your learning goals..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-custom px-4 shadow-sm"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </form>
            )}

            {/* Tab 2: Security & Password */}
            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} style={{ maxWidth: '500px' }}>
                <h5 className="fw-bold text-dark mb-4">Update Account Password</h5>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="form-control shadow-none"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    New Password (Min. 6 characters)
                  </label>
                  <input
                    type="password"
                    className="form-control shadow-none"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="form-control shadow-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-custom px-4 shadow-sm"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating Password...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </form>
            )}

            {/* Tab 3: Simulated Receipts */}
            {activeTab === 'payments' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">Simulated Transaction History</h5>
                    <p className="text-secondary small mb-0">
                      Receipts recorded under simulated sandbox checkouts.
                    </p>
                  </div>
                </div>

                {payments.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4 border">
                    <div className="fs-1 text-muted mb-2">💳</div>
                    <h6 className="fw-bold text-dark">No simulated transactions yet</h6>
                    <p className="text-secondary small mb-0">
                      When you enroll in a course using the simulated payment flow, your receipts will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive custom-table">
                    <table className="table mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>Transaction ID</th>
                          <th>Course</th>
                          <th>Amount</th>
                          <th>Payment Method</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p._id}>
                            <td className="font-monospace small fw-bold text-dark">
                              {p.transactionId}
                            </td>
                            <td>
                              <span className="fw-semibold text-dark">
                                {p.course?.title || 'Course'}
                              </span>
                            </td>
                            <td className="fw-bold text-success">
                              ${p.amount?.toFixed(2)}
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border small">
                                Simulated Card •••• {p.cardLast4 || '4242'}
                              </span>
                            </td>
                            <td className="text-secondary small">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <span className="badge bg-success-subtle text-success">
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
