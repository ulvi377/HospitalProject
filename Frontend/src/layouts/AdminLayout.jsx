import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;