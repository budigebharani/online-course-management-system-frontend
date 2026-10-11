import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState('200');
  const [sort, setSort] = useState('newest');

  // Load Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosClient.get('/courses/categories');
        if (res.data?.success && res.data.categories) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.warn('Could not load categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Courses with filters
  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category && category !== 'All') params.category = category;
      if (maxPrice && Number(maxPrice) < 200) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;

      const res = await axiosClient.get('/courses', { params });
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
  }, [category, maxPrice, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setMaxPrice('200');
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <div className="container">
        {/* Header */}
        <div className="mb-4">
          <h1 className="fw-bold text-dark mb-1">Browse Course Catalog</h1>
          <p className="text-secondary">
            Explore industry-vetted courses and enhance your software engineering abilities.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
          <div className="row g-3 align-items-end">
            {/* Search Input */}
            <div className="col-lg-4 col-md-6">
              <label className="form-label small fw-semibold text-secondary">
                Search Course or Instructor
              </label>
              <form onSubmit={handleSearchSubmit}>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0 shadow-none"
                    placeholder="e.g. React, Python, AWS..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary border-start-0"
                      onClick={() => {
                        setSearch('');
                        fetchCourses();
                      }}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary px-3">
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Category Filter */}
            <div className="col-lg-3 col-md-6">
              <label className="form-label small fw-semibold text-secondary">Category</label>
              <select
                className="form-select shadow-none"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSearchParams({ category: e.target.value });
                }}
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Price Range */}
            <div className="col-lg-3 col-md-6">
              <div className="d-flex justify-content-between">
                <label className="form-label small fw-semibold text-secondary">Max Price</label>
                <span className="small fw-bold text-primary">
                  {Number(maxPrice) >= 200 ? 'Any Price' : `$${maxPrice}`}
                </span>
              </div>
              <input
                type="range"
                className="form-range"
                min="0"
                max="200"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            {/* Sorting */}
            <div className="col-lg-2 col-md-6">
              <label className="form-label small fw-semibold text-secondary">Sort By</label>
              <select
                className="form-select shadow-none"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {(search || category !== 'All' || Number(maxPrice) < 200) && (
            <div className="d-flex flex-wrap align-items-center gap-2 mt-3 pt-3 border-top">
              <span className="small text-muted fw-semibold">Active Filters:</span>
              {search && (
                <span className="badge bg-light text-dark border px-3 py-2">
                  Keyword: "{search}"
                </span>
              )}
              {category !== 'All' && (
                <span className="badge bg-light text-dark border px-3 py-2">
                  Category: {category}
                </span>
              )}
              {Number(maxPrice) < 200 && (
                <span className="badge bg-light text-dark border px-3 py-2">
                  Max Price: ${maxPrice}
                </span>
              )}
              <button
                type="button"
                className="btn btn-link btn-sm text-danger text-decoration-none p-0 ms-2"
                onClick={handleResetFilters}
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="text-secondary small mb-0">
            Showing <strong className="text-dark">{courses.length}</strong> available courses
          </p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <LoadingSpinner message="Fetching courses matching your filters..." />
        ) : error ? (
          <div className="alert alert-danger rounded-4 p-4 shadow-sm text-center">
            <i className="bi bi-exclamation-triangle-fill fs-2 mb-2 d-block"></i>
            <h5>Failed to load courses</h5>
            <p className="mb-3 text-secondary">{error}</p>
            <button className="btn btn-primary rounded-pill px-4" onClick={fetchCourses}>
              Retry Connection
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border shadow-sm p-4">
            <div className="fs-1 text-muted mb-3">🔍</div>
            <h4 className="fw-bold text-dark">No courses match your criteria</h4>
            <p className="text-secondary small mb-4">
              Try adjusting your search terms, changing the category, or resetting the price filter.
            </p>
            <button className="btn btn-primary rounded-pill px-4" onClick={handleResetFilters}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {courses.map((course) => (
              <div key={course._id} className="col-lg-4 col-md-6">
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
