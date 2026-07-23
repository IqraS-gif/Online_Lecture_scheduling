import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Plus, Trash2, ImageOff, ArrowRight, Search, X, AlertTriangle } from "lucide-react";
import api from "../../api";
import toast from "react-hot-toast";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // { course, lectureCount, loading }

  const loadCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCourses(); }, []);

  const initiateDelete = async (course) => {
    setDeletingId(course.id);
    try {
      // Fetch lectures for this course to check if it has lectures
      const res = await api.get(`/lectures?courseId=${course.id}`);
      setDeleteTarget({
        course,
        lectureCount: res.data.length,
      });
    } catch {
      // If fetching lectures fails, default to 0 count
      setDeleteTarget({
        course,
        lectureCount: 0,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { course } = deleteTarget;
    setDeletingId(course.id);
    try {
      await api.delete(`/courses/${course.id}`);
      toast.success("Course deleted successfully");
      setCourses(prev => prev.filter(c => c.id !== course.id));
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  const levelClass = {
    Beginner:     "badge level-Beginner",
    Intermediate: "badge level-Intermediate",
    Advanced:     "badge level-Advanced",
  };

  // Filter logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Courses</h1>
          <p className="page-subtitle">Manage your courses and lecture batches</p>
        </div>
        <Link to="/admin/courses/add" className="btn btn-primary">
          <Plus size={15} /> Add Course
        </Link>
      </div>

      {/* Search & Level Filter Bar */}
      <div style={{
        display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center"
      }}>
        {/* Search Input Box */}
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
          <Search size={16} style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)"
          }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 38, paddingRight: searchQuery ? 34 : 12, margin: 0 }}
            placeholder="Search courses by name or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "var(--gray-400)", cursor: "pointer", display: "flex", alignItems: "center"
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Level Filter Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            className="form-select"
            style={{ margin: 0, minWidth: 150 }}
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} className="empty-state-icon" />
          <div className="empty-state-title">No courses yet</div>
          <div className="empty-state-desc">Click "Add Course" to create your first course.</div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="empty-state" style={{ padding: "48px 0" }}>
          <Search size={40} className="empty-state-icon" />
          <div className="empty-state-title">No courses match your search</div>
          <div className="empty-state-desc">
            Try adjusting your search query or level filter.
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 12 }}
            onClick={() => { setSearchQuery(""); setSelectedLevel("All"); }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.name}
                  className="course-card-img"
                />
              ) : (
                <div className="course-card-img-placeholder">
                  <ImageOff size={36} />
                </div>
              )}
              <div className="course-card-body">
                <div className="course-card-level">
                  <span className={levelClass[course.level] || "badge badge-gray"}>
                    {course.level}
                  </span>
                </div>
                <div className="course-card-title">{course.name}</div>
                <div className="course-card-desc">{course.description}</div>
              </div>
              <div className="course-card-footer">
                <Link
                  to={`/admin/courses/${course.id}`}
                  className="btn btn-ghost btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  View Lectures <ArrowRight size={13} />
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => initiateDelete(course)}
                  disabled={deletingId === course.id}
                >
                  <Trash2 size={13} />
                  {deletingId === course.id ? "Checking..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Course Confirmation Popup Modal */}
      {deleteTarget && (
        <div className="modal-overlay" style={{ zIndex: 300 }} onClick={() => setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 440, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div className="modal-body" style={{ padding: "32px 24px 24px" }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%",
                background: "var(--red-bg)", color: "var(--red)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <AlertTriangle size={30} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--dark)", marginBottom: 10 }}>
                Delete Course
              </h3>
              <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6, marginBottom: 24 }}>
                {deleteTarget.lectureCount > 0 ? (
                  <>
                    This course contains lectures.
                    <br />
                    <strong>Delete all lectures too?</strong>
                  </>
                ) : (
                  <>
                    Are you sure you want to delete <strong>"{deleteTarget.course.name}"</strong>?
                    <br />
                    This action cannot be undone.
                  </>
                )}
              </p>

              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setDeleteTarget(null)}
                  disabled={deletingId === deleteTarget.course.id}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={confirmDelete}
                  disabled={deletingId === deleteTarget.course.id}
                >
                  {deletingId === deleteTarget.course.id ? "Deleting..." : "Delete Course"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
