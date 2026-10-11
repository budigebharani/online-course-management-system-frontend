import React from 'react';

const AlertMessage = ({ type = 'danger', message, onClose }) => {
  if (!message) return null;

  const iconClass =
    type === 'success'
      ? 'bi-check-circle-fill'
      : type === 'warning'
      ? 'bi-exclamation-triangle-fill'
      : type === 'info'
      ? 'bi-info-circle-fill'
      : 'bi-exclamation-octagon-fill';

  return (
    <div
      className={`alert alert-${type} alert-dismissible fade show d-flex align-items-center gap-2 rounded-3 shadow-sm my-3`}
      role="alert"
    >
      <i className={`bi ${iconClass} fs-5 flex-shrink-0`}></i>
      <div className="flex-grow-1">{message}</div>
      {onClose && (
        <button
          type="button"
          className="btn-close shadow-none"
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
};

export default AlertMessage;
