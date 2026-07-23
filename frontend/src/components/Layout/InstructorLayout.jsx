import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";

export default function InstructorLayout() {
  return (
    <div className="app-layout">
      <Sidebar role="instructor" />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
