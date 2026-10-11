import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';

const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axiosClient.get('/enrollments/my-courses');
        if (res.data?.success) {
          setEnrollments(res.data.enrollments || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalEnrolled = enrollments.length;
  const inProgressCount = enrollments.filter(
    (e) => e.status === 'enrolled' || (e.progress > 0 && e.progress < 100)
  ).length;
  const completedCount = enrollments.filter(
    (e) => e.status === 'completed' || e.progress === 100
  ).length;

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Welcome Header */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill mb-2">
                Student Learning Portal
              </span>
              <h2 className="fw-bold text-dark mb-1">
                Welcome back, {user?.name || 'Student'}! 👋
              </h2>
              <p className="text-secondary mb-0">
                Pick up where you left off and keep your software engineering journey moving forward.
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/courses" className="btn btn-primary-custom shadow-sm">
                <i className="bi bi-search me-1"></i> Browse Catalog
              </Link>
              <Link to="/profile" className="btn btn-outline-secondary rounded-3">
                <i className="bi bi-gear me-1"></i> Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Learning Statistics Grid */}
        <div className="row g-4 mb-4">
          <div className="col-sm-6 col-lg-3">
            <StatsCard
              title="Registered Courses"
              value={totalEnrolled}
              icon="bi-journal-bookmark-fill"
              bgClass="bg-primary-subtle"
              textClass="text-primary"
              subtitle="Active enrollments"
            />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatsCard
              title="In Progress"
              value={inProgressCount}
              icon="bi-hourglass-split"
              bgClass="bg-warning-subtle"
              textClass="text-warning-emphasis"
              subtitle="Lectures underway"
            />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatsCard
              title="Completed"
              value={completedCount}
              icon="bi-patch-check-fill"
              bgClass="bg-success-subtle"
              textClass="text-success"
              subtitle="Curriculum mastered"
            />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatsCard
              title="Account Status"
              value="Active"
              icon="bi-shield-check"
              bgClass="bg-info-subtle"
              textClass="text-info"
              subtitle="Verified Student"
            />
          </div>
        </div>

        {/* Continue Learning Section */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold text-dark mb-1">Your Registered Courses</h4>
              <p className="text-secondary small mb-0">
                Continue lessons, track module completion, and review syllabi.
              </p>
            </div>
            <Link to="/my-courses" className="btn btn-outline-primary btn-sm rounded-pill px-3">
              View All Registered Courses <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading your courses..." />
          ) : error ? (
            <div className="alert alert-danger rounded-3">{error}</div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-4 border">
              <div className="fs-1 text-muted mb-2">🎒</div>
              <h5 className="fw-bold text-dark">You have not registered for any courses yet</h5>
              <p className="text-secondary small mb-3">
                Discover our courses, test the simulated checkout, and begin learning right away!
              </p>
              <Link to="/courses" className="btn btn-primary rounded-pill px-4">
                Explore Available Courses
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {enrollments.slice(0, 4).map((enrollment) => {
                const c = enrollment.course;
                if (!c) return null;
                const progressVal = enrollment.progress || 0;

                return (
                  <div key={enrollment._id} className="col-md-6 col-lg-6">
                    <div className="card border rounded-4 overflow-hidden h-100 shadow-sm">
                      <div className="row g-0 h-100">
                        <div className="col-sm-4 bg-light">
                          <img
                            src={
                              c.thumbnail ||
                              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
                            }
                            alt={c.title}
                            className="w-100 h-100 object-fit-cover"
                            style={{ minHeight: '140px' }}
                          />
                        </div>
                        <div className="col-sm-8 p-3 d-flex flex-column justify-content-between bg-white">
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="badge bg-primary-subtle text-primary small">
                                {c.category}
                              </span>
                              <span
                                className={`badge ${
                                  enrollment.status === 'completed'
                                    ? 'bg-success'
                                    : 'bg-info-subtle text-info'
                                }`}
                              >
                                {enrollment.status === 'completed' ? 'Completed' : 'Enrolled'}
                              </span>
                            </div>
                            <h6 className="fw-bold text-dark mb-1 text-truncate-2" title={c.title}>
                              {c.title}
                            </h6>
                            <p className="text-muted small mb-2">By {c.instructor}</p>
                          </div>

                          <div>
                            <div className="d-flex justify-content-between text-muted small mb-1">
                              <span>Progress</span>
                              <span className="fw-bold text-dark">{progressVal}%</span>
                            </div>
                            <div className="progress mb-3" style={{ height: '7px' }}>
                              <div
                                className={`progress-bar ${
                                  progressVal === 100 ? 'bg-success' : 'bg-primary'
                                }`}
                                role="progressbar"
                                style={{ width: `${progressVal}%` }}
                                aria-valuenow={progressVal}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                              {enrollment.certificateIssued && (
                                <Link
                                  to={`/certificate/${enrollment._id}`}
                                  className="btn btn-sm btn-warning rounded-pill px-3 fw-semibold text-dark"
                                >
                                  <i className="bi bi-award-fill me-1"></i> Cert
                                </Link>
                              )}
                              <Link
                                to={`/classroom/${enrollment._id}`}
                                className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold"
                              >
                                <i className="bi bi-camera-video me-1"></i> Classroom
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
