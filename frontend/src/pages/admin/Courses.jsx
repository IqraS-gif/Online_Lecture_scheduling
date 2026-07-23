import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Plus, Trash2, ImageOff, ArrowRight } from "lucide-react";
import api from "../../api";
import toast from "react-hot-toast";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete course "${name}"? This will also delete all its lectures.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Course deleted");
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setDeletingId(null);
    }
  };

  const levelClass = {
    Beginner:     "badge level-Beginner",
    Intermediate: "badge level-Intermediate",
    Advanced:     "badge level-Advanced",
  };

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

      {loading ? (
        <div className="spinner" />
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} className="empty-state-icon" />
          <div className="empty-state-title">No courses yet</div>
          <div className="empty-state-desc">Click "Add Course" to create your first course.</div>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
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
                  onClick={() => handleDelete(course.id, course.name)}
                  disabled={deletingId === course.id}
                >
                  <Trash2 size={13} />
                  {deletingId === course.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
