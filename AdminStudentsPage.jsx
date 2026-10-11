import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/admin/students');
        if (res.data?.success) {
          setStudents(res.data.students || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="fw-bold text-dark mb-1">Registered Students</h1>
            <p className="text-secondary mb-0">
              Directory of all student learner accounts and their course participation.
            </p>
          </div>
          <div style={{ maxWidth: '300px' }} className="w-100">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0 shadow-none"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}

        {/* Table Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold text-dark mb-0">Student Directory ({students.length})</h5>
            <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold">
              {filteredStudents.length} Matching
            </span>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading registered students..." />
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-5">
              <div className="fs-1 text-muted mb-2">👥</div>
              <h5 className="text-dark fw-bold">No Students Found</h5>
              <p className="text-secondary small">
                {search ? 'Try clearing your search keyword.' : 'No student accounts registered yet.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive custom-table">
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Registered Date</th>
                    <th>Courses Enrolled</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                          >
                            {s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <strong className="text-dark d-block">{s.name}</strong>
                            <small className="text-muted">{s.bio ? s.bio.slice(0, 30) + '...' : 'Student'}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary small font-monospace">{s.email}</td>
                      <td className="text-secondary small">{s.phone || '—'}</td>
                      <td className="text-secondary small">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary fs-6 px-3 py-1 rounded-pill">
                          {s.enrollmentCount || 0}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-success-subtle text-success">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStudentsPage;
