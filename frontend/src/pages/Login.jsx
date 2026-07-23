import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, Mail, Lock, BookOpen, Users, CalendarCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const profile = await login(email.trim(), password);
      toast.success(`Welcome back, ${profile.name}!`);
      navigate(profile.role === "admin" ? "/admin/dashboard" : "/instructor/lectures");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Invalid email or password.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-brand-icon">
          <GraduationCap size={36} color="#fff" />
        </div>
        <h1 className="login-brand-title">LecSchedule</h1>
        <p className="login-brand-desc">
          Manage your courses, assign lectures to instructors,
          and prevent scheduling conflicts — all in one place.
        </p>
        <div className="login-features">
          <div className="login-feature">
            <div className="login-feature-icon">
              <BookOpen size={16} color="#f97316" />
            </div>
            Course &amp; batch management
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">
              <Users size={16} color="#a855f7" />
            </div>
            Instructor assignment
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">
              <CalendarCheck size={16} color="#22c55e" />
            </div>
            Smart conflict detection
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <h2 className="login-form-title">Welcome back</h2>
        <p className="login-form-sub">Sign in to continue to LecSchedule</p>

        {error && (
          <div className="alert alert-error" style={{ width: "100%", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-wrapper">
            <Mail size={16} className="login-input-icon" />
            <input
              id="login-email"
              type="email"
              className="login-input"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="login-input-wrapper">
            <Lock size={16} className="login-input-icon" />
            <input
              id="login-password"
              type="password"
              className="login-input"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            id="login-submit"
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: "16px", background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-lg)", width: "100%" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-700)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Click to auto-fill demo login:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: "space-between", width: "100%", padding: "8px 12px", background: "var(--white)" }}
              onClick={() => {
                setEmail("admin@lecschedule.com");
                setPassword("Password@123");
                setError("");
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--orange-600)" }}>Admin Account</span>
              <span style={{ fontSize: 11, color: "var(--gray-500)" }}>admin@lecschedule.com</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: "space-between", width: "100%", padding: "8px 12px", background: "var(--white)" }}
              onClick={() => {
                setEmail("rahul@lecschedule.com");
                setPassword("Password@123");
                setError("");
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--purple)" }}>Instructor Account</span>
              <span style={{ fontSize: 11, color: "var(--gray-500)" }}>rahul@lecschedule.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
