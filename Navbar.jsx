import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top py-3">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div
            className="d-flex align-items-center justify-content-center bg-primary text-white rounded-3 shadow-sm"
            style={{ width: '38px', height: '38px', fontSize: '1.2rem' }}
          >
            🎓
          </div>
          <div>
            <span className="brand-gradient fs-4 fw-bold">OCMS</span>
            <span className="text-secondary small d-none d-sm-inline ms-1 fw-semibold">
              Course Portal
            </span>
          </div>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#ocmsNavbar"
          aria-controls="ocmsNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Content */}
        <div className="collapse navbar-collapse" id="ocmsNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-1">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-semibold' : 'text-secondary'}`
                }
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/courses"
                className={({ isActive }) =>
                  `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-semibold' : 'text-secondary'}`
                }
              >
                Explore Courses
              </NavLink>
            </li>

            {/* Student Links */}
            {isAuthenticated && !isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-semibold' : 'text-secondary'}`
                    }
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/my-courses"
                    className={({ isActive }) =>
                      `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-semibold' : 'text-secondary'}`
                    }
                  >
                    My Courses
                  </NavLink>
                </li>
              </>
            )}

            {/* Admin Links */}
            {isAuthenticated && isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-semibold' : 'text-secondary'}`
                    }
                  >
                    <i className="bi bi-speedometer2 me-1"></i> Admin Console
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/admin/courses"
                    className={({ isActive }) =>
                      `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-semibold' : 'text-secondary'}`
                    }
                  >
                    Manage Courses
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/admin/students"
                    className={({ isActive }) =>
                      `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-semibold' : 'text-secondary'}`
                    }
                  >
                    Students
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/admin/enrollments"
                    className={({ isActive }) =>
                      `nav-link px-3 fw-medium ${isActive ? 'text-primary fw-semibold' : 'text-secondary'}`
                    }
                  >
                    Enrollments
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* Right side Auth Controls */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-light border d-flex align-items-center gap-2 rounded-pill px-3 py-2 shadow-sm dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="fw-semibold text-truncate" style={{ maxWidth: '120px' }}>
                    {user?.name || 'User'}
                  </span>
                  <span
                    className={`badge rounded-pill ${
                      isAdmin ? 'bg-danger' : 'bg-primary-subtle text-primary'
                    } ms-1`}
                  >
                    {isAdmin ? 'Admin' : 'Student'}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3 p-2">
                  <li className="px-3 py-2 border-bottom mb-1">
                    <p className="mb-0 fw-semibold text-dark">{user?.name}</p>
                    <small className="text-muted">{user?.email}</small>
                  </li>
                  {isAdmin ? (
                    <li>
                      <Link className="dropdown-item rounded-2 py-2" to="/admin/dashboard">
                        <i className="bi bi-speedometer2 me-2 text-primary"></i> Admin Dashboard
                      </Link>
                    </li>
                  ) : (
                    <li>
                      <Link className="dropdown-item rounded-2 py-2" to="/dashboard">
                        <i className="bi bi-person-workspace me-2 text-primary"></i> Student Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link className="dropdown-item rounded-2 py-2" to="/profile">
                      <i className="bi bi-person-gear me-2 text-info"></i> Profile & Settings
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider my-1" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item rounded-2 py-2 text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-secondary rounded-pill px-4 fw-medium">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary-custom shadow-sm">
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
