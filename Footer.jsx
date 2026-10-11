import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-custom pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="fs-3">🎓</span>
              <span className="fs-4 fw-bold text-white">OCMS</span>
            </div>
            <p className="text-secondary small pe-lg-4">
              Online Course Management System is a full-stack platform designed to manage courses,
              facilitate student registrations, track learning progress, and simulate secure payments.
            </p>
            <div className="d-flex gap-3 mt-3">
              <span className="badge bg-secondary-subtle text-light px-3 py-2">
                <i className="bi bi-shield-check me-1 text-success"></i> JWT Auth
              </span>
              <span className="badge bg-secondary-subtle text-light px-3 py-2">
                <i className="bi bi-database me-1 text-info"></i> MongoDB Atlas
              </span>
              <span className="badge bg-secondary-subtle text-light px-3 py-2">
                <i className="bi bi-credit-card me-1 text-warning"></i> Sandbox Pay
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3">Platform</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/courses">Browse Catalog</Link>
              </li>
              <li>
                <Link to="/register">Create Account</Link>
              </li>
              <li>
                <Link to="/login">Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3">Popular Categories</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <Link to="/courses?category=Web+Development">Web Development</Link>
              </li>
              <li>
                <Link to="/courses?category=Data+Science">Data Science & AI</Link>
              </li>
              <li>
                <Link to="/courses?category=Cloud+Computing">Cloud Architecture</Link>
              </li>
              <li>
                <Link to="/courses?category=Cybersecurity">Cybersecurity</Link>
              </li>
            </ul>
          </div>

          {/* Demonstration Notice */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">System Information</h6>
            <p className="small text-secondary mb-2">
              <i className="bi bi-info-circle me-1 text-primary"></i>
              <strong>Test Mode Simulation:</strong> All checkout and payment operations in this
              system are simulated for academic and demonstration purposes. No real money or credit cards are charged.
            </p>
            <p className="small text-secondary">
              <i className="bi bi-code-slash me-1 text-info"></i>
              Stack: React 18, Vite, Node.js, Express, MongoDB Atlas, Bootstrap 5.
            </p>
          </div>
        </div>

        <hr className="border-secondary opacity-25 my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-secondary small">
          <div>
            &copy; {new Date().getFullYear()} Online Course Management System (OCMS). All rights reserved.
          </div>
          <div className="d-flex gap-3">
            <span>Built for paired full-stack learning</span>
            <span>&bull;</span>
            <span>REST API Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
