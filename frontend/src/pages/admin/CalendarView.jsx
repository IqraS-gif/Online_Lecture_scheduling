import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, Users, BookOpen, X, GraduationCap
} from "lucide-react";
import api from "../../api";
import { useCache } from "../../context/DataCacheContext";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: lecturesData, loading } = useCache("lectures", () => api.get("/lectures").then(r => r.data));
  const lectures = lecturesData || [];

  // Selected date modal state
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [selectedDayLectures, setSelectedDayLectures] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  // Date math
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Navigation handlers
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const todayStr = new Date().toISOString().split("T")[0];

  // Group lectures by YYYY-MM-DD
  const lecturesByDate = {};
  lectures.forEach(lec => {
    if (!lecturesByDate[lec.lectureDate]) {
      lecturesByDate[lec.lectureDate] = [];
    }
    lecturesByDate[lec.lectureDate].push(lec);
  });

  // Build grid items
  const gridCells = [];

  // 1. Prev month padding days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const pDate = new Date(year, month - 1, dayNum);
    const dateStr = pDate.toISOString().split("T")[0];
    gridCells.push({
      dayNum,
      dateStr,
      isCurrentMonth: false,
      lectures: lecturesByDate[dateStr] || [],
    });
  }

  // 2. Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const mStr = String(month + 1).padStart(2, "0");
    const dStr = String(dayNum).padStart(2, "0");
    const dateStr = `${year}-${mStr}-${dStr}`;
    gridCells.push({
      dayNum,
      dateStr,
      isCurrentMonth: true,
      lectures: lecturesByDate[dateStr] || [],
    });
  }

  // 3. Next month padding days to fill 5 or 6 rows (35 or 42 total cells)
  const totalCellsSoFar = gridCells.length;
  const totalCells = totalCellsSoFar > 35 ? 42 : 35;
  const rowCount = totalCells / 7;

  for (let i = 1; i <= totalCells - totalCellsSoFar; i++) {
    const nDate = new Date(year, month + 1, i);
    const dateStr = nDate.toISOString().split("T")[0];
    gridCells.push({
      dayNum: i,
      dateStr,
      isCurrentMonth: false,
      lectures: lecturesByDate[dateStr] || [],
    });
  }

  const handleCellClick = (cell) => {
    if (cell.lectures.length > 0) {
      setSelectedDateStr(cell.dateStr);
      setSelectedDayLectures(cell.lectures);
    }
  };

  return (
    <div style={{
      height: "calc(100vh - 32px)",
      display: "flex",
      flexDirection: "column",
      padding: "16px 24px",
      boxSizing: "border-box",
      overflow: "hidden"
    }}>
      {/* Top Header & Controls */}
      <div className="page-header" style={{ marginBottom: 12, flexShrink: 0 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 24 }}>Lecture Calendar</h1>
          <p className="page-subtitle" style={{ fontSize: 13 }}>Visual monthly schedule of all lectures</p>
        </div>

        {/* Month Navigation Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={goToday}>
            Today
          </button>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--white)", border: "1px solid var(--gray-200)",
            borderRadius: "var(--radius-md)", padding: "3px 6px"
          }}>
            <button
              onClick={prevMonth}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 3, display: "flex", alignItems: "center", color: "var(--dark)"
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{
              fontWeight: 800, fontSize: 15, color: "var(--dark)",
              minWidth: 120, textAlign: "center"
            }}>
              {monthName} {year}
            </span>
            <button
              onClick={nextMonth}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 3, display: "flex", alignItems: "center", color: "var(--dark)"
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: "auto" }} />
      ) : (
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          background: "var(--white)",
          border: "1px solid var(--gray-200)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
        }}>
          {/* Weekday Columns Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            background: "var(--gray-50)",
            borderBottom: "1px solid var(--gray-200)",
            flexShrink: 0
          }}>
            {WEEKDAYS.map(day => (
              <div key={day} style={{
                padding: "8px 4px", textAlign: "center",
                fontSize: 11, fontWeight: 800, color: "var(--dark)",
                textTransform: "uppercase", letterSpacing: "0.05em"
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Month Calendar Grid (Fits Screen 100%) */}
          <div style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gridTemplateRows: `repeat(${rowCount}, 1fr)`,
            minHeight: 0
          }}>
            {gridCells.map((cell, idx) => {
              const isToday = cell.dateStr === todayStr;
              const hasLectures = cell.lectures.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => handleCellClick(cell)}
                  style={{
                    borderRight: (idx + 1) % 7 === 0 ? "none" : "1px solid var(--gray-200)",
                    borderBottom: idx >= totalCells - 7 ? "none" : "1px solid var(--gray-200)",
                    padding: "4px 6px",
                    background: !cell.isCurrentMonth
                      ? "var(--gray-50)"
                      : isToday
                      ? "var(--orange-50)"
                      : "var(--white)",
                    opacity: cell.isCurrentMonth ? 1 : 0.45,
                    cursor: hasLectures ? "pointer" : "default",
                    transition: "background 0.15s ease",
                    minHeight: 0,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  {/* Day Number Header */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 4, flexShrink: 0
                  }}>
                    <span style={{
                      fontWeight: isToday ? 800 : 700,
                      fontSize: 12,
                      color: isToday ? "var(--white)" : "var(--dark)",
                      background: isToday ? "var(--orange-500)" : "transparent",
                      width: isToday ? 22 : "auto", height: isToday ? 22 : "auto",
                      borderRadius: "50%",
                      display: "inline-flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {cell.dayNum}
                    </span>

                    {hasLectures && (
                      <span className="badge badge-orange" style={{ fontSize: 9, padding: "1px 5px" }}>
                        {cell.lectures.length} {cell.lectures.length === 1 ? "lec" : "lecs"}
                      </span>
                    )}
                  </div>

                  {/* Compact Lecture Chips in Day Cell */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, overflow: "hidden" }}>
                    {cell.lectures.map(lec => (
                      <div
                        key={lec.id}
                        style={{
                          background: "var(--white)",
                          border: "1.5px solid var(--orange-300, #fed7aa)",
                          borderLeft: "3.5px solid var(--orange-500)",
                          borderRadius: "var(--radius-sm)",
                          padding: "4px 6px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                          overflow: "hidden"
                        }}
                      >
                        {/* Course & Title */}
                        <div style={{
                          fontWeight: 800, fontSize: 11, color: "var(--dark)", lineHeight: 1.1,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                        }}>
                          {lec.courseName ? `${lec.courseName} (${lec.lectureTitle})` : lec.lectureTitle}
                        </div>

                        {/* Instructor & Time */}
                        <div style={{
                          fontSize: 10, fontWeight: 700, color: "var(--orange-600)",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          marginTop: 2, whiteSpace: "nowrap"
                        }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 3, overflow: "hidden", textOverflow: "ellipsis" }}>
                            <Users size={10} />
                            {lec.instructorName || "Unassigned"}
                          </span>
                          <span style={{ color: "var(--dark)", fontSize: 9, fontWeight: 600, marginLeft: 4 }}>
                            {lec.startTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Date Lecture Detail Modal */}
      {selectedDateStr && (
        <div className="modal-overlay" onClick={() => setSelectedDateStr(null)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "var(--radius-md)",
                  background: "var(--orange-50)", color: "var(--orange-500)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <div className="modal-title" style={{ fontSize: 18 }}>
                    Lectures for {selectedDateStr}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--dark)", fontWeight: 600 }}>
                    {selectedDayLectures.length} lecture{selectedDayLectures.length !== 1 ? "s" : ""} scheduled
                  </div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedDateStr(null)}>
                <X size={15} />
              </button>
            </div>

            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {selectedDayLectures.map(lec => (
                <div
                  key={lec.id}
                  style={{
                    background: "var(--white)",
                    border: "1px solid var(--gray-200)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: "var(--dark)" }}>
                      {lec.lectureTitle}
                    </span>
                    <span className="badge badge-orange">{lec.batch}</span>
                  </div>

                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--dark)", fontWeight: 600 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <BookOpen size={14} color="var(--orange-500)" />
                      {lec.courseName || "—"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Users size={14} color="var(--purple)" />
                      {lec.instructorName || "—"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={14} />
                      {lec.startTime} – {lec.endTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDateStr(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
