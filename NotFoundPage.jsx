import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="py-5 bg-light min-vh-100 d-flex align-items-center">
      <div className="container text-center">
        <div className="card border-0 shadow-sm rounded-4 p-5 bg-white max-w-600 mx-auto" style={{ maxWidth: '520px' }}>
          <div className="display-1 fw-extrabold text-primary mb-2">404</div>
          <h3 className="fw-bold text-dark mb-2">Page Not Found</h3>
          <p className="text-secondary small mb-4">
            The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>
          <div>
            <Link to="/" className="btn btn-primary-custom px-4 rounded-pill">
              <i className="bi bi-house-door me-1"></i> Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
