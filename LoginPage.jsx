import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email address and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);

      // Navigate according to previous intent or user role
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Autofill Helpers
  const fillStudentDemo = () => {
    setEmail('student@ocms.com');
    setPassword('Student@12345');
    setError('');
  };

  const fillAdminDemo = () => {
    setEmail('admin@ocms.com');
    setPassword('Admin@12345');
    setError('');
  };

  return (
    <div className="py-5 bg-light min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-4 mb-3 shadow-sm"
                  style={{ width: '56px', height: '56px', fontSize: '1.8rem' }}
                >
                  🎓
                </div>
                <h3 className="fw-bold text-dark mb-1">Welcome Back</h3>
                <p className="text-secondary small">Sign in to access your courses and learning progress</p>
              </div>

              {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}

              {/* Demo Credentials Quick-Select Pill Box */}
              <div className="p-3 bg-light rounded-3 border mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small fw-bold text-dark">
                    <i className="bi bi-magic me-1 text-primary"></i> Quick Demo Accounts:
                  </span>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary rounded-pill flex-fill"
                    onClick={fillStudentDemo}
                  >
                    Student Demo
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark rounded-pill flex-fill"
                    onClick={fillAdminDemo}
                  >
                    Admin Demo
                  </button>
                </div>
                <small className="text-muted d-block mt-2" style={{ fontSize: '0.75rem' }}>
                  Seed users (student@ocms.com / admin@ocms.com) initialized by <code>seed.js</code>.
                </small>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 ps-0 shadow-none"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between">
                    <label className="form-label small fw-semibold text-secondary">Password</label>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0 ps-0 shadow-none"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-custom w-100 py-2 shadow-sm mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <p className="text-center text-secondary small mb-0">
                  Don't have an account yet?{' '}
                  <Link to="/register" className="fw-semibold text-primary text-decoration-none">
                    Register here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
