import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, CalendarCheck, Clock, ArrowRight } from "lucide-react";
import api from "../../api";

export default function Dashboard() {
  const [stats, setStats] = useState({ courses: 0, instructors: 0, lectures: 0 });
  const [recentLectures, setRecentLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [coursesRes, instructorsRes, lecturesRes] = await Promise.all([
          api.get("/courses"),
          api.get("/users/instructors"),
          api.get("/lectures"),
        ]);
        setStats({
          courses:     coursesRes.data.length,
          instructors: instructorsRes.data.length,
          lectures:    lecturesRes.data.length,
        });
        setRecentLectures(lecturesRes.data.slice(0, 8));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    {
      label: "Total Courses",
      value: stats.courses,
      icon: BookOpen,
      iconBg: "#fff7ed",
      iconColor: "#f97316",
    },
    {
      label: "Instructors",
      value: stats.instructors,
      icon: Users,
      iconBg: "#f3e8ff",
      iconColor: "#a855f7",
    },
    {
      label: "Total Lectures",
      value: stats.lectures,
      icon: CalendarCheck,
      iconBg: "#dcfce7",
      iconColor: "#22c55e",
    },
  ];

  const statusClass = {
    Scheduled: "badge badge-blue",
    Completed:  "badge badge-green",
    Cancelled:  "badge badge-red",
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your lecture scheduling system</p>
        </div>
        <Link to="/admin/courses/add" className="btn btn-primary">
          <BookOpen size={15} /> Add Course
        </Link>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        {statCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: iconBg }}>
              <Icon size={22} color={iconColor} />
            </div>
            <div>
              <div className="stat-value">
                {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, margin: 0 }} /> : value}
              </div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent lectures */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Lectures</div>
          </div>
          <Link to="/admin/courses" className="btn btn-ghost btn-sm">
            View courses <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : recentLectures.length === 0 ? (
          <div className="empty-state">
            <Clock size={40} className="empty-state-icon" />
            <div className="empty-state-title">No lectures yet</div>
            <div className="empty-state-desc">Add a course and schedule lectures to get started.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Lecture</th>
                  <th>Course</th>
                  <th>Batch</th>
                  <th>Instructor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLectures.map(lec => (
                  <tr key={lec.id}>
                    <td style={{ fontWeight: 600, color: "var(--dark)" }}>{lec.lectureTitle}</td>
                    <td>{lec.courseName || "—"}</td>
                    <td>
                      <span className="badge badge-orange">{lec.batch}</span>
                    </td>
                    <td>{lec.instructorName || "—"}</td>
                    <td style={{ fontWeight: 500 }}>{lec.lectureDate}</td>
                    <td style={{ fontSize: 13, color: "var(--gray-500)" }}>
                      {lec.startTime} – {lec.endTime}
                    </td>
                    <td>
                      <span className={statusClass[lec.status] || "badge badge-gray"}>
                        {lec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
