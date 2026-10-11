import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboardPage = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/admin/stats');
        if (res.data?.success) {
          setStatsData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load administrator statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Gathering platform metrics..." fullPage />;
  }

  const stats = statsData?.stats || {
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
  };
  const recentEnrollments = statsData?.recentEnrollments || [];

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Admin Header */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <span className="badge bg-danger-subtle text-danger fw-bold px-3 py-1 rounded-pill mb-2">
                Administrator Control Center
              </span>
              <h2 className="fw-bold text-dark mb-1">OCMS System Overview</h2>
              <p className="text-secondary mb-0">
                Manage academic offerings, supervise enrollments, and track simulated transactions.
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/admin/courses" className="btn btn-primary-custom shadow-sm">
                <i className="bi bi-journal-plus me-1"></i> Manage Courses
              </Link>
              <Link to="/admin/students" className="btn btn-outline-secondary rounded-3">
                <i className="bi bi-people me-1"></i> View Students
              </Link>
              <Link to="/admin/enrollments" className="btn btn-outline-secondary rounded-3">
                <i className="bi bi-card-checklist me-1"></i> Enrollments
              </Link>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger rounded-3 mb-4">{error}</div>}

        {/* System Metric Cards */}
        <div className="row g-4 mb-4">
          <div className="col-sm-6 col-lg-3">
            <StatsCard
              title="Registered Students"
              value={stats.totalStudents}
              icon="bi-people-fill"
              bgClass="bg-primary-subtle"
              textClass="text-primary"
              subtitle="Total active learners"
            />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatsCard
              title="Catalog Courses"
              value={stats.totalCourses}
              icon="bi-book-half"
              bgClass="bg-info-subtle"
              textClass="text-info"
              subtitle="Active courses published"
            />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatsCard
              title="Total Enrollments"
              value={stats.totalEnrollments}
              icon="bi-mortarboard-fill"
              bgClass="bg-warning-subtle"
              textClass="text-warning-emphasis"
              subtitle="Course registrations"
            />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatsCard
              title="Simulated Revenue"
              value={`$${stats.totalRevenue.toFixed(2)}`}
              icon="bi-cash-coin"
              bgClass="bg-success-subtle"
              textClass="text-success"
              subtitle="Sandbox gross test value"
            />
          </div>
        </div>

        {/* Recent Enrollments Table */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold text-dark mb-1">Recent Student Enrollments</h5>
              <p className="text-secondary small mb-0">Latest course registrations across the platform</p>
            </div>
            <Link to="/admin/enrollments" className="btn btn-outline-primary btn-sm rounded-pill px-3">
              View All Enrollments <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {recentEnrollments.length === 0 ? (
            <div className="text-center py-4 text-muted small">No recent enrollments recorded.</div>
          ) : (
            <div className="table-responsive custom-table">
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Course Title</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnrollments.map((enr) => (
                    <tr key={enr._id}>
                      <td>
                        <strong className="text-dark d-block">{enr.student?.name || 'Student'}</strong>
                        <small className="text-muted">{enr.student?.email}</small>
                      </td>
                      <td>
                        <span className="fw-semibold text-dark">{enr.course?.title || 'Course'}</span>
                        <span className="badge bg-light text-muted border ms-2 small">
                          {enr.course?.category}
                        </span>
                      </td>
                      <td className="fw-bold text-success">
                        ${enr.course?.price?.toFixed(2) || '0.00'}
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill ${
                            enr.status === 'enrolled'
                              ? 'bg-success-subtle text-success'
                              : enr.status === 'completed'
                              ? 'bg-info-subtle text-info'
                              : 'bg-warning-subtle text-warning-emphasis'
                          }`}
                        >
                          {enr.status}
                        </span>
                      </td>
                      <td className="text-secondary small">
                        {new Date(enr.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
