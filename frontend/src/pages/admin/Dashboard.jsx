import { Link } from "react-router-dom";
import {
  BookOpen, Users, CalendarDays, Clock, ArrowRight,
  Calendar, FileText, User, MoreVertical, Menu
} from "lucide-react";
import api from "../../api";
import { useCache } from "../../context/DataCacheContext";

export default function Dashboard() {
  const { data: coursesData, loading: loadingCourses } = useCache("courses", () => api.get("/courses").then(r => r.data));
  const { data: instructorsData, loading: loadingInstructors } = useCache("instructors", () => api.get("/users/instructors").then(r => r.data));
  const { data: lecturesData, loading: loadingLectures } = useCache("lectures", () => api.get("/lectures").then(r => r.data));

  const loading = loadingCourses || loadingInstructors || loadingLectures;
  const courses = coursesData || [];
  const instructors = instructorsData || [];
  const lectures = lecturesData || [];

  const stats = {
    courses: courses.length,
    instructors: instructors.length,
    lectures: lectures.length,
  };
  const recentLectures = lectures.slice(0, 8);

  const statCards = [
    {
      label: "Total Courses",
      value: stats.courses,
      icon: BookOpen,
      boxBg: "#eff6ff",
      iconColor: "#3b82f6",
      waveColor: "rgba(59, 130, 246, 0.06)",
    },
    {
      label: "Instructors",
      value: stats.instructors,
      icon: Users,
      boxBg: "#f3e8ff",
      iconColor: "#a855f7",
      waveColor: "rgba(168, 85, 247, 0.06)",
    },
    {
      label: "Total Lectures",
      value: stats.lectures,
      icon: CalendarDays,
      boxBg: "#ecfdf5",
      iconColor: "#10b981",
      waveColor: "rgba(16, 185, 129, 0.06)",
    },
  ];

  const statusStyle = {
    Scheduled: { bg: "#eff6ff", text: "#2563eb", dot: "#3b82f6" },
    Completed: { bg: "#ecfdf5", text: "#059669", dot: "#10b981" },
    Cancelled: { bg: "#fef2f2", text: "#dc2626", dot: "#ef4444" },
  };

  return (
    <div className="page-container">
      {/* Top Bar / Header */}
      <div className="page-header" style={{ alignItems: "flex-start", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "var(--radius-md)",
            border: "1px solid var(--gray-200)", background: "var(--white)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--dark)"
          }}>
            <Menu size={18} />
          </div>
          <div>
            <h1 className="page-title" style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
              Dashboard
            </h1>
            <p className="page-subtitle" style={{ fontSize: 13, color: "var(--dark)", fontWeight: 600 }}>
              Overview of your lecture scheduling system
            </p>
          </div>
        </div>

        {/* Orange Theme Add Course Button */}
        <Link to="/admin/courses/add" className="btn btn-primary" style={{ padding: "10px 18px", fontSize: 14, gap: 8 }}>
          <BookOpen size={16} /> Add Course
        </Link>
      </div>

      {/* 3 Stat Cards Grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 20, marginBottom: 28
      }}>
        {statCards.map(({ label, value, icon: Icon, boxBg, iconColor, waveColor }) => (
          <div key={label} style={{
            background: "var(--white)", border: "1px solid var(--gray-200)",
            borderRadius: "var(--radius-lg)", padding: "24px 20px 20px",
            position: "relative", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            display: "flex", flexDirection: "column", justifyContent: "space-between"
          }}>
            {/* Wave background decor */}
            <svg
              style={{
                position: "absolute", right: -10, bottom: -10, width: 140, height: 100,
                pointerEvents: "none", zIndex: 0
              }}
              viewBox="0 0 140 100"
              fill="none"
            >
              <path
                d="M30 60 Q 60 10 110 50 T 150 90 L 150 120 L 0 120 Z"
                fill={waveColor}
              />
            </svg>

            {/* Top row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "var(--radius-md)",
                background: boxBg, display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Icon size={24} color={iconColor} />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--dark)", lineHeight: 1.1 }}>
                  {loading ? "..." : value}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--dark)", marginTop: 4 }}>
                  {label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Lectures Section */}
      <div style={{
        background: "var(--white)", border: "1px solid var(--gray-200)",
        borderRadius: "var(--radius-lg)", overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
      }}>
        {/* Section Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid var(--gray-200)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: "var(--radius-md)",
              background: "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--orange-500)"
            }}>
              <Calendar size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--orange-600)" }}>Recent Lectures</h2>
              <p style={{ fontSize: 13, color: "var(--dark)", fontWeight: 600 }}>Latest scheduled lectures across all courses</p>
            </div>
          </div>

          {/* Orange Theme View All Courses Button */}
          <Link
            to="/admin/courses"
            className="btn btn-secondary btn-sm"
            style={{
              padding: "8px 14px", color: "var(--orange-600)",
              borderColor: "var(--orange-200)", background: "var(--white)",
              fontWeight: 600, fontSize: 13, gap: 6
            }}
          >
            View all courses <ArrowRight size={14} />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="spinner" style={{ margin: "40px auto" }} />
        ) : recentLectures.length === 0 ? (
          <div className="empty-state" style={{ padding: "48px 0" }}>
            <Clock size={40} className="empty-state-icon" />
            <div className="empty-state-title">No lectures scheduled yet</div>
            <div className="empty-state-desc">Add a course and schedule lectures to see them here.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)" }}>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--dark)", textTransform: "uppercase", letterSpacing: "0.05em" }}>LECTURE</th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--dark)", textTransform: "uppercase", letterSpacing: "0.05em" }}>COURSE</th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--dark)", textTransform: "uppercase", letterSpacing: "0.05em" }}>BATCH</th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--dark)", textTransform: "uppercase", letterSpacing: "0.05em" }}>INSTRUCTOR</th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--dark)", textTransform: "uppercase", letterSpacing: "0.05em" }}>DATE</th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--dark)", textTransform: "uppercase", letterSpacing: "0.05em" }}>TIME</th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--dark)", textTransform: "uppercase", letterSpacing: "0.05em" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentLectures.map(lec => {
                  const st = statusStyle[lec.status] || statusStyle.Scheduled;
                  return (
                    <tr key={lec.id} style={{ borderBottom: "1px solid var(--gray-200)" }}>
                      {/* LECTURE column */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: "var(--radius-md)",
                            background: "#eff6ff", color: "#2563eb",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0
                          }}>
                            <FileText size={18} />
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--dark)" }}>
                            {lec.lectureTitle}
                          </div>
                        </div>
                      </td>

                      {/* COURSE column */}
                      <td style={{ padding: "16px 20px", fontWeight: 700, fontSize: 13, color: "var(--dark)" }}>
                        {lec.courseName || "—"}
                      </td>

                      {/* BATCH column */}
                      <td style={{ padding: "16px 20px" }}>
                        <span className="badge badge-orange" style={{ fontSize: 11, padding: "4px 10px" }}>
                          {lec.batch}
                        </span>
                      </td>

                      {/* INSTRUCTOR column */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: "var(--blue-bg)", color: "var(--blue)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12
                          }}>
                            <User size={14} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "var(--dark)" }}>
                            {lec.instructorName || "—"}
                          </span>
                        </div>
                      </td>

                      {/* DATE column */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--dark)", fontWeight: 600 }}>
                          <CalendarDays size={14} color="var(--dark)" />
                          <span>{lec.lectureDate}</span>
                        </div>
                      </td>

                      {/* TIME column */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--dark)", fontWeight: 600 }}>
                          <Clock size={14} color="var(--dark)" />
                          <span>{lec.startTime} - {lec.endTime}</span>
                        </div>
                      </td>

                      {/* STATUS column */}
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          background: st.bg, color: st.text,
                          padding: "4px 12px", borderRadius: "var(--radius-full)",
                          fontSize: 12, fontWeight: 700
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
                          {lec.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
