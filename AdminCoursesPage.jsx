import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Course Form State (for both Add and Edit)
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const initialFormState = {
    title: '',
    category: 'Web Development',
    instructor: '',
    price: '',
    level: 'Beginner',
    duration: '6 Weeks',
    thumbnail: '',
    featured: false,
    description: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/courses');
      if (res.data?.success) {
        setCourses(res.data.courses || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedCourseId(null);
    setFormData(initialFormState);
    setError('');
  };

  const handleOpenEdit = (course) => {
    setModalMode('edit');
    setSelectedCourseId(course._id);
    setFormData({
      title: course.title || '',
      category: course.category || 'Web Development',
      instructor: course.instructor || '',
      price: course.price !== undefined ? course.price : '',
      level: course.level || 'Beginner',
      duration: course.duration || '6 Weeks',
      thumbnail: course.thumbnail || '',
      featured: Boolean(course.featured),
      description: course.description || '',
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.category || !formData.instructor || formData.price === '') {
      setError('Please fill in all required fields (Title, Category, Instructor, Price)');
      return;
    }

    try {
      setActionLoading(true);
      if (modalMode === 'add') {
        const res = await axiosClient.post('/courses', formData);
        if (res.data?.success) {
          setSuccess(`Course "${formData.title}" added successfully!`);
          fetchCourses();
          // Close modal programmatically via standard Bootstrap trigger
          const closeBtn = document.getElementById('closeCourseModalBtn');
          if (closeBtn) closeBtn.click();
        }
      } else {
        const res = await axiosClient.put(`/courses/${selectedCourseId}`, formData);
        if (res.data?.success) {
          setSuccess(`Course "${formData.title}" updated successfully!`);
          fetchCourses();
          const closeBtn = document.getElementById('closeCourseModalBtn');
          if (closeBtn) closeBtn.click();
        }
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${courseTitle}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await axiosClient.delete(`/courses/${courseId}`);
      if (res.data?.success) {
        setSuccess(`Course "${courseTitle}" deleted successfully`);
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
      }
    } catch (err) {
      setError(err.message || 'Failed to delete course');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="fw-bold text-dark mb-1">Course Management</h1>
            <p className="text-secondary mb-0">
              Create, update, and manage instructional courses across all categories.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary-custom shadow-sm"
            data-bs-toggle="modal"
            data-bs-target="#courseFormModal"
            onClick={handleOpenAdd}
          >
            <i className="bi bi-plus-lg me-1"></i> Add New Course
          </button>
        </div>

        {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Courses Table Card */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold text-dark mb-0">All Catalog Courses ({courses.length})</h5>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading course catalog..." />
          ) : courses.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-dark fw-bold">No Courses Found</h5>
              <p className="text-secondary small">Add your first course to populate the catalog.</p>
            </div>
          ) : (
            <div className="table-responsive custom-table">
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Course Info</th>
                    <th>Category</th>
                    <th>Instructor</th>
                    <th>Price</th>
                    <th>Level</th>
                    <th>Students</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={
                              c.thumbnail ||
                              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
                            }
                            alt={c.title}
                            className="rounded-3 object-fit-cover flex-shrink-0"
                            style={{ width: '48px', height: '48px' }}
                          />
                          <div>
                            <span className="fw-bold text-dark d-block text-truncate" style={{ maxWidth: '240px' }}>
                              {c.title}
                            </span>
                            {c.featured && (
                              <span className="badge bg-warning-subtle text-warning-emphasis small py-0 px-2">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{c.category}</span>
                      </td>
                      <td className="text-secondary small">{c.instructor}</td>
                      <td className="fw-bold text-primary">
                        {c.price === 0 ? 'Free' : `$${c.price.toFixed(2)}`}
                      </td>
                      <td>
                        <span className="badge bg-info-subtle text-info">{c.level}</span>
                      </td>
                      <td className="fw-semibold text-dark">{c.enrolledCount || 0}</td>
                      <td className="text-end">
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#courseFormModal"
                            onClick={() => handleOpenEdit(c)}
                            title="Edit Course"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(c._id, c.title)}
                            disabled={actionLoading}
                            title="Delete Course"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add / Edit Course Modal */}
        <div
          className="modal fade"
          id="courseFormModal"
          tabIndex="-1"
          aria-labelledby="courseFormModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom p-4">
                <h5 className="modal-title fw-bold text-dark" id="courseFormModalLabel">
                  {modalMode === 'add' ? 'Add New Course' : 'Edit Course Details'}
                </h5>
                <button
                  type="button"
                  id="closeCourseModalBtn"
                  className="btn-close shadow-none"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 bg-light">
                  <div className="row g-3">
                    {/* Title */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Course Title *</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        placeholder="e.g. Full-Stack React & Node.js"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    {/* Category */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Category *</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        placeholder="e.g. Web Development, Data Science"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      />
                    </div>

                    {/* Instructor */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Instructor Name *</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        placeholder="e.g. Dr. Jane Smith"
                        value={formData.instructor}
                        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                        required
                      />
                    </div>

                    {/* Price */}
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Price (USD) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control shadow-none"
                        placeholder="e.g. 49.99"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>

                    {/* Level */}
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Difficulty Level</label>
                      <select
                        className="form-select shadow-none"
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="All Levels">All Levels</option>
                      </select>
                    </div>

                    {/* Duration */}
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Duration</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        placeholder="e.g. 8 Weeks"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>

                    {/* Thumbnail Image URL */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">
                        Thumbnail Image URL
                      </label>
                      <input
                        type="url"
                        className="form-control shadow-none"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      />
                      <small className="text-muted">
                        Leave blank to use a default placeholder image.
                      </small>
                    </div>

                    {/* Featured Checkbox */}
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="featuredCheck"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        />
                        <label className="form-check-label small fw-semibold text-dark" htmlFor="featuredCheck">
                          Feature this course on the home page
                        </label>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">
                        Course Description *
                      </label>
                      <textarea
                        className="form-control shadow-none"
                        rows="4"
                        placeholder="Describe the curriculum, topics covered, and target audience..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top p-3 bg-white">
                  <button type="button" className="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom px-4" disabled={actionLoading}>
                    {actionLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : modalMode === 'add' ? (
                      'Create Course'
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCoursesPage;
