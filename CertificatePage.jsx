import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';

const CertificatePage = () => {
  const { enrollmentId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/enrollments/${enrollmentId}/certificate`);
        if (res.data?.success) {
          setCert(res.data.certificate);
        }
      } catch (err) {
        setError(err.message || 'Could not retrieve certificate. Complete the course curriculum to unlock.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [enrollmentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner message="Generating official certificate of completion..." fullPage />;
  }

  if (error || !cert) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning rounded-4 p-4 shadow-sm max-w-600 mx-auto" style={{ maxWidth: '600px' }}>
          <i className="bi bi-lock-fill fs-1 text-warning mb-2 d-block"></i>
          <h4 className="fw-bold text-dark">Certificate Locked</h4>
          <p className="text-secondary small mb-3">{error}</p>
          <Link to={`/classroom/${enrollmentId}`} className="btn btn-primary rounded-pill px-4">
            Go to Classroom to Complete Lectures & Exam
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Print / Action Controls */}
        <div className="d-flex justify-content-between align-items-center mb-4 no-print">
          <Link to={`/classroom/${enrollmentId}`} className="btn btn-outline-secondary rounded-pill px-4">
            <i className="bi bi-arrow-left me-1"></i> Back to Classroom
          </Link>
          <button onClick={handlePrint} className="btn btn-primary-custom rounded-pill px-4 shadow-sm">
            <i className="bi bi-printer me-2"></i> Print / Download PDF
          </button>
        </div>

        {/* Certificate Canvas / Card */}
        <div
          className="card border-0 shadow-lg mx-auto bg-white p-4 p-md-5 position-relative"
          style={{
            maxWidth: '920px',
            border: '12px solid #e2e8f0',
            borderRadius: '16px',
            background: 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          {/* Ornamental Inner Border */}
          <div
            className="p-4 p-md-5 position-relative"
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
            }}
          >
            {/* Top Certificate Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-warning text-white rounded-circle shadow-sm mb-3"
                style={{ width: '70px', height: '70px', fontSize: '2rem' }}
              >
                🎓
              </div>
              <h6 className="text-uppercase fw-bold letter-spacing-2 text-primary mb-1">
                Online Course Management System
              </h6>
              <h1
                className="display-5 fw-extrabold text-dark tracking-tight mb-0"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Certificate of Completion
              </h1>
              <p className="text-muted small text-uppercase fw-semibold mt-1">
                Verified Academic Achievement
              </p>
            </div>

            {/* Recipient */}
            <div className="text-center my-4 py-2">
              <span className="text-muted small text-uppercase d-block mb-1">
                This is proudly presented to
              </span>
              <h2
                className="display-6 fw-bold text-dark border-bottom pb-2 d-inline-block px-5"
                style={{ fontFamily: 'Georgia, serif', color: '#1e293b' }}
              >
                {cert.studentName}
              </h2>
            </div>

            {/* Description */}
            <div className="text-center mb-4 mx-auto" style={{ maxWidth: '640px' }}>
              <p className="text-secondary leading-relaxed mb-1">
                For successfully completing all video modules, practical project assignments,
                and achieving a passing grade on the final certification exam for the program:
              </p>
              <h4 className="fw-bold text-primary my-2">{cert.courseTitle}</h4>
              <span className="badge bg-light text-dark border px-3 py-1 small">
                {cert.category} Specialized Curriculum
              </span>
            </div>

            {/* Footer Signatures & Metadata */}
            <div className="row align-items-end mt-5 pt-4 border-top g-4">
              <div className="col-sm-4 text-center text-sm-start">
                <span className="small text-muted d-block">Issued On:</span>
                <strong className="text-dark">
                  {new Date(cert.issuedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </strong>
                <small className="d-block text-muted font-monospace mt-1" style={{ fontSize: '0.75rem' }}>
                  ID: {cert.certificateId}
                </small>
              </div>

              <div className="col-sm-4 text-center">
                <div
                  className="rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center p-2 mb-1"
                  style={{ width: '56px', height: '56px' }}
                >
                  <i className="bi bi-patch-check-fill fs-2"></i>
                </div>
                <small className="d-block fw-bold text-success" style={{ fontSize: '0.8rem' }}>
                  OFFICIALLY VERIFIED
                </small>
              </div>

              <div className="col-sm-4 text-center text-sm-end">
                <div
                  className="fw-bold fs-4 mb-0 text-dark"
                  style={{ fontFamily: 'Brush Script MT, cursive, serif' }}
                >
                  {cert.instructor}
                </div>
                <div className="border-top pt-1 mt-1">
                  <small className="text-muted d-block">Lead Course Instructor</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
