import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

const PaymentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Mock Card Form State
  const [cardName, setCardName] = useState(user?.name || 'Alex Johnson');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('789');
  const [paymentMethod, setPaymentMethod] = useState('simulated_card');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/courses/${courseId}`);
        if (res.data?.success) {
          setCourse(res.data.course);
        }
      } catch (err) {
        setError(err.message || 'Course not found for checkout');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleSimulatedPayment = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setProcessing(true);
      const res = await axiosClient.post('/payments/simulate', {
        courseId,
        paymentMethod,
        cardNumber: cardNumber.replace(/\s+/g, ''),
      });

      if (res.data?.success && res.data.payment) {
        // Navigate to receipt page
        navigate(`/payment/success/${res.data.payment._id}`);
      } else {
        throw new Error(res.data?.message || 'Payment simulation failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to complete simulated payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Preparing secure checkout simulation..." fullPage />;
  }

  if (error && !course) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger rounded-4 p-4 shadow-sm">
          <h4>Checkout Error</h4>
          <p className="text-secondary">{error}</p>
          <Link to="/courses" className="btn btn-primary rounded-pill px-4 mt-2">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Top Disclaimer Banner */}
        <div className="alert alert-warning border-warning shadow-sm rounded-4 p-3 mb-4 d-flex align-items-center gap-3">
          <i className="bi bi-shield-exclamation text-warning fs-3 flex-shrink-0"></i>
          <div>
            <strong className="d-block text-dark">
              Simulation Sandbox Mode Active
            </strong>
            <small className="text-secondary">
              This checkout is strictly for simulation and testing purposes. <strong>No real money is charged</strong> and no real credit card numbers are processed or stored.
            </small>
          </div>
        </div>

        {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}

        <div className="row g-4">
          {/* Payment Form Column */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <h4 className="fw-bold text-dark mb-0">Simulated Payment Details</h4>
                <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold">
                  Step 2 of 2
                </span>
              </div>

              <form onSubmit={handleSimulatedPayment}>
                {/* Payment Method Selector */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary mb-2">
                    Select Test Payment Method
                  </label>
                  <div className="row g-2">
                    <div className="col-6">
                      <div
                        className={`p-3 border rounded-3 text-center cursor-pointer ${
                          paymentMethod === 'simulated_card'
                            ? 'border-primary bg-primary-subtle text-primary fw-bold'
                            : 'bg-light text-secondary'
                        }`}
                        onClick={() => setPaymentMethod('simulated_card')}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="bi bi-credit-card-2-front fs-4 d-block mb-1"></i>
                        <span className="small">Simulated Card</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div
                        className={`p-3 border rounded-3 text-center cursor-pointer ${
                          paymentMethod === 'test_paypal'
                            ? 'border-primary bg-primary-subtle text-primary fw-bold'
                            : 'bg-light text-secondary'
                        }`}
                        onClick={() => setPaymentMethod('test_paypal')}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="bi bi-wallet2 fs-4 d-block mb-1"></i>
                        <span className="small">Sandbox Wallet</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Cardholder Name</label>
                  <input
                    type="text"
                    className="form-control shadow-none"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>

                {/* Mock Card Number */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Mock Card Number (Pre-filled for Testing)
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control shadow-none font-monospace"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                    />
                    <span className="input-group-text bg-white text-muted">
                      <i className="bi bi-credit-card"></i>
                    </span>
                  </div>
                </div>

                {/* Expiry & CVC */}
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-secondary">Expiry Date</label>
                    <input
                      type="text"
                      className="form-control shadow-none font-monospace"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-secondary">CVC / CVV</label>
                    <input
                      type="text"
                      className="form-control shadow-none font-monospace"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Submit simulated checkout */}
                <button
                  type="submit"
                  className="btn btn-primary-custom w-100 py-3 shadow-sm fw-bold mb-3"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Simulating Transaction...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lock-fill me-2"></i>
                      Confirm Simulated Enrollment (${course.price.toFixed(2)})
                    </>
                  )}
                </button>

                <p className="text-center small text-muted mb-0">
                  <i className="bi bi-shield-check text-success me-1"></i> Instant registration upon mock confirmation
                </p>
              </form>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3">Order Summary</h5>

              <div className="d-flex gap-3 mb-4 pb-3 border-bottom">
                <img
                  src={
                    course.thumbnail ||
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
                  }
                  alt={course.title}
                  className="rounded-3 object-fit-cover"
                  style={{ width: '80px', height: '80px' }}
                />
                <div>
                  <span className="badge bg-primary-subtle text-primary small mb-1">
                    {course.category}
                  </span>
                  <h6 className="fw-bold text-dark mb-1 text-truncate-2">{course.title}</h6>
                  <small className="text-muted">Instructor: {course.instructor}</small>
                </div>
              </div>

              <div className="d-flex justify-content-between text-secondary small mb-2">
                <span>Course Price</span>
                <span className="text-dark fw-semibold">${course.price.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary small mb-2">
                <span>Sandbox Taxes & Fees</span>
                <span className="text-success fw-semibold">$0.00 (Test Mode)</span>
              </div>

              <hr className="my-3" />

              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fw-bold text-dark fs-5">Total Due:</span>
                <span className="fw-extrabold text-primary fs-3">
                  ${course.price.toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-light rounded-3 small text-secondary">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span>Full Course Curriculum Unlocked</span>
                </div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span>Self-Paced Progress & Quizzes</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span>Official Certificate of Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
