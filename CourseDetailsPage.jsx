import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/courses/${id}`);
        if (res.data?.success) {
          setCourse(res.data.course);
        }

        // If user logged in, check enrollment
        if (isAuthenticated) {
          try {
            const checkRes = await axiosClient.get(`/enrollments/check/${id}`);
            if (checkRes.data?.isEnrolled) {
              setIsEnrolled(true);
            }
          } catch (err) {
            console.warn('Could not verify enrollment status:', err.message);
          }
        }
      } catch (err) {
        setError(err.message || 'Course not found');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, isAuthenticated]);

  const handleEnrollClick = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    if (isEnrolled) {
      navigate('/my-courses');
      return;
    }

    // If paid course, go to simulated payment page
    if (course.price > 0) {
      navigate(`/payment/${course._id}`);
      return;
    }

    // If free course, direct enrollment
    try {
      setEnrolling(true);
      setError('');
      const res = await axiosClient.post('/enrollments/enroll', { courseId: course._id });
      if (res.data?.success) {
        setIsEnrolled(true);
        setSuccess('Successfully registered for this course!');
        setTimeout(() => {
          navigate('/my-courses');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading course curriculum..." fullPage />;
  }

  if (error && !course) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger rounded-4 p-4 shadow-sm">
          <i className="bi bi-exclamation-triangle fs-1 d-block mb-2"></i>
          <h4>Course Not Found</h4>
          <p className="text-muted">{error}</p>
          <Link to="/courses" className="btn btn-primary rounded-pill px-4 mt-2">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const fallbackImg =
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';

  return (
    <div className="bg-light py-5 min-vh-100">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/courses">Courses</Link>
            </li>
            <li className="breadcrumb-item active text-truncate" aria-current="page" style={{ maxWidth: '300px' }}>
              {course.title}
            </li>
          </ol>
        </nav>

        {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="row g-4">
          {/* Main Content Column */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4">
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-2 rounded-pill">
                  {course.category}
                </span>
                <span className="badge bg-secondary-subtle text-dark fw-semibold px-3 py-2 rounded-pill">
                  {course.level}
                </span>
                {course.featured && (
                  <span className="badge bg-warning-subtle text-warning-emphasis fw-semibold px-3 py-2 rounded-pill">
                    ★ Featured
                  </span>
                )}
              </div>

              <h1 className="fw-extrabold text-dark mb-3">{course.title}</h1>

              <div className="d-flex flex-wrap align-items-center gap-4 text-secondary small mb-4 pb-3 border-bottom">
                <div>
                  <i className="bi bi-person-circle text-primary me-1"></i>
                  Instructor: <strong className="text-dark">{course.instructor}</strong>
                </div>
                <div>
                  <i className="bi bi-clock text-info me-1"></i>
                  Duration: <strong className="text-dark">{course.duration || '6 Weeks'}</strong>
                </div>
                <div>
                  <span className="text-warning">
                    <i className="bi bi-star-fill me-1"></i> {course.rating?.toFixed(1) || '4.8'}
                  </span>
                </div>
                <div>
                  <i className="bi bi-people text-success me-1"></i>
                  <strong>{course.enrolledCount || 0}</strong> Students Enrolled
                </div>
              </div>

              <h4 className="fw-bold text-dark mb-3">Course Overview</h4>
              <p className="text-secondary leading-relaxed mb-4" style={{ whiteSpace: 'pre-line' }}>
                {course.description}
              </p>

              {/* What You'll Learn Highlights */}
              <div className="card border-0 bg-light rounded-4 p-4 mb-4">
                <h5 className="fw-bold text-dark mb-3">
                  <i className="bi bi-check-circle-fill text-success me-2"></i> Key Takeaways
                </h5>
                <div className="row g-2">
                  <div className="col-md-6 d-flex align-items-start gap-2 small text-secondary">
                    <i className="bi bi-check text-primary fs-5"></i>
                    <span>Industry-relevant architectural patterns & best practices</span>
                  </div>
                  <div className="col-md-6 d-flex align-items-start gap-2 small text-secondary">
                    <i className="bi bi-check text-primary fs-5"></i>
                    <span>Hands-on portfolio assignments and real-world projects</span>
                  </div>
                  <div className="col-md-6 d-flex align-items-start gap-2 small text-secondary">
                    <i className="bi bi-check text-primary fs-5"></i>
                    <span>Comprehensive coverage of essential tooling & frameworks</span>
                  </div>
                  <div className="col-md-6 d-flex align-items-start gap-2 small text-secondary">
                    <i className="bi bi-check text-primary fs-5"></i>
                    <span>Continuous progress checkpoints and structured quizzes</span>
                  </div>
                </div>
              </div>

              {/* Syllabus / Curriculum Accordion */}
              <div className="mt-4">
                <h4 className="fw-bold text-dark mb-3">Curriculum & Syllabus</h4>
                {course.syllabus && course.syllabus.length > 0 ? (
                  <div className="accordion" id="syllabusAccordion">
                    {course.syllabus.map((module, idx) => (
                      <div className="accordion-item border rounded-3 mb-2 overflow-hidden" key={idx}>
                        <h2 className="accordion-header" id={`heading${idx}`}>
                          <button
                            className={`accordion-button ${idx !== 0 ? 'collapsed' : ''} fw-semibold`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse${idx}`}
                            aria-expanded={idx === 0 ? 'true' : 'false'}
                            aria-controls={`collapse${idx}`}
                          >
                            <span className="badge bg-primary me-3">Week {module.week || idx + 1}</span>
                            {module.title}
                          </button>
                        </h2>
                        <div
                          id={`collapse${idx}`}
                          className={`accordion-collapse collapse ${idx === 0 ? 'show' : ''}`}
                          aria-labelledby={`heading${idx}`}
                          data-bs-parent="#syllabusAccordion"
                        >
                          <div className="accordion-body bg-light">
                            {module.description && (
                              <p className="text-secondary small mb-3">{module.description}</p>
                            )}
                            {module.lessons && module.lessons.length > 0 ? (
                              <ul className="list-group list-group-flush rounded-3">
                                {module.lessons.map((lesson, lIdx) => (
                                  <li
                                    key={lIdx}
                                    className="list-group-item d-flex justify-content-between align-items-center bg-white"
                                  >
                                    <div className="d-flex align-items-center gap-2 small">
                                      <i className="bi bi-play-circle text-primary"></i>
                                      <span>{lesson.title}</span>
                                    </div>
                                    <span className="badge bg-light text-muted border">
                                      {lesson.duration || '15 mins'}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted small mb-0">Module lessons included with enrollment.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-light rounded-3 text-secondary text-center small">
                    Complete modular syllabus provided upon registration.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar Column */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden sticky-top" style={{ top: '100px' }}>
              <div style={{ height: '220px', overflow: 'hidden' }}>
                <img
                  src={course.thumbnail || fallbackImg}
                  alt={course.title}
                  className="w-100 h-100 object-fit-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackImg;
                  }}
                />
              </div>

              <div className="card-body p-4 bg-white">
                <div className="d-flex align-items-baseline justify-content-between mb-3">
                  <div>
                    <span className="text-muted small d-block">Course Tuition</span>
                    <h2 className="fw-bold text-primary mb-0">
                      {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                    </h2>
                  </div>
                  <span className="badge bg-info-subtle text-info fw-semibold px-3 py-1 rounded-pill">
                    {course.level}
                  </span>
                </div>

                {/* Enrollment Action Button */}
                {isEnrolled ? (
                  <div className="d-grid gap-2 mb-3">
                    <Link to="/my-courses" className="btn btn-success btn-lg rounded-3 fw-bold">
                      <i className="bi bi-check-circle-fill me-2"></i> Access My Course
                    </Link>
                  </div>
                ) : (
                  <div className="d-grid gap-2 mb-3">
                    <button
                      className="btn btn-primary-custom btn-lg shadow-sm"
                      onClick={handleEnrollClick}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Enrolling...
                        </>
                      ) : course.price === 0 ? (
                        'Enroll Now (Free)'
                      ) : (
                        'Enroll & Simulate Checkout'
                      )}
                    </button>
                  </div>
                )}

                {/* Simulated Payment Notice */}
                <div className="simulated-badge w-100 justify-content-center text-center mb-3">
                  <i className="bi bi-shield-lock-fill"></i>
                  <span>Test Mode: Simulated Checkout</span>
                </div>

                {/* Feature Inclusions List */}
                <h6 className="fw-bold text-dark small text-uppercase mb-3">This course includes:</h6>
                <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary mb-0">
                  <li className="d-flex align-items-center gap-2">
                    <i className="bi bi-infinity text-primary"></i> Full lifetime course access
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <i className="bi bi-phone text-primary"></i> Accessible on desktop and mobile
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <i className="bi bi-award text-primary"></i> Certificate of course completion
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <i className="bi bi-receipt text-primary"></i> Simulated transaction receipt
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
