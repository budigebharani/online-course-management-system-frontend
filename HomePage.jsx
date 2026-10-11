import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axiosClient.get('/courses/featured');
        if (res.data?.success) {
          setFeaturedCourses(res.data.courses || []);
        }
      } catch (err) {
        console.warn('Could not fetch featured courses from API:', err.message);
        setError('Could not connect to the backend server. Please verify backend is running on port 5000.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient py-5 border-bottom">
        <div className="container py-lg-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold mb-3">
                <i className="bi bi-stars me-1"></i> Full-Stack Course Management Platform
              </span>
              <h1 className="display-4 fw-extrabold text-dark tracking-tight mb-4">
                Accelerate Your Tech Career With <span className="brand-gradient">Expert-Led</span> Courses
              </h1>
              <p className="lead text-secondary mb-4 pe-lg-5">
                Join our comprehensive Online Course Management System. Browse cutting-edge programs
                in Web Development, Cloud Computing, AI, and Cybersecurity with simulated checkout
                and interactive syllabus tracking.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/courses" className="btn btn-primary-custom btn-lg shadow">
                  <i className="bi bi-compass me-2"></i> Browse All Courses
                </Link>
                <Link to="/register" className="btn btn-outline-dark btn-lg rounded-3 px-4">
                  Get Started Free
                </Link>
              </div>

              {/* Quick Feature Badges */}
              <div className="row g-3 mt-4 pt-3 border-top">
                <div className="col-sm-4 d-flex align-items-center gap-2 text-secondary small">
                  <i className="bi bi-check-circle-fill text-success fs-5"></i>
                  <span>Lifetime Access</span>
                </div>
                <div className="col-sm-4 d-flex align-items-center gap-2 text-secondary small">
                  <i className="bi bi-shield-check text-primary fs-5"></i>
                  <span>Simulated Payments</span>
                </div>
                <div className="col-sm-4 d-flex align-items-center gap-2 text-secondary small">
                  <i className="bi bi-graph-up text-info fs-5"></i>
                  <span>Progress Tracking</span>
                </div>
              </div>
            </div>

            <div className="col-lg-5 text-center">
              <div className="position-relative mx-auto" style={{ maxWidth: '440px' }}>
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80"
                    alt="Students collaborating"
                    className="img-fluid"
                    style={{ height: '320px', objectFit: 'cover' }}
                  />
                  <div className="card-body p-4 text-start bg-white">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge bg-success-subtle text-success fw-bold px-3 py-1 rounded-pill">
                        Live Learning
                      </span>
                      <small className="text-muted">4.9 ★ Rating</small>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">
                      Full-Stack Web Development Bootcamp
                    </h6>
                    <p className="text-secondary small mb-0">
                      Learn MERN stack, APIs, and modern DevOps tools.
                    </p>
                  </div>
                </div>

                {/* Floating Metric Pill */}
                <div
                  className="position-absolute bottom-0 start-0 translate-middle-y bg-white rounded-4 shadow-lg p-3 d-flex align-items-center gap-3 border"
                  style={{ zIndex: 2 }}
                >
                  <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-mortarboard-fill"></i>
                  </div>
                  <div className="text-start">
                    <span className="d-block fw-bold text-dark mb-0">1,400+</span>
                    <small className="text-muted">Active Students</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-5">
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small letter-spacing-1">
                Curated For You
              </span>
              <h2 className="fw-bold text-dark mt-1">Featured Courses</h2>
              <p className="text-secondary mb-0">
                Hand-picked technical masterclasses taught by senior industry engineers.
              </p>
            </div>
            <Link to="/courses" className="btn btn-outline-primary rounded-pill px-4 mt-3 mt-md-0">
              View All Courses <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading featured courses..." />
          ) : error ? (
            <div className="alert alert-warning rounded-3 shadow-sm p-4">
              <h5 className="alert-heading fw-bold">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> Backend Connection Note
              </h5>
              <p className="mb-2">{error}</p>
              <hr />
              <p className="mb-0 small text-muted">
                Make sure you have started the backend with <code>npm run dev</code> or <code>npm start</code> in the backend directory.
              </p>
            </div>
          ) : featuredCourses.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border">
              <div className="fs-1 text-muted mb-2">📚</div>
              <h5 className="fw-bold text-dark">No Featured Courses Yet</h5>
              <p className="text-secondary small mb-3">
                Run the backend seed script (<code>node seed.js</code>) to populate initial courses!
              </p>
              <Link to="/courses" className="btn btn-primary rounded-pill px-4">
                Explore Catalog
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {featuredCourses.map((course) => (
                <div key={course._id} className="col-lg-4 col-md-6">
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose OCMS Section */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container py-4">
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="text-primary fw-bold text-uppercase small">Platform Architecture</span>
            <h2 className="fw-bold text-dark mt-1">Why Learn With OCMS?</h2>
            <p className="text-secondary">
              Engineered with full-stack best practices, role-based protection, and simulated payments.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-light">
                <div
                  className="bg-primary text-white rounded-4 d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '60px', height: '60px', fontSize: '1.6rem' }}
                >
                  <i className="bi bi-laptop"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Structured Syllabi</h5>
                <p className="text-secondary small mb-0">
                  Every course is broken down into weekly modules with clear lessons and duration estimates.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-light">
                <div
                  className="bg-info text-white rounded-4 d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '60px', height: '60px', fontSize: '1.6rem' }}
                >
                  <i className="bi bi-credit-card-2-front"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Simulated Checkout</h5>
                <p className="text-secondary small mb-0">
                  Test the complete payment flow safely in sandbox mode without entering real financial data.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-light">
                <div
                  className="bg-success text-white rounded-4 d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '60px', height: '60px', fontSize: '1.6rem' }}
                >
                  <i className="bi bi-bar-chart-steps"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Dynamic Student Dashboard</h5>
                <p className="text-secondary small mb-0">
                  Track ongoing courses, completed lectures, and instant transaction receipts in one central portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-5 bg-primary text-white">
        <div className="container py-4 text-center">
          <h2 className="fw-bold mb-3">Ready to Start Learning?</h2>
          <p className="lead mb-4 text-white-50 mx-auto" style={{ maxWidth: '600px' }}>
            Register your student account now and explore courses with full access to enrollment simulation.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn btn-light btn-lg text-primary fw-bold px-4 rounded-pill shadow">
              Create Free Account
            </Link>
            <Link to="/courses" className="btn btn-outline-light btn-lg px-4 rounded-pill">
              Browse All Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
