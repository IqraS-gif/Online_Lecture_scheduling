import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload, BookOpen, ArrowLeft } from "lucide-react";
import api from "../../api";
import toast from "react-hot-toast";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function AddCourse() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({ name: "", level: "Beginner", description: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())        errs.name = "Course name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("level", form.level);
      fd.append("description", form.description.trim());
      if (image) fd.append("image", image);

      await api.post("/courses", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Course created successfully");
      navigate("/admin/courses");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 720 }}>
      <Link to="/admin/courses" className="back-link">
        <ArrowLeft size={15} /> Back to Courses
      </Link>

      <div className="page-header">
        <div>
          <h1 className="page-title">Add New Course</h1>
          <p className="page-subtitle">Fill in the details to create a new course</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BookOpen size={18} color="var(--orange-500)" /> Course Details
          </span>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="course-name">Course Name</label>
                <input
                  id="course-name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. React Fundamentals"
                  value={form.name}
                  onChange={handleChange}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="course-level">Level</label>
                <select
                  id="course-level"
                  name="level"
                  className="form-select"
                  value={form.level}
                  onChange={handleChange}
                >
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course-desc">Description</label>
              <textarea
                id="course-desc"
                name="description"
                className="form-textarea"
                placeholder="Describe what this course covers..."
                value={form.description}
                onChange={handleChange}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Course Image (optional)</label>
              <div
                className="image-upload-zone"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  id="course-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  style={{ display: "none" }}
                />
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Preview"
                      className="image-preview"
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="upload-hint" style={{ marginTop: 10 }}>
                      Click anywhere to change image
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={28} className="upload-icon" />
                    <div className="upload-text">Click to upload an image</div>
                    <div className="upload-hint">PNG, JPG, WebP up to 10 MB</div>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
              <Link to="/admin/courses" className="btn btn-secondary">Cancel</Link>
              <button
                id="add-course-submit"
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
