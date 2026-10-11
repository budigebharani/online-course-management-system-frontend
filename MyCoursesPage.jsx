import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

const MyCoursesPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

  // Active modal for learning
  const [activeEnrollment, setActiveEnrollment] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/enrollments/my-courses');
      if (res.data?.success) {
        setEnrollments(res.data.enrollments || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your registered courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  // Update progress handler
  const handleToggleLesson = async (lessonTitle) => {
    if (!activeEnrollment) return;

    try {
      setUpdating(true);
      const isCompleted = activeEnrollment.completedLessons?.some(
        (l) => l.lessonTitle === lessonTitle
      );

      // Simple calculation: calculate new progress percentage
      const totalLessons =
        activeEnrollment.course?.syllabus?.reduce(
          (acc, m) => acc + (m.lessons?.length || 0),
          0
        ) || 5;

      const currentCompletedCount = activeEnrollment.completedLessons?.length || 0;
      const nextCompletedCount = isCompleted
        ? Math.max(0, currentCompletedCount - 1)
        : currentCompletedCount + 1;

      const nextProgress = Math.min(
        100,
        Math.round((nextCompletedCount / totalLessons) * 100)
      );

      const res = await axiosClient.put(
        `/enrollments/${activeEnrollment._id}/progress`,
        {
          progress: nextProgress,
          lessonTitle: isCompleted ? null : lessonTitle,
        }
      );

      if (res.data?.success) {
        setSuccess('Lesson progress updated!');
        // Update active enrollment & local list
        setEnrollments((prev) =>
          prev.map((item) =>
            item._id === activeEnrollment._id ? res.data.enrollment : item
          )
        );
        setActiveEnrollment(res.data.enrollment);
        setTimeout(() => setSuccess(''), 2500);
      }
    } catch (err) {
      setError(err.message || 'Could not update progress');
    } finally {
      setUpdating(false);
    }
  };

  // Filtered list
  const filteredEnrollments = enrollments.filter((e) => {
    if (filter === 'in-progress') return e.status === 'enrolled' && (e.progress || 0) < 100;
    if (filter === 'completed') return e.status === 'completed' || (e.progress || 0) === 100;
    return true;
  });

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="fw-bold text-dark mb-1">My Registered Courses</h1>
            <p className="text-secondary mb-0">
              Manage your registered curricula, resume lectures, and track your completion milestones.
            </p>
          </div>
          <Link to="/courses" className="btn btn-primary-custom shadow-sm">
            <i className="bi bi-plus-circle me-1"></i> Enroll in New Course
          </Link>
        </div>

        {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Filter Navigation Tabs */}
        <div className="card border-0 shadow-sm rounded-4 p-2 bg-white mb-4">
          <ul className="nav nav-pills gap-2">
            <li className="nav-item">
              <button
                className={`nav-link rounded-3 fw-semibold ${filter === 'all' ? 'active' : 'text-secondary'}`}
                onClick={() => setFilter('all')}
              >
                All Courses ({enrollments.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-3 fw-semibold ${filter === 'in-progress' ? 'active' : 'text-secondary'}`}
                onClick={() => setFilter('in-progress')}
              >
                In Progress ({enrollments.filter((e) => (e.progress || 0) < 100).length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-3 fw-semibold ${filter === 'completed' ? 'active' : 'text-secondary'}`}
                onClick={() => setFilter('completed')}
              >
                Completed ({enrollments.filter((e) => e.status === 'completed' || (e.progress || 0) === 100).length})
              </button>
            </li>
          </ul>
        </div>

        {/* Courses Listing */}
        {loading ? (
          <LoadingSpinner message="Loading your enrolled courses..." />
        ) : filteredEnrollments.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border shadow-sm p-4">
            <div className="fs-1 text-muted mb-3">🎓</div>
            <h4 className="fw-bold text-dark">No courses found in this category</h4>
            <p className="text-secondary small mb-4">
              {filter === 'completed'
                ? 'You have not marked any course as completed yet. Keep learning!'
                : 'You have not registered for any courses in this filter.'}
            </p>
            <Link to="/courses" className="btn btn-primary rounded-pill px-4">
              Explore Available Courses
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {filteredEnrollments.map((enrollment) => {
              const c = enrollment.course;
              if (!c) return null;
              const progressVal = enrollment.progress || 0;

              return (
                <div key={enrollment._id} className="col-lg-6">
                  <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white">
                    <div className="row g-0 h-100">
                      <div className="col-md-5 position-relative">
                        <img
                          src={
                            c.thumbnail ||
                            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
                          }
                          alt={c.title}
                          className="w-100 h-100 object-fit-cover"
                          style={{ minHeight: '190px' }}
                        />
                        <span className="badge-category">{c.category}</span>
                      </div>

                      <div className="col-md-7 p-4 d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span
                              className={`badge rounded-pill ${
                                enrollment.status === 'completed' || progressVal === 100
                                  ? 'bg-success'
                                  : 'bg-primary-subtle text-primary'
                              } px-3 py-1`}
                            >
                              {enrollment.status === 'completed' || progressVal === 100
                                ? 'Completed'
                                : 'In Progress'}
                            </span>
                            <small className="text-muted">
                              Enrolled: {new Date(enrollment.enrolledAt || enrollment.createdAt).toLocaleDateString()}
                            </small>
                          </div>

                          <h5 className="fw-bold text-dark mb-1 text-truncate-2" title={c.title}>
                            {c.title}
                          </h5>
                          <p className="text-secondary small mb-3">
                            Instructor: <strong className="text-dark">{c.instructor}</strong>
                          </p>
                        </div>

                        <div>
                          {/* Progress bar */}
                          <div className="d-flex justify-content-between text-muted small mb-1">
                            <span>Course Progress</span>
                            <span className="fw-bold text-dark">{progressVal}%</span>
                          </div>
                          <div className="progress mb-3" style={{ height: '8px' }}>
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

                          {/* Action Buttons */}
                          <div className="d-flex flex-wrap gap-2">
                            <Link
                              to={`/classroom/${enrollment._id}`}
                              className="btn btn-primary btn-sm rounded-pill px-3 flex-fill fw-semibold"
                            >
                              <i className="bi bi-camera-video me-1"></i> Classroom & Lectures
                            </Link>

                            {enrollment.certificateIssued && (
                              <Link
                                to={`/certificate/${enrollment._id}`}
                                className="btn btn-warning btn-sm rounded-pill px-3 fw-semibold text-dark"
                                title="View Certificate"
                              >
                                <i className="bi bi-award-fill"></i> Cert
                              </Link>
                            )}

                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm rounded-pill px-2"
                              data-bs-toggle="modal"
                              data-bs-target="#studyModal"
                              onClick={() => setActiveEnrollment(enrollment)}
                              title="Curriculum Checklist"
                            >
                              <i className="bi bi-list-check"></i>
                            </button>

                            <Link
                              to={`/courses/${c._id}`}
                              className="btn btn-outline-secondary btn-sm rounded-pill px-2"
                              title="Course Details"
                            >
                              <i className="bi bi-info-circle"></i>
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

        {/* Interactive Course Study Room Modal */}
        <div
          className="modal fade"
          id="studyModal"
          tabIndex="-1"
          aria-labelledby="studyModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom p-4">
                <div>
                  <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-1 rounded-pill mb-1">
                    {activeEnrollment?.course?.category || 'Curriculum'}
                  </span>
                  <h5 className="modal-title fw-bold text-dark" id="studyModalLabel">
                    {activeEnrollment?.course?.title || 'Interactive Course Study Room'}
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body p-4 bg-light">
                {activeEnrollment && (
                  <div>
                    {/* Progress Summary Card */}
                    <div className="card border-0 rounded-3 p-3 bg-white shadow-sm mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold text-dark">Overall Completion Progress</span>
                        <span className="badge bg-primary fs-6">
                          {activeEnrollment.progress || 0}%
                        </span>
                      </div>
                      <div className="progress" style={{ height: '10px' }}>
                        <div
                          className="progress-bar bg-primary"
                          style={{ width: `${activeEnrollment.progress || 0}%` }}
                        ></div>
                      </div>
                      <small className="text-muted mt-2 d-block">
                        <i className="bi bi-check-circle me-1 text-success"></i>
                        Check off completed lessons below to automatically update your progress!
                      </small>
                    </div>

                    {/* Lesson checklist by weekly module */}
                    <h6 className="fw-bold text-dark mb-3">Weekly Syllabus Lessons</h6>
                    {activeEnrollment.course?.syllabus &&
                    activeEnrollment.course.syllabus.length > 0 ? (
                      activeEnrollment.course.syllabus.map((mod, mIdx) => (
                        <div className="card border-0 rounded-3 p-3 bg-white shadow-sm mb-3" key={mIdx}>
                          <h6 className="fw-bold text-primary mb-2">
                            Week {mod.week || mIdx + 1}: {mod.title}
                          </h6>
                          <div className="list-group list-group-flush">
                            {mod.lessons?.map((les, lIdx) => {
                              const isDone = activeEnrollment.completedLessons?.some(
                                (l) => l.lessonTitle === les.title
                              );

                              return (
                                <div
                                  key={lIdx}
                                  className="list-group-item d-flex align-items-center justify-content-between py-2 px-0 bg-transparent border-bottom"
                                >
                                  <div className="d-flex align-items-center gap-2">
                                    <input
                                      type="checkbox"
                                      className="form-check-input mt-0"
                                      checked={!!isDone}
                                      disabled={updating}
                                      onChange={() => handleToggleLesson(les.title)}
                                      id={`les-${mIdx}-${lIdx}`}
                                    />
                                    <label
                                      htmlFor={`les-${mIdx}-${lIdx}`}
                                      className={`small mb-0 user-select-none cursor-pointer ${
                                        isDone ? 'text-decoration-line-through text-muted' : 'text-dark'
                                      }`}
                                    >
                                      {les.title}
                                    </label>
                                  </div>
                                  <span className="badge bg-light text-muted border small">
                                    {les.duration || '15 mins'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-white rounded-3 text-center text-muted">
                        No syllabus items specified for this course.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer border-top p-3 bg-white">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  data-bs-dismiss="modal"
                >
                  Close Study Room
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCoursesPage;
