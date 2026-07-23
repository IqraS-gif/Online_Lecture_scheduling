import { useEffect, useState } from "react";
import { Users, CalendarDays, Clock, BookOpen, X, GraduationCap, Search } from "lucide-react";
import api from "../../api";

const AVATAR_COLORS = ["#f97316", "#3b82f6", "#a855f7", "#22c55e", "#ec4899"];

const statusClass = {
  Scheduled: "badge status-Scheduled",
  Completed:  "badge status-Completed",
  Cancelled:  "badge status-Cancelled",
};

export default function Instructors() {
  const [instructors, setInstructors]     = useState([]);
  const [lectureCounts, setLectureCounts] = useState({});
  const [loading, setLoading]             = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Instructor detail popup
  const [selectedInst, setSelectedInst]       = useState(null);
  const [instLectures, setInstLectures]       = useState([]);
  const [lecturesLoading, setLecturesLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [instRes, lecRes] = await Promise.all([
          api.get("/users/instructors"),
          api.get("/lectures"),
        ]);
        setInstructors(instRes.data);

        const counts = {};
        lecRes.data.forEach(lec => {
          counts[lec.instructorId] = (counts[lec.instructorId] || 0) + 1;
        });
        setLectureCounts(counts);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getInitials = (name) =>
    name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "??";

  const handleCardClick = async (inst) => {
    setSelectedInst(inst);
    setInstLectures([]);
    setLecturesLoading(true);
    try {
      const res = await api.get(`/lectures/instructor/${inst.id}`);
      const today = new Date().toISOString().split("T")[0];
      const sorted = [...res.data].sort((a, b) => {
        const aUpcoming = a.lectureDate >= today;
        const bUpcoming = b.lectureDate >= today;
        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return  1;
        return a.lectureDate.localeCompare(b.lectureDate);
      });
      setInstLectures(sorted);
    } catch {
      setInstLectures([]);
    } finally {
      setLecturesLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedInst(null);
    setInstLectures([]);
  };

  const today = new Date().toISOString().split("T")[0];

  // Filter instructors by name, email, or designation
  const filteredInstructors = instructors.filter(inst => {
    const q = searchQuery.toLowerCase();
    const nameMatch = inst.name?.toLowerCase().includes(q);
    const emailMatch = inst.email?.toLowerCase().includes(q);
    const desigMatch = inst.designation?.toLowerCase().includes(q);
    return nameMatch || emailMatch || desigMatch;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Instructors</h1>
          <p className="page-subtitle">Click on any instructor to view their lecture schedule</p>
        </div>
        <span className="badge badge-purple" style={{ fontSize: 13, padding: "6px 14px" }}>
          {instructors.length} Instructors
        </span>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ position: "relative", maxWidth: 420 }}>
          <Search size={16} style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)"
          }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 38, paddingRight: searchQuery ? 34 : 12, margin: 0 }}
            placeholder="Search by name, email, or subject/designation..."
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
      </div>

      {loading ? (
        <div className="spinner" />
      ) : instructors.length === 0 ? (
        <div className="empty-state">
          <Users size={48} className="empty-state-icon" />
          <div className="empty-state-title">No instructors found</div>
          <div className="empty-state-desc">
            Run the seed endpoint to add sample instructors:<br />
            <code style={{ fontSize: 12, background: "var(--gray-100)", padding: "2px 6px", borderRadius: 4 }}>
              POST /users/seed
            </code>
          </div>
        </div>
      ) : filteredInstructors.length === 0 ? (
        <div className="empty-state" style={{ padding: "48px 0" }}>
          <Search size={40} className="empty-state-icon" />
          <div className="empty-state-title">No instructors match your search</div>
          <div className="empty-state-desc">
            Try searching for a different name, email, or subject.
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 12 }}
            onClick={() => setSearchQuery("")}
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="instructors-grid">
          {filteredInstructors.map((inst, idx) => (
            <div
              key={inst.id}
              className="instructor-card"
              onClick={() => handleCardClick(inst)}
              style={{ cursor: "pointer" }}
            >
              <div
                className="instructor-avatar"
                style={{ background: AVATAR_COLORS[instructors.indexOf(inst) % AVATAR_COLORS.length] }}
              >
                {getInitials(inst.name)}
              </div>
              <div className="instructor-name">{inst.name}</div>
              {inst.designation && (
                <span className="badge badge-orange" style={{ marginBottom: 6, fontSize: 11 }}>
                  {inst.designation}
                </span>
              )}
              <div className="instructor-email">{inst.email}</div>
              <div className="instructor-stat">
                <CalendarDays size={13} color="var(--orange-500)" />
                {lectureCounts[inst.id] || 0} lecture{(lectureCounts[inst.id] || 0) !== 1 ? "s" : ""} assigned
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructor Lectures Popup */}
      {selectedInst && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal"
            style={{ maxWidth: 640 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  className="instructor-avatar"
                  style={{
                    width: 44, height: 44, fontSize: 16,
                    background: AVATAR_COLORS[instructors.indexOf(selectedInst) % AVATAR_COLORS.length],
                    flexShrink: 0,
                  }}
                >
                  {getInitials(selectedInst.name)}
                </div>
                <div>
                  <div className="modal-title">{selectedInst.name}</div>
                  {selectedInst.designation && (
                    <span className="badge badge-orange" style={{ fontSize: 11, marginTop: 2 }}>
                      {selectedInst.designation}
                    </span>
                  )}
                </div>
              </div>
              <button className="modal-close" onClick={closeModal}>
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {lecturesLoading ? (
                <div className="spinner" />
              ) : instLectures.length === 0 ? (
                <div className="empty-state" style={{ padding: "40px 0" }}>
                  <GraduationCap size={40} className="empty-state-icon" />
                  <div className="empty-state-title">No lectures assigned</div>
                  <div className="empty-state-desc">
                    This instructor has no lectures scheduled yet.
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {instLectures.map((lec, i) => {
                    const isUpcoming = lec.lectureDate >= today;
                    const isFirst = i === 0;
                    return (
                      <div
                        key={lec.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                          padding: "14px 16px",
                          borderRadius: "var(--radius-md)",
                          border: isFirst && isUpcoming
                            ? "2px solid var(--orange-400)"
                            : "1px solid var(--gray-200)",
                          background: isFirst && isUpcoming
                            ? "var(--orange-50)"
                            : "var(--white)",
                          position: "relative",
                        }}
                      >
                        {/* Date column */}
                        <div style={{
                          minWidth: 56, textAlign: "center",
                          background: isUpcoming ? "var(--orange-500)" : "var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          padding: "6px 4px",
                          flexShrink: 0,
                        }}>
                          <div style={{
                            fontSize: 18, fontWeight: 800,
                            color: isUpcoming ? "#fff" : "var(--gray-500)",
                            lineHeight: 1,
                          }}>
                            {lec.lectureDate.split("-")[2]}
                          </div>
                          <div style={{
                            fontSize: 10, fontWeight: 600,
                            color: isUpcoming ? "rgba(255,255,255,0.8)" : "var(--gray-400)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}>
                            {new Date(lec.lectureDate + "T00:00:00").toLocaleDateString("en-IN", { month: "short" })}
                          </div>
                          <div style={{
                            fontSize: 10,
                            color: isUpcoming ? "rgba(255,255,255,0.7)" : "var(--gray-400)",
                          }}>
                            {lec.lectureDate.split("-")[0]}
                          </div>
                        </div>

                        {/* Info column */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--dark)" }}>
                              {lec.lectureTitle}
                            </span>
                            {isFirst && isUpcoming && (
                              <span className="badge badge-orange" style={{ fontSize: 10 }}>Next Up</span>
                            )}
                            <span className={statusClass[lec.status] || "badge badge-gray"} style={{ fontSize: 11 }}>
                              {lec.status}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 12, color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 4 }}>
                              <BookOpen size={12} color="var(--orange-500)" />
                              {lec.courseName || "—"}
                            </span>
                            <span style={{ fontSize: 12, color: "var(--gray-500)", display: "flex", alignItems: "center", gap: 4 }}>
                              <Clock size={12} />
                              {lec.startTime} – {lec.endTime}
                            </span>
                            <span className="badge badge-purple" style={{ fontSize: 11 }}>
                              {lec.batch}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--gray-500)" }}>
                {instLectures.length} lecture{instLectures.length !== 1 ? "s" : ""} total
              </span>
              <button className="btn btn-secondary btn-sm" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
