import { useEffect, useState } from "react";
import { Users, CalendarDays } from "lucide-react";
import api from "../../api";

const AVATAR_COLORS = ["#f97316", "#3b82f6", "#a855f7", "#22c55e", "#ec4899"];

export default function Instructors() {
  const [instructors, setInstructors] = useState([]);
  const [lectureCounts, setLectureCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [instRes, lecRes] = await Promise.all([
          api.get("/users/instructors"),
          api.get("/lectures"),
        ]);
        setInstructors(instRes.data);

        // Count lectures per instructor
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Instructors</h1>
          <p className="page-subtitle">All registered instructors on the platform</p>
        </div>
        <span className="badge badge-purple" style={{ fontSize: 13, padding: "6px 14px" }}>
          {instructors.length} Instructors
        </span>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : instructors.length === 0 ? (
        <div className="empty-state">
          <Users size={48} className="empty-state-icon" />
          <div className="empty-state-title">No instructors found</div>
          <div className="empty-state-desc">
            Run the seed endpoint to add sample instructors:
            <br />
            <code style={{ fontSize: 12, background: "var(--gray-100)", padding: "2px 6px", borderRadius: 4 }}>
              POST /users/seed
            </code>
          </div>
        </div>
      ) : (
        <div className="instructors-grid">
          {instructors.map((inst, idx) => (
            <div key={inst.id} className="instructor-card">
              <div
                className="instructor-avatar"
                style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
              >
                {getInitials(inst.name)}
              </div>
              <div className="instructor-name">{inst.name}</div>
              <div className="instructor-email">{inst.email}</div>
              <div className="instructor-stat">
                <CalendarDays size={13} color="var(--orange-500)" />
                {lectureCounts[inst.id] || 0} lecture{(lectureCounts[inst.id] || 0) !== 1 ? "s" : ""} assigned
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
