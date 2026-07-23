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
      {/* Left Warm Aesthetic Panel */}
      <div className="login-left">
        {/* Top-Left Organic Layered Wave SVG */}
        <svg className="login-bg-wave-tl-svg" viewBox="0 0 500 500" fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveTl1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="waveTl2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#ffedd5" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <path d="M-20 -20 L400 -20 Q300 130 180 190 Q60 250 -20 380 Z" fill="url(#waveTl1)" />
          <path d="M-20 -20 L480 -20 Q370 170 230 230 Q90 290 -20 460 Z" fill="url(#waveTl2)" />
          <path d="M-20 120 Q160 140 260 60" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Bottom-Right Organic Layered Wave SVG with Contour Lines */}
        <svg className="login-bg-wave-br-svg" viewBox="0 0 600 600" fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveBr1" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="waveBr2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="waveBr3" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#fff7ed" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path d="M620 620 L620 180 Q440 340 310 420 Q150 500 -20 620 Z" fill="url(#waveBr1)" />
          <path d="M620 620 L620 90 Q380 270 230 370 Q70 470 -90 620 Z" fill="url(#waveBr2)" />
          <path d="M620 620 L620 0 Q320 210 150 330 Q-30 430 -160 620 Z" fill="url(#waveBr3)" />
          <path d="M580 250 Q410 370 270 450 Q130 530 -20 610" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
          <path d="M580 290 Q430 400 290 480 Q150 560 10 630" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Floating Center Hero Card */}
        <div className="login-hero-card">
          {/* Card Decorative Accents */}
          <div className="login-dot-grid-left" />
          <div className="login-dot-grid-right" />
          <svg className="login-card-arc-tr" viewBox="0 0 160 160" fill="none">
            <circle cx="120" cy="40" r="70" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />
            <circle cx="120" cy="40" r="4" fill="#ea580c" opacity="0.8" />
          </svg>

          {/* Logo Badge */}
          <div className="login-hero-logo-wrapper">
            <div className="login-hero-logo-badge">
              <GraduationCap size={34} color="#fff" />
            </div>
          </div>

          {/* Title with Underline Accent */}
          <h1 className="login-hero-title">
            Lec<span className="text-orange-highlight">Schedule</span>
          </h1>
          <div className="login-title-underline" />

          {/* Subtitle */}
          <p className="login-hero-subtitle">
            Manage your courses, assign lectures to instructors,
            and prevent scheduling conflicts — all in one place.
          </p>

          {/* 3 Feature Cards Grid */}
          <div className="login-hero-features-grid">
            <div className="login-hero-feature-card">
              <div className="login-hero-feature-icon-badge">
                <BookOpen size={20} color="#ea580c" />
              </div>
              <div className="login-hero-feature-label">
                Course &amp; Batch<br />Management
              </div>
              <div className="login-hero-feature-dot" />
            </div>

            <div className="login-hero-feature-card">
              <div className="login-hero-feature-icon-badge">
                <Users size={20} color="#ea580c" />
              </div>
              <div className="login-hero-feature-label">
                Instructor<br />Assignment
              </div>
              <div className="login-hero-feature-dot" />
            </div>

            <div className="login-hero-feature-card">
              <div className="login-hero-feature-icon-badge">
                <CalendarCheck size={20} color="#ea580c" />
              </div>
              <div className="login-hero-feature-label">
                Smart Conflict<br />Detection
              </div>
              <div className="login-hero-feature-dot" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Sign In Panel */}
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
