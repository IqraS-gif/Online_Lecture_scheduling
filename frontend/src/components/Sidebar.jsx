import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, BookOpen, LogOut, GraduationCap, Calendar
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const adminLinks = [
  { to: "/admin/dashboard",   label: "Dashboard",    icon: LayoutDashboard },
  { to: "/admin/instructors", label: "Instructors",   icon: Users },
  { to: "/admin/courses",     label: "Courses",       icon: BookOpen },
  { to: "/admin/calendar",    label: "Calendar",      icon: Calendar },
];

const instructorLinks = [
  { to: "/instructor/lectures", label: "My Lectures", icon: GraduationCap },
  { to: "/instructor/calendar", label: "My Calendar",  icon: Calendar },
];

export default function Sidebar({ role }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const links = role === "admin" ? adminLinks : instructorLinks;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const initials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <GraduationCap size={20} color="#fff" />
        </div>
        <div>
          <div className="sidebar-logo-text">LecSchedule</div>
          <div className="sidebar-logo-sub">
            {role === "admin" ? "Admin Panel" : "Instructor Portal"}
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{profile?.name || "User"}</div>
            <div className="sidebar-user-role" style={{ textTransform: "capitalize" }}>
              {profile?.role}
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
