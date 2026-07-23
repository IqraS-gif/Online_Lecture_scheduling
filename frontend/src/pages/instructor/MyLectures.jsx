import { CalendarDays, Clock, BookOpen, GraduationCap } from "lucide-react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useCache } from "../../context/DataCacheContext";

export default function MyLectures() {
  const { profile } = useAuth();
  const { data: lecturesData, loading } = useCache(
    `lectures:instructor:${profile?.uid}`,
    () => api.get(`/lectures/instructor/${profile?.uid}`).then(r => r.data),
    { skip: !profile?.uid }
  );
  const lectures = lecturesData || [];

  const statusClass = {
    Scheduled: "badge status-Scheduled",
    Completed:  "badge status-Completed",
    Cancelled:  "badge status-Cancelled",
  };

  // Group lectures by date
  const grouped = lectures.reduce((acc, lec) => {
    const date = lec.lectureDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(lec);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Lectures</h1>
          <p className="page-subtitle">
            All lectures assigned to you, grouped by date
          </p>
        </div>
        <span className="badge badge-blue" style={{ fontSize: 13, padding: "6px 14px" }}>
          {lectures.length} lecture{lectures.length !== 1 ? "s" : ""} total
        </span>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : lectures.length === 0 ? (
        <div className="empty-state">
          <GraduationCap size={48} className="empty-state-icon" />
          <div className="empty-state-title">No lectures assigned yet</div>
          <div className="empty-state-desc">
            The admin will assign lectures to you soon.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {sortedDates.map(date => (
            <div key={date} className="card">
              <div className="card-header">
                <span
                  className="card-title"
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <CalendarDays size={17} color="var(--orange-500)" />
                  {new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="badge badge-orange">
                  {grouped[date].length} lecture{grouped[date].length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Course</th>
                      <th>Batch</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[date].map(lec => (
                      <tr key={lec.id}>
                        <td style={{ fontWeight: 600, color: "var(--dark)" }}>
                          {lec.lectureTitle}
                        </td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <BookOpen size={13} color="var(--orange-500)" />
                            {lec.courseName || "—"}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-purple">{lec.batch}</span>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
