import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";

export default function AdminLayout() {
  return (
    <div className="app-layout">
      <Sidebar role="admin" />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
