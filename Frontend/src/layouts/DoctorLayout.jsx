
import { Outlet } from "react-router-dom";
import DoctorSidebar from "../pages/doctor/DoctorSidebar";

export default function DoctorLayout() {
  return (
    <div style={styles.layout}>
      <DoctorSidebar />

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    width: "100%",
    minHeight: "100vh",
    background: "#f5f7fb",
  },

  main: {
    flex: 1,
    minWidth: 0,
    minHeight: "100vh",
    overflowX: "hidden",
  },
};
