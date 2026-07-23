import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, BookOpen, ImageOff,
  CalendarDays, Clock, Users, X, AlertCircle, TriangleAlert
} from "lucide-react";
import api from "../../api";
import toast from "react-hot-toast";

// ─── Custom Time Picker ───────────────────────────────────────────────────────
function TimePicker({ value, onChange, label, id }) {
  // value is "HH:MM" in 24-hour format
  const parse = (v) => {
    if (!v) return { hour: "", minute: "00", ampm: "AM" };
    const [h, m] = v.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return { hour: String(hour), minute: String(m).padStart(2, "0"), ampm };
  };

  const to24 = (hour, minute, ampm) => {
    let h = parseInt(hour, 10);
    if (isNaN(h)) return "";
    if (ampm === "AM") { if (h === 12) h = 0; }
    else               { if (h !== 12) h += 12; }
    return `${String(h).padStart(2, "0")}:${minute}`;
  };

  const { hour, minute, ampm } = parse(value);

  const set = (h, m, a) => { const v24 = to24(h, m, a); if (v24) onChange(v24); };

  const handleHour = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (v && parseInt(v) > 12) v = "12";
    if (v && parseInt(v) < 1)  v = "1";
    set(v || hour, minute, ampm);
  };

  const handleMinute = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (v && parseInt(v) > 59) v = "59";
    set(hour, v.padStart(2, "0") || minute, ampm);
  };

  const toggleAmPm = (a) => set(hour, minute, a);

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "var(--gray-50)", border: "1.5px solid var(--gray-200)",
        borderRadius: "var(--radius-md)", padding: "10px 14px",
      }}>
        {/* Hour */}
        <input
          id={id}
          type="text"
          inputMode="numeric"
          maxLength={2}
          placeholder="--"
          value={hour}
          onChange={handleHour}
          style={{
            width: 42, border: "none", background: "transparent",
            fontSize: 22, fontWeight: 700, textAlign: "center",
            color: "var(--dark)", outline: "none",
          }}
        />
        <span style={{ fontSize: 22, fontWeight: 700, color: "var(--gray-400)" }}>:</span>
        {/* Minute */}
        <input
          type="text"
          inputMode="numeric"
          maxLength={2}
          placeholder="00"
          value={minute}
          onChange={handleMinute}
          style={{
            width: 42, border: "none", background: "var(--gray-200)",
            fontSize: 22, fontWeight: 700, textAlign: "center",
            color: "var(--dark)", outline: "none",
            borderRadius: "var(--radius-sm)", padding: "2px 0",
          }}
        />
        {/* AM / PM */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginLeft: 6 }}>
          {["AM", "PM"].map(a => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmPm(a)}
              style={{
                padding: "2px 10px", border: "none", borderRadius: "var(--radius-sm)",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
                background: ampm === a ? "var(--orange-500)" : "var(--gray-200)",
                color:      ampm === a ? "#fff"             : "var(--gray-600)",
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["Scheduled", "Completed", "Cancelled"];

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    lectureTitle: "",
    batch: "",
    instructorId: "",
    lectureDate: "",
    startTime: "",
    endTime: "",
    status: "Scheduled",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [conflictError, setConflictError] = useState("");

  const loadData = async () => {
    try {
      const [courseRes, lecturesRes, instRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/lectures?courseId=${id}`),
        api.get("/users/instructors"),
      ]);
      setCourse(courseRes.data);
      setLectures(lecturesRes.data);
      setInstructors(instRes.data);
    } catch {
      toast.error("Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
    setConflictError("");
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!form.lectureTitle || !form.batch || !form.instructorId || !form.lectureDate || !form.startTime || !form.endTime) {
      setFormError("All fields are required.");
      return;
    }
    // Past-time check: if today's date is selected, start time must be in the future
    const todayStr = new Date().toISOString().split("T")[0];
    if (form.lectureDate === todayStr) {
      const now = new Date();
      const [sh, sm] = form.startTime.split(":").map(Number);
      const pickedStart = new Date();
      pickedStart.setHours(sh, sm, 0, 0);
      if (pickedStart <= now) {
        setFormError("Start time has already passed for today. Please choose a future time.");
        return;
      }
    }
    if (form.startTime >= form.endTime) {
      setFormError("End time must be after start time.");
      return;
    }

    setFormLoading(true);
    setFormError("");
    try {
      const res = await api.post("/lectures", {
        courseId: id,
        lectureTitle: form.lectureTitle,
        batch: form.batch,
        instructorId: form.instructorId,
        lectureDate: form.lectureDate,
        startTime: form.startTime,
        endTime: form.endTime,
        status: form.status,
      });
      toast.success("Lecture scheduled successfully");
      setShowModal(false);
      setForm({ lectureTitle: "", batch: "", instructorId: "", lectureDate: "", startTime: "", endTime: "", status: "Scheduled" });
      await loadData();
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.detail || "Failed to schedule lecture";
      if (status === 409) {
        // Show as a separate conflict popup
        setConflictError(msg);
      } else {
        setFormError(msg);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    if (!window.confirm("Delete this lecture?")) return;
    setDeletingId(lectureId);
    try {
      await api.delete(`/lectures/${lectureId}`);
      toast.success("Lecture deleted");
      setLectures(prev => prev.filter(l => l.id !== lectureId));
    } catch {
      toast.error("Failed to delete lecture");
    } finally {
      setDeletingId(null);
    }
  };

  const levelClass = {
    Beginner:     "badge level-Beginner",
    Intermediate: "badge level-Intermediate",
    Advanced:     "badge level-Advanced",
  };
  const statusClass = {
    Scheduled: "badge status-Scheduled",
    Completed:  "badge status-Completed",
    Cancelled:  "badge status-Cancelled",
  };

  if (loading) return <div className="page-container"><div className="spinner" /></div>;
  if (!course) return <div className="page-container"><p>Course not found.</p></div>;

  return (
    <div className="page-container">
      <Link to="/admin/courses" className="back-link">
        <ArrowLeft size={15} /> Back to Courses
      </Link>

      {/* Course info */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 0, overflow: "hidden", borderRadius: "var(--radius-lg)" }}>
          {course.imageUrl ? (
            <img
              src={course.imageUrl}
              alt={course.name}
              style={{ width: 220, height: 160, objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 220, height: 160, flexShrink: 0,
              background: "var(--gray-100)", display: "flex",
              alignItems: "center", justifyContent: "center", color: "var(--gray-400)"
            }}>
              <ImageOff size={32} />
            </div>
          )}
          <div style={{ padding: "24px 28px", flex: 1 }}>
            <div style={{ marginBottom: 10 }}>
              <span className={levelClass[course.level] || "badge badge-gray"}>{course.level}</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--dark)", marginBottom: 8 }}>
              {course.name}
            </h1>
            <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6 }}>
              {course.description}
            </p>
          </div>
        </div>
      </div>

      {/* Lectures section */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Lectures / Batches</div>
            <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>
              {lectures.length} lecture{lectures.length !== 1 ? "s" : ""} scheduled
            </div>
          </div>
          <button
            id="add-lecture-btn"
            className="btn btn-primary btn-sm"
            onClick={() => setShowModal(true)}
          >
            <Plus size={14} /> Add Lecture
          </button>
        </div>

        {lectures.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={40} className="empty-state-icon" />
            <div className="empty-state-title">No lectures yet</div>
            <div className="empty-state-desc">Click "Add Lecture" to schedule the first batch.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Batch</th>
                  <th>Instructor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lectures.map(lec => (
                  <tr key={lec.id}>
                    <td style={{ fontWeight: 600, color: "var(--dark)" }}>{lec.lectureTitle}</td>
                    <td><span className="badge badge-orange">{lec.batch}</span></td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Users size={13} color="var(--purple)" />
                        {lec.instructorName || "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <CalendarDays size={13} color="var(--orange-500)" />
                        {lec.lectureDate}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--gray-500)" }}>
                        <Clock size={13} />
                        {lec.startTime} – {lec.endTime}
                      </span>
                    </td>
                    <td>
                      <span className={statusClass[lec.status] || "badge badge-gray"}>
                        {lec.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteLecture(lec.id)}
                        disabled={deletingId === lec.id}
                      >
                        <Trash2 size={13} />
                        {deletingId === lec.id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Lecture Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Schedule a Lecture</span>
              <button className="modal-close" onClick={() => { setShowModal(false); setFormError(""); }}>
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleAddLecture}>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-error">
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    {formError}
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Lecture Title</label>
                    <input
                      id="lec-title"
                      name="lectureTitle"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Introduction to Hooks"
                      value={form.lectureTitle}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Batch</label>
                    <input
                      id="lec-batch"
                      name="batch"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Batch A / Morning"
                      value={form.batch}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Instructor</label>
                  <select
                    id="lec-instructor"
                    name="instructorId"
                    className="form-select"
                    value={form.instructorId}
                    onChange={handleFormChange}
                  >
                    <option value="">-- Select an instructor --</option>
                    {instructors.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Lecture Date</label>
                  <input
                    id="lec-date"
                    name="lectureDate"
                    type="date"
                    className="form-input"
                    value={form.lectureDate}
                    onChange={handleFormChange}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="form-row">
                  <TimePicker
                    id="lec-start"
                    label="Start Time"
                    value={form.startTime}
                    onChange={v => { setForm(p => ({ ...p, startTime: v })); setFormError(""); setConflictError(""); }}
                  />
                  <TimePicker
                    id="lec-end"
                    label="End Time"
                    value={form.endTime}
                    onChange={v => { setForm(p => ({ ...p, endTime: v })); setFormError(""); setConflictError(""); }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    id="lec-status"
                    name="status"
                    className="form-select"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="alert alert-info" style={{ marginBottom: 0 }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  An instructor can only be assigned one lecture per day. A conflict error will appear if the date is already taken.
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowModal(false); setFormError(""); }}
                >
                  Cancel
                </button>
                <button
                  id="add-lecture-submit"
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? "Scheduling..." : "Schedule Lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Conflict Warning Popup Modal */}
      {conflictError && (
        <div className="modal-overlay" style={{ zIndex: 300 }} onClick={() => setConflictError("")}>
          <div className="modal" style={{ maxWidth: 460, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div className="modal-body" style={{ padding: "32px 24px 24px" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--red-bg)", color: "var(--red)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <TriangleAlert size={32} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--dark)", marginBottom: 10 }}>
                Schedule Conflict Detected
              </h3>
              <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6, marginBottom: 24 }}>
                {conflictError}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "12px" }}
                onClick={() => setConflictError("")}
              >
                Understand &amp; Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
