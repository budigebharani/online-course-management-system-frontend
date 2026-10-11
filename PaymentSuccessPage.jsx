import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';

const PaymentSuccessPage = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/payments/${id}`);
        if (res.data?.success) {
          setPayment(res.data.payment);
        }
      } catch (err) {
        setError(err.message || 'Could not load payment receipt');
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Generating your simulated payment receipt..." fullPage />;
  }

  return (
    <div className="py-5 bg-light min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white text-center">
              {/* Success Icon */}
              <div
                className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow"
                style={{ width: '76px', height: '76px', fontSize: '2.5rem' }}
              >
                <i className="bi bi-check2"></i>
              </div>

              <span className="badge bg-success-subtle text-success fw-bold px-3 py-2 rounded-pill mb-2">
                Simulated Payment Confirmed
              </span>
              <h2 className="fw-bold text-dark mb-2">Enrollment Successful!</h2>
              <p className="text-secondary small mb-4">
                Thank you! Your simulated test payment has been processed and your course is now unlocked.
              </p>

              {payment ? (
                <div className="card border rounded-4 p-4 text-start bg-light mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span className="small text-muted text-uppercase fw-bold">Official Sandbox Receipt</span>
                    <span className="badge bg-warning text-dark small fw-semibold">
                      Demo Mode Only
                    </span>
                  </div>

                  <div className="row g-3 small">
                    <div className="col-sm-6">
                      <span className="text-muted d-block">Transaction ID:</span>
                      <strong className="text-dark font-monospace">{payment.transactionId}</strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted d-block">Date & Time:</span>
                      <strong className="text-dark">
                        {new Date(payment.createdAt || Date.now()).toLocaleString()}
                      </strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted d-block">Course Enrolled:</span>
                      <strong className="text-dark">{payment.course?.title || 'Selected Course'}</strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted d-block">Amount Recorded:</span>
                      <strong className="text-success fs-6">${payment.amount?.toFixed(2)}</strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted d-block">Payment Method:</span>
                      <strong className="text-dark">
                        Simulated Card (ending in {payment.cardLast4 || '4242'})
                      </strong>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted d-block">Enrollment Status:</span>
                      <span className="badge bg-success">Active & Enrolled</span>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-warning small mb-4">{error}</div>
              ) : null}

              {/* Action Buttons */}
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link to="/my-courses" className="btn btn-primary-custom px-4 shadow-sm">
                  <i className="bi bi-play-circle me-1"></i> Start Learning Now
                </Link>
                <Link to="/dashboard" className="btn btn-outline-secondary rounded-pill px-4">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
