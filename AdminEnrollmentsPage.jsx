import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

const AdminEnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await axiosClient.get('/admin/enrollments', { params });
      if (res.data?.success) {
        setEnrollments(res.data.enrollments || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [statusFilter]);

  const handleStatusChange = async (enrollmentId, newStatus) => {
    try {
      setUpdatingId(enrollmentId);
      setError('');
      setSuccess('');

      const res = await axiosClient.put(`/admin/enrollments/${enrollmentId}/status`, {
        status: newStatus,
      });

      if (res.data?.success) {
        setSuccess(`Enrollment status updated to "${newStatus}"!`);
        setEnrollments((prev) =>
          prev.map((e) => (e._id === enrollmentId ? { ...e, status: newStatus } : e))
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to update enrollment status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="fw-bold text-dark mb-1">Enrollment Management</h1>
            <p className="text-secondary mb-0">
              Supervise all student registrations, track progress, and update status.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <label className="small fw-semibold text-secondary mb-0">Filter Status:</label>
            <select
              className="form-select form-select-sm shadow-none w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="enrolled">Enrolled</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Table Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white border-bottom p-4">
            <h5 className="fw-bold text-dark mb-0">Platform Enrollments ({enrollments.length})</h5>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading course enrollments..." />
          ) : enrollments.length === 0 ? (
            <div className="text-center py-5">
              <div className="fs-1 text-muted mb-2">📋</div>
              <h5 className="text-dark fw-bold">No Enrollments Found</h5>
              <p className="text-secondary small">
                {statusFilter !== 'All'
                  ? `No records found with status "${statusFilter}".`
                  : 'No course registrations have been made yet.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive custom-table">
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course Title</th>
                    <th>Simulated Txn</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enr) => {
                    const student = enr.student;
                    const course = enr.course;
                    const payment = enr.payment;

                    return (
                      <tr key={enr._id}>
                        <td>
                          <strong className="text-dark d-block">{student?.name || 'Unknown Student'}</strong>
                          <small className="text-muted">{student?.email}</small>
                        </td>
                        <td>
                          <span className="fw-semibold text-dark d-block">
                            {course?.title || 'Course'}
                          </span>
                          <span className="badge bg-light text-muted border small">
                            {course?.category} &bull; ${course?.price?.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          {payment ? (
                            <div>
                              <span className="font-monospace small d-block text-dark">
                                {payment.transactionId}
                              </span>
                              <span className="badge bg-success-subtle text-success small">
                                Paid: ${payment.amount?.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="badge bg-secondary-subtle text-muted">Direct / Free</span>
                          )}
                        </td>
                        <td style={{ minWidth: '120px' }}>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-fill" style={{ height: '6px' }}>
                              <div
                                className="progress-bar bg-primary"
                                style={{ width: `${enr.progress || 0}%` }}
                              ></div>
                            </div>
                            <small className="fw-bold text-dark">{enr.progress || 0}%</small>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill ${
                              enr.status === 'enrolled'
                                ? 'bg-success-subtle text-success'
                                : enr.status === 'completed'
                                ? 'bg-info-subtle text-info'
                                : enr.status === 'pending'
                                ? 'bg-warning-subtle text-warning-emphasis'
                                : 'bg-danger-subtle text-danger'
                            }`}
                          >
                            {enr.status}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm shadow-none"
                            value={enr.status}
                            disabled={updatingId === enr._id}
                            onChange={(e) => handleStatusChange(enr._id, e.target.value)}
                          >
                            <option value="enrolled">Enrolled</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEnrollmentsPage;
