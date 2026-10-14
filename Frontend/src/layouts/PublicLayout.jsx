
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const PublicLayout = () => {
  return (
    <div className="public-layout flex min-h-screen flex-col">
      <Navbar />

      <main className="public-main flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default PublicLayout;
