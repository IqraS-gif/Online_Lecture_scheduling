import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import AdminLayout from "./components/Layout/AdminLayout";
import InstructorLayout from "./components/Layout/InstructorLayout";
import Dashboard from "./pages/admin/Dashboard";
import Instructors from "./pages/admin/Instructors";
import Courses from "./pages/admin/Courses";
import AddCourse from "./pages/admin/AddCourse";
import CourseDetail from "./pages/admin/CourseDetail";
import CalendarView from "./pages/admin/CalendarView";
import MyLectures from "./pages/instructor/MyLectures";
import InstructorCalendarView from "./pages/instructor/InstructorCalendarView";

function ProtectedRoute({ children, role }) {
  const { profile, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!profile) return <Navigate to="/login" replace />;
  if (role && profile.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { profile, loading } = useAuth();

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <Routes>
      <Route path="/login" element={
        profile
          ? <Navigate to={profile.role === "admin" ? "/admin/dashboard" : "/instructor/lectures"} replace />
          : <Login />
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="instructors" element={<Instructors />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/add" element={<AddCourse />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="calendar" element={<CalendarView />} />
      </Route>

      {/* Instructor Routes */}
      <Route path="/instructor" element={
        <ProtectedRoute role="instructor"><InstructorLayout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="lectures" replace />} />
        <Route path="lectures" element={<MyLectures />} />
        <Route path="calendar" element={<InstructorCalendarView />} />
      </Route>

      <Route path="/" element={
        profile
          ? <Navigate to={profile.role === "admin" ? "/admin/dashboard" : "/instructor/lectures"} replace />
          : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
