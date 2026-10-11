import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, isEnrolled = false }) => {
  const {
    _id,
    title,
    instructor,
    category,
    price,
    thumbnail,
    level,
    duration,
    rating = 4.8,
    enrolledCount = 0,
  } = course;

  const fallbackImg =
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';

  return (
    <div className="card h-100 course-card">
      <div className="course-card-img-wrapper">
        <img
          src={thumbnail || fallbackImg}
          alt={title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImg;
          }}
        />
        <span className="badge-category">{category}</span>
        <span className="badge-level">{level}</span>
      </div>

      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex align-items-center justify-content-between text-muted small mb-2">
          <span>
            <i className="bi bi-clock me-1"></i> {duration || '6 Weeks'}
          </span>
          <span className="text-warning fw-semibold">
            <i className="bi bi-star-fill me-1"></i> {rating.toFixed(1)}
          </span>
        </div>

        <h5 className="card-title fw-bold text-dark mb-2 text-truncate-2" title={title}>
          <Link to={`/courses/${_id}`} className="text-decoration-none text-dark hover-primary">
            {title}
          </Link>
        </h5>

        <p className="card-text text-secondary small mb-3">
          <i className="bi bi-person-circle me-1 text-primary"></i> By {instructor}
        </p>

        <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
          <div>
            <span className="text-muted small d-block">Price</span>
            <span className="fs-5 fw-bold text-primary">
              {price === 0 ? 'Free' : `$${price.toFixed(2)}`}
            </span>
          </div>

          <div className="d-flex gap-2">
            {isEnrolled ? (
              <Link to="/my-courses" className="btn btn-sm btn-success rounded-pill px-3">
                <i className="bi bi-check2-circle me-1"></i> Enrolled
              </Link>
            ) : (
              <Link
                to={`/courses/${_id}`}
                className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold"
              >
                View Details
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
