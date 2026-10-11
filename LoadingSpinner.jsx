import React from 'react';

const LoadingSpinner = ({ message = 'Loading content...', fullPage = false }) => {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center p-5 ${
        fullPage ? 'min-vh-50' : 'py-5'
      }`}
    >
      <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-secondary fw-medium mb-0">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
