import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

// Helpers to support both YouTube course streams and HTML5 MP4 videos
const isYouTubeVideo = (url) => {
  return typeof url === 'string' && (url.includes('youtube.com') || url.includes('youtu.be'));
};

const getEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) {
    return url.includes('?') ? `${url}&rel=0` : `${url}?rel=0`;
  }
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?rel=0`;
  }
  return url;
};

const ClassroomPage = () => {
  const { enrollmentId } = useParams();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Video player ref and playback state
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoPlaybackError, setVideoPlaybackError] = useState(false);
  const [forceMp4Mode, setForceMp4Mode] = useState(false);

  // Active module tab: 'lectures' | 'quizzes' | 'assignments' | 'certificate'
  const [activeTab, setActiveTab] = useState('lectures');
  const [selectedLecture, setSelectedLecture] = useState(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Assignment state
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  const fetchEnrollmentData = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/enrollments/${enrollmentId}`);
      if (res.data?.success) {
        const enr = res.data.enrollment;
        setEnrollment(enr);
        const lectures = enr.course?.lectures || [];
        if (lectures.length > 0 && !selectedLecture) {
          setSelectedLecture(lectures[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load classroom course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollmentData();
  }, [enrollmentId]);

  // Handle marking lecture as watched
  const handleWatchLecture = async (lecture) => {
    try {
      setSelectedLecture(lecture);
      const res = await axiosClient.post(`/enrollments/${enrollmentId}/watch-lecture`, {
        lectureTitle: lecture.title,
      });
      if (res.data?.success) {
        setEnrollment(res.data.enrollment);
        setSuccess(`Completed lecture: "${lecture.title}"! Progress updated.`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Error updating lecture progress');
    }
  };

  // Handle quiz question option select
  const handleSelectOption = (questionIndex, optionIndex) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  // Handle quiz submit
  const handleSubmitQuiz = async (quiz) => {
    try {
      setSubmittingQuiz(true);
      setError('');
      const formattedAnswers = quiz.questions.map((_, idx) => quizAnswers[idx] ?? -1);

      const res = await axiosClient.post(`/enrollments/${enrollmentId}/quiz-submit`, {
        quizTitle: quiz.title,
        answers: formattedAnswers,
      });

      if (res.data?.success) {
        setQuizResult(res.data);
        setEnrollment(res.data.enrollment);
        if (res.data.passed) {
          setSuccess(`🎉 Exam Passed! Score: ${res.data.score}%. Your certificate is unlocked!`);
        } else {
          setError(`Score: ${res.data.score}%. Passing score is 70%. Review notes and try again!`);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Handle assignment submit
  const handleSubmitAssignment = async (assignment) => {
    if (!submissionText.trim() && !submissionUrl.trim()) {
      setError('Please provide project submission notes or repository URL');
      return;
    }

    try {
      setSubmittingAssignment(true);
      setError('');
      const res = await axiosClient.post(`/enrollments/${enrollmentId}/assignment-submit`, {
        assignmentTitle: assignment.title,
        submissionText,
        submissionUrl,
      });

      if (res.data?.success) {
        setEnrollment(res.data.enrollment);
        setSuccess('🎉 Project assignment submitted and auto-reviewed successfully!');
        setSubmissionText('');
        setSubmissionUrl('');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit assignment');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Opening your virtual video classroom..." fullPage />;
  }

  if (error && !enrollment) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger rounded-4 p-4 shadow-sm">
          <h4>Course Classroom Error</h4>
          <p className="text-secondary">{error}</p>
          <Link to="/my-courses" className="btn btn-primary rounded-pill px-4 mt-2">
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  const course = enrollment.course || {};
  const lectures = course.lectures || [];
  const quizzes = course.quizzes || [];
  const assignments = course.assignments || [];
  const activeQuiz = quizzes[0] || null;
  const activeAssignment = assignments[0] || null;

  return (
    <div className="bg-light py-4 min-vh-100">
      <div className="container-fluid px-lg-5">
        {/* Navigation Breadcrumb & Top Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-1 small">
                <li className="breadcrumb-item"><Link to="/my-courses">My Courses</Link></li>
                <li className="breadcrumb-item active text-truncate" style={{ maxWidth: '300px' }}>
                  {course.title}
                </li>
              </ol>
            </nav>
            <h4 className="fw-bold text-dark mb-0">{course.title}</h4>
            <small className="text-muted">Instructor: {course.instructor} &bull; Category: {course.category}</small>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <span className="small text-muted d-block">Overall Progress</span>
              <strong className="text-primary fs-5">{enrollment.progress || 0}%</strong>
            </div>
            <div style={{ width: '120px' }}>
              <div className="progress" style={{ height: '10px' }}>
                <div
                  className={`progress-bar ${(enrollment.progress || 0) >= 80 ? 'bg-success' : 'bg-primary'}`}
                  style={{ width: `${enrollment.progress || 0}%` }}
                ></div>
              </div>
            </div>
            {enrollment.certificateIssued && (
              <Link to={`/certificate/${enrollment._id}`} className="btn btn-warning btn-sm rounded-pill px-3 shadow-sm fw-bold">
                <i className="bi bi-award-fill me-1"></i> View Certificate
              </Link>
            )}
          </div>
        </div>

        {error && <AlertMessage type="danger" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Main Classroom Layout */}
        <div className="row g-4">
          {/* Left Column: Video Lecture Player or Interactive Activity */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
              {activeTab === 'lectures' && selectedLecture && (
                <div>
                  {/* Dynamic Video Player: Subject-Matter YouTube Stream or HTML5 Video */}
                  {isYouTubeVideo(selectedLecture.videoUrl) && !forceMp4Mode ? (
                    <div className="ratio ratio-16x9 bg-black position-relative rounded-top overflow-hidden">
                      <iframe
                        key={selectedLecture.videoUrl}
                        src={getEmbedUrl(selectedLecture.videoUrl)}
                        title={selectedLecture.title}
                        className="w-100 h-100 border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="ratio ratio-16x9 bg-black position-relative rounded-top overflow-hidden">
                      <video
                        ref={videoRef}
                        key={selectedLecture.backupMp4 || selectedLecture.videoUrl}
                        src={selectedLecture.backupMp4 || selectedLecture.videoUrl}
                        controls
                        playsInline
                        preload="auto"
                        className="w-100 h-100"
                        poster={course.thumbnail}
                        style={{ backgroundColor: '#000', objectFit: 'contain' }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onError={() => {
                          console.warn('Primary video source failed, falling back to secondary stream');
                          setVideoPlaybackError(true);
                          if (videoRef.current && videoRef.current.src !== 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4') {
                            videoRef.current.src = 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4';
                            videoRef.current.load();
                          }
                        }}
                      >
                        <source src={selectedLecture.backupMp4 || selectedLecture.videoUrl} type="video/mp4" />
                        <source src="https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4" type="video/mp4" />
                        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                        Your browser does not support HTML5 video playback.
                      </video>
                    </div>
                  )}

                  {/* Lecture Details & Controls */}
                  <div className="p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3 pb-3 border-bottom">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                          <span className="badge bg-primary-subtle text-primary px-3 py-1 rounded-pill small">
                            <i className="bi bi-play-circle me-1"></i> {course.title} Lecture
                          </span>
                          {isYouTubeVideo(selectedLecture.videoUrl) && (
                            <span className="badge bg-danger-subtle text-danger px-3 py-1 rounded-pill small">
                              <i className="bi bi-youtube me-1"></i> Course Video Stream
                            </span>
                          )}
                        </div>
                        <h5 className="fw-bold text-dark mb-1">{selectedLecture.title}</h5>
                        <small className="text-muted"><i className="bi bi-clock me-1"></i> {selectedLecture.duration}</small>
                      </div>

                      <div className="d-flex gap-2 align-items-center flex-wrap">
                        {/* Stream Mode Switcher (YouTube vs MP4) */}
                        {isYouTubeVideo(selectedLecture.videoUrl) && (
                          <div className="btn-group btn-group-sm rounded-pill shadow-sm" role="group">
                            <button
                              type="button"
                              className={`btn ${!forceMp4Mode ? 'btn-danger text-white' : 'btn-outline-secondary'} btn-sm px-3`}
                              onClick={() => setForceMp4Mode(false)}
                              title="Play authentic course tutorial stream"
                            >
                              <i className="bi bi-youtube me-1"></i> HD Stream
                            </button>
                            <button
                              type="button"
                              className={`btn ${forceMp4Mode ? 'btn-primary text-white' : 'btn-outline-secondary'} btn-sm px-3`}
                              onClick={() => setForceMp4Mode(true)}
                              title="Play direct HTML5 video"
                            >
                              <i className="bi bi-file-earmark-play-fill me-1"></i> HTML5 MP4
                            </button>
                          </div>
                        )}

                        {/* Instant Play / Pause Button for MP4 mode */}
                        {(!isYouTubeVideo(selectedLecture.videoUrl) || forceMp4Mode) && (
                          <button
                            type="button"
                            className={`btn ${isPlaying ? 'btn-outline-primary' : 'btn-primary'} rounded-pill px-4 shadow-sm fw-bold`}
                            onClick={() => {
                              if (videoRef.current) {
                                if (videoRef.current.paused) {
                                  videoRef.current.play();
                                } else {
                                  videoRef.current.pause();
                                }
                              }
                            }}
                          >
                            <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'} me-1 fs-5`}></i>
                            {isPlaying ? 'Pause Video' : 'Play Video'}
                          </button>
                        )}

                        {/* Mark As Completed */}
                        {enrollment.watchedLectures?.some((l) => l.lectureTitle === selectedLecture.title) ? (
                          <span className="badge bg-success-subtle text-success fs-6 px-3 py-2 rounded-pill">
                            <i className="bi bi-check-circle-fill me-1"></i> Completed
                          </span>
                        ) : (
                          <button
                            className="btn btn-outline-success rounded-pill px-3"
                            onClick={() => handleWatchLecture(selectedLecture)}
                          >
                            <i className="bi bi-check-lg me-1"></i> Mark as Completed
                          </button>
                        )}
                      </div>
                    </div>

                    <h6 className="fw-bold text-dark mb-2">Lecture Notes & Concepts</h6>
                    <p className="text-secondary small leading-relaxed mb-0">
                      {selectedLecture.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Online Exam & Quizzes Tab */}
              {activeTab === 'quizzes' && (
                <div className="p-4 p-md-5">
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                    <div>
                      <span className="badge bg-warning-subtle text-warning-emphasis px-3 py-1 rounded-pill small mb-2">
                        <i className="bi bi-patch-question-fill me-1"></i> Examination Center
                      </span>
                      <h4 className="fw-bold text-dark mb-1">{activeQuiz?.title || 'Course Examination'}</h4>
                      <p className="text-secondary small mb-0">Passing score: 70% required for course certification</p>
                    </div>
                    {quizResult && (
                      <div className="text-end">
                        <span className="small text-muted d-block">Your Score</span>
                        <h3 className={`fw-bold mb-0 ${quizResult.passed ? 'text-success' : 'text-danger'}`}>
                          {quizResult.score}%
                        </h3>
                      </div>
                    )}
                  </div>

                  {activeQuiz ? (
                    <div>
                      {activeQuiz.questions.map((q, qIdx) => (
                        <div className="card border rounded-3 p-3 mb-4 bg-light" key={qIdx}>
                          <h6 className="fw-bold text-dark mb-3">
                            <span className="badge bg-primary me-2">Q{qIdx + 1}</span>
                            {q.question}
                          </h6>

                          <div className="d-flex flex-column gap-2">
                            {q.options.map((opt, oIdx) => (
                              <label
                                key={oIdx}
                                className={`p-3 rounded-3 border d-flex align-items-center gap-3 cursor-pointer transition ${
                                  quizAnswers[qIdx] === oIdx
                                    ? 'border-primary bg-primary-subtle text-primary fw-semibold'
                                    : 'bg-white text-secondary'
                                }`}
                                style={{ cursor: 'pointer' }}
                              >
                                <input
                                  type="radio"
                                  name={`quiz-q-${qIdx}`}
                                  checked={quizAnswers[qIdx] === oIdx}
                                  onChange={() => handleSelectOption(qIdx, oIdx)}
                                  className="form-check-input mt-0"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="text-end">
                        <button
                          className="btn btn-primary-custom px-5 py-2 shadow-sm"
                          onClick={() => handleSubmitQuiz(activeQuiz)}
                          disabled={submittingQuiz}
                        >
                          {submittingQuiz ? 'Grading Exam...' : 'Submit Exam for Grading'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted">No quiz currently configured for this course.</p>
                  )}
                </div>
              )}

              {/* Assignments & Submission Tab */}
              {activeTab === 'assignments' && (
                <div className="p-4 p-md-5">
                  <div className="mb-4 pb-2 border-bottom">
                    <span className="badge bg-info-subtle text-info px-3 py-1 rounded-pill small mb-2">
                      <i className="bi bi-file-earmark-code-fill me-1"></i> Practical Project
                    </span>
                    <h4 className="fw-bold text-dark mb-1">{activeAssignment?.title || 'Capstone Project'}</h4>
                    <small className="text-muted">Due Date: {activeAssignment?.dueDate} &bull; Max Score: {activeAssignment?.maxScore} pts</small>
                  </div>

                  <div className="card bg-light border-0 rounded-3 p-3 mb-4">
                    <h6 className="fw-bold text-dark mb-2">Assignment Brief</h6>
                    <p className="text-secondary small mb-0">{activeAssignment?.description}</p>
                  </div>

                  {/* Submission Form */}
                  <div className="card border rounded-3 p-4 bg-white mb-4 shadow-sm">
                    <h5 className="fw-bold text-dark mb-3">Project Submission Portal</h5>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Repository or Demo URL</label>
                      <input
                        type="url"
                        className="form-control shadow-none"
                        placeholder="e.g. https://github.com/my-username/my-project"
                        value={submissionUrl}
                        onChange={(e) => setSubmissionUrl(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Summary & Implementation Notes</label>
                      <textarea
                        className="form-control shadow-none"
                        rows="4"
                        placeholder="Explain your approach, design patterns, and instructions to run..."
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                      ></textarea>
                    </div>
                    <button
                      className="btn btn-primary-custom px-4"
                      onClick={() => handleSubmitAssignment(activeAssignment)}
                      disabled={submittingAssignment}
                    >
                      {submittingAssignment ? 'Submitting Solution...' : 'Submit Assignment'}
                    </button>
                  </div>

                  {/* Previous Submissions */}
                  {enrollment.assignments && enrollment.assignments.length > 0 && (
                    <div>
                      <h6 className="fw-bold text-dark mb-3">Previous Submissions & Feedback</h6>
                      {enrollment.assignments.map((sub, sIdx) => (
                        <div className="card border rounded-3 p-3 mb-2 bg-light" key={sIdx}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong className="text-dark">{sub.assignmentTitle}</strong>
                            <span className="badge bg-success-subtle text-success">
                              Grade: {sub.grade}/100
                            </span>
                          </div>
                          {sub.submissionUrl && (
                            <p className="small text-muted mb-1">
                              Link: <a href={sub.submissionUrl} target="_blank" rel="noreferrer">{sub.submissionUrl}</a>
                            </p>
                          )}
                          {sub.submissionText && <p className="small text-secondary mb-2">{sub.submissionText}</p>}
                          {sub.feedback && (
                            <div className="p-2 bg-white rounded border small text-success">
                              <i className="bi bi-chat-quote-fill me-1"></i> Instructor Feedback: {sub.feedback}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Course Completion Certification Tab */}
              {activeTab === 'certificate' && (
                <div className="p-4 p-md-5 text-center">
                  <div className="py-4">
                    <div
                      className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center mx-auto mb-3 shadow"
                      style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}
                    >
                      🎓
                    </div>

                    <h3 className="fw-bold text-dark mb-2">Course Completion Certificate</h3>
                    <p className="text-secondary small mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                      Earn your official verified certificate by completing all 4 video lecture modules and passing the final exam with 70% or higher.
                    </p>

                    <div className="card border rounded-4 p-4 mb-4 mx-auto bg-light" style={{ maxWidth: '450px' }}>
                      <div className="d-flex justify-content-between text-secondary small mb-2">
                        <span>Course Modules Watched</span>
                        <span className="fw-bold text-dark">{enrollment.watchedLectures?.length || 0}/4</span>
                      </div>
                      <div className="d-flex justify-content-between text-secondary small mb-2">
                        <span>Certification Exam</span>
                        <span className="fw-bold text-dark">
                          {enrollment.quizScores?.some((q) => q.passed) ? 'Passed ✅' : 'Pending'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between text-secondary small mb-0">
                        <span>Overall Progress</span>
                        <span className="fw-bold text-primary">{enrollment.progress || 0}%</span>
                      </div>
                    </div>

                    {enrollment.certificateIssued ? (
                      <Link
                        to={`/certificate/${enrollment._id}`}
                        className="btn btn-warning btn-lg rounded-pill px-5 shadow fw-bold text-dark"
                      >
                        <i className="bi bi-award-fill me-2"></i> View & Print Official Certificate
                      </Link>
                    ) : (
                      <button
                        className="btn btn-secondary btn-lg rounded-pill px-5"
                        disabled
                      >
                        <i className="bi bi-lock-fill me-2"></i> Certificate Locked (Complete Course to Unlock)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Classroom Navigation Drawer */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '80px' }}>
              <h5 className="fw-bold text-dark mb-3">Course Modules</h5>

              {/* Module Feature Switcher Tabs */}
              <ul className="nav nav-pills nav-fill bg-light p-1 rounded-3 mb-4">
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-3 small py-2 fw-semibold ${activeTab === 'lectures' ? 'active bg-primary text-white' : 'text-secondary'}`}
                    onClick={() => setActiveTab('lectures')}
                  >
                    <i className="bi bi-camera-video me-1"></i> Lectures
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-3 small py-2 fw-semibold ${activeTab === 'quizzes' ? 'active bg-primary text-white' : 'text-secondary'}`}
                    onClick={() => setActiveTab('quizzes')}
                  >
                    <i className="bi bi-pencil-square me-1"></i> Exam
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-3 small py-2 fw-semibold ${activeTab === 'assignments' ? 'active bg-primary text-white' : 'text-secondary'}`}
                    onClick={() => setActiveTab('assignments')}
                  >
                    <i className="bi bi-folder-check me-1"></i> Projects
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-3 small py-2 fw-semibold ${activeTab === 'certificate' ? 'active bg-primary text-white' : 'text-secondary'}`}
                    onClick={() => setActiveTab('certificate')}
                  >
                    <i className="bi bi-award me-1"></i> Cert
                  </button>
                </li>
              </ul>

              {/* Lecture Playlist List */}
              <h6 className="small fw-bold text-muted text-uppercase mb-3">Video Lecture Curriculum</h6>
              <div className="list-group list-group-flush rounded-3">
                {lectures.map((lec, idx) => {
                  const isWatched = enrollment.watchedLectures?.some((w) => w.lectureTitle === lec.title);
                  const isCurrent = selectedLecture?.title === lec.title;

                  return (
                    <button
                      key={idx}
                      className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 border rounded-3 mb-2 ${
                        isCurrent ? 'border-primary bg-primary-subtle' : 'bg-white'
                      }`}
                      onClick={() => {
                        setSelectedLecture(lec);
                        setActiveTab('lectures');
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 text-start">
                        <i className={`bi ${isWatched ? 'bi-check-circle-fill text-success' : 'bi-play-circle text-primary'} fs-5 flex-shrink-0`}></i>
                        <div>
                          <span className={`small d-block fw-semibold ${isCurrent ? 'text-primary' : 'text-dark'}`}>
                            {lec.title}
                          </span>
                          <small className="text-muted">{lec.duration}</small>
                        </div>
                      </div>
                      {isWatched && <span className="badge bg-success small">Done</span>}
                    </button>
                  );
                })}
              </div>

              {/* Quick Jump Links */}
              <hr className="my-4" />
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-warning rounded-3 fw-semibold small text-dark"
                  onClick={() => setActiveTab('quizzes')}
                >
                  <i className="bi bi-patch-question me-1 text-warning"></i> Take Certification Exam
                </button>
                <button
                  className="btn btn-outline-info rounded-3 fw-semibold small text-dark"
                  onClick={() => setActiveTab('assignments')}
                >
                  <i className="bi bi-upload me-1 text-info"></i> Submit Project Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomPage;
