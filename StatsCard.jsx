import React from 'react';

const StatsCard = ({ title, value, icon, bgClass = 'bg-primary-subtle', textClass = 'text-primary', subtitle }) => {
  return (
    <div className="card border-0 shadow-sm rounded-4 h-100 p-3 stat-card">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <span className="text-muted small text-uppercase fw-semibold">{title}</span>
          <h2 className="fw-bold mb-1 mt-2 text-dark">{value}</h2>
          {subtitle && <span className="small text-muted">{subtitle}</span>}
        </div>
        <div className={`stat-icon-wrapper ${bgClass} ${textClass}`}>
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
