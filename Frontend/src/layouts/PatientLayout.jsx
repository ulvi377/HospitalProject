
import { useContext, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Stethoscope,
  ClipboardList,
  FileText,
  Bell,
  UserRound,
  HeartPulse,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Star,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const menuItems = [
  { title: "Dashboard", path: "/patient", icon: LayoutDashboard, end: true },
  { title: "Həkimlər", path: "/patient/doctors", icon: Stethoscope },
  { title: "Qəbullarım", path: "/patient/appointments", icon: CalendarDays },
  {
    title: "Qəbul təyin et",
    path: "/patient/book-appointment",
    icon: ClipboardList,
  },
  {
    title: "Tibbi tarixçə",
    path: "/patient/medical-history",
    icon: HeartPulse,
  },
  { title: "Reseptlərim", path: "/patient/prescriptions", icon: FileText },
  { title: "Rəylərim", path: "/patient/ratings", icon: Star },
  { title: "Bildirişlər", path: "/patient/notifications", icon: Bell },
  { title: "Profilim", path: "/patient/profile", icon: UserRound },
];

const styles = `
.patient-layout {
  min-height: 100vh;
  background: #f5f7fb;
  color: #172b4d;
  font-family: inherit;
}
.patient-sidebar {
  width: 260px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding: 25px 17px 18px;
  background: #fff;
  border-right: 1px solid #e9edf5;
  overflow-y: auto;
  box-sizing: border-box;
}
.patient-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 5px 29px;
}
.patient-brand-icon {
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #1769e0, #1246a0);
  box-shadow: 0 6px 16px #1769e033;
}
.patient-brand-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.patient-brand-text strong {
  font-size: 15px;
  color: #172b4d;
  font-weight: 800;
}
.patient-brand-text span {
  font-size: 11px;
  color: #8491a7;
}
.patient-menu-label {
  padding: 0 12px;
  margin-bottom: 12px;
  color: #9aa6b8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.3px;
}
.patient-nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.patient-nav-link {
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border-radius: 11px;
  color: #697891;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: background .2s ease, color .2s ease;
}
.patient-nav-link:hover {
  color: #1769e0;
  background: #f2f6ff;
}
.patient-nav-link.active {
  color: #1769e0;
  background: #eaf2ff;
  font-weight: 750;
}
.patient-nav-chevron {
  margin-left: auto;
  opacity: 0;
}
.patient-nav-link.active .patient-nav-chevron {
  opacity: 1;
}
.patient-sidebar-bottom {
  margin-top: auto;
  padding-top: 25px;
}
.patient-help-card {
  padding: 16px;
  border: 1px solid #e4edff;
  background: linear-gradient(145deg, #f5f8ff, #edf4ff);
  border-radius: 14px;
}
.patient-help-icon {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1769e0;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 11px;
}
.patient-help-card strong {
  display: block;
  color: #1c355d;
  font-size: 12px;
  margin-bottom: 7px;
}
.patient-help-card p {
  color: #71819b;
  font-size: 11px;
  line-height: 1.6;
  margin: 0;
}
.patient-logout-button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 14px;
  padding: 13px 12px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #d34e5a;
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}
.patient-logout-button:hover {
  background: #fff1f2;
}
.patient-main {
  min-height: 100vh;
  margin-left: 260px;
  min-width: 0;
}
.patient-topbar {
  min-height: 86px;
  padding: 0 35px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #fff;
  border-bottom: 1px solid #e9edf5;
  box-sizing: border-box;
}
.patient-topbar-left {
  display: flex;
  align-items: center;
  gap: 13px;
}
.patient-topbar-eyebrow {
  color: #8b9ab0;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
}
.patient-topbar h2 {
  color: #172b4d;
  font-size: 19px;
  font-weight: 800;
  margin: 5px 0 0;
}
.patient-user {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}
.patient-user-avatar {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1769e0;
  background: #eaf2ff;
}
.patient-user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 190px;
}
.patient-user-info strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #233957;
  font-size: 12px;
}
.patient-user-info span {
  color: #8b9ab0;
  font-size: 11px;
}
.patient-page-content {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 30px 35px 40px;
  box-sizing: border-box;
}
.patient-mobile-menu,
.patient-mobile-close,
.patient-sidebar-overlay {
  display: none;
}
@media (max-width: 1000px) {
  .patient-sidebar { width: 250px; }
  .patient-main { margin-left: 250px; }
  .patient-page-content { padding: 25px 22px 35px; }
  .patient-topbar { padding: 0 22px; }
}
@media (max-width: 760px) {
  .patient-sidebar {
    width: 270px;
    transform: translateX(-100%);
    transition: transform .25s ease;
    box-shadow: none;
  }
  .patient-sidebar.patient-sidebar-open {
    transform: translateX(0);
    box-shadow: 15px 0 45px #13264726;
  }
  .patient-sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 99;
    background: #0f1c316b;
  }
  .patient-main { margin-left: 0; }
  .patient-topbar { min-height: 75px; padding: 0 16px; }
  .patient-mobile-menu,
  .patient-mobile-close {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    cursor: pointer;
  }
  .patient-mobile-menu {
    width: 38px;
    height: 38px;
    color: #344b6b;
    background: #f2f5fa;
    border-radius: 10px;
  }
  .patient-mobile-close {
    margin-left: auto;
    width: 32px;
    height: 32px;
    color: #64748b;
    background: #f2f5fa;
    border-radius: 9px;
  }
  .patient-brand { flex-wrap: wrap; }
  .patient-topbar h2 { font-size: 16px; }
  .patient-topbar-eyebrow { font-size: 8px; }
  .patient-user-info { display: none; }
  .patient-page-content { padding: 20px 15px 30px; }
}
`;

export default function PatientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName =
    user?.name || user?.fullName || user?.email || "Pasiyent";

  return (
    <>
      <style>{styles}</style>

      <div className="patient-layout">
        {sidebarOpen && (
          <div
            className="patient-sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`patient-sidebar ${
            sidebarOpen ? "patient-sidebar-open" : ""
          }`}
        >
          <div className="patient-brand">
            <div className="patient-brand-icon">
              <HeartPulse size={25} />
            </div>

            <div className="patient-brand-text">
              <strong>Avropa Hospital</strong>
              <span>Pasiyent paneli</span>
            </div>

            <button
              type="button"
              className="patient-mobile-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Menyunu bağla"
            >
              <X size={20} />
            </button>
          </div>

          <div className="patient-menu-label">ƏSAS MENYU</div>

          <nav className="patient-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `patient-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={19} strokeWidth={1.9} />
                  <span>{item.title}</span>
                  <ChevronRight
                    className="patient-nav-chevron"
                    size={16}
                  />
                </NavLink>
              );
            })}
          </nav>

          <div className="patient-sidebar-bottom">
            <div className="patient-help-card">
              <div className="patient-help-icon">
                <HeartPulse size={20} />
              </div>

              <strong>Sağlamlığınız önəmlidir</strong>

              <p>
                Sağlamlığınızla bağlı məlumatlarınızı buradan izləyin.
              </p>
            </div>

            <button
              type="button"
              className="patient-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={19} />
              <span>Hesabdan çıxış</span>
            </button>
          </div>
        </aside>

        <main className="patient-main">
          <header className="patient-topbar">
            <div className="patient-topbar-left">
              <button
                type="button"
                className="patient-mobile-menu"
                onClick={() => setSidebarOpen(true)}
                aria-label="Menyunu aç"
              >
                <Menu size={23} />
              </button>

              <div>
                <span className="patient-topbar-eyebrow">
                  AVROPA HOSPITAL
                </span>
                <h2>Pasiyent kabineti</h2>
              </div>
            </div>

            <div className="patient-user">
              <div className="patient-user-avatar">
                <UserRound size={21} />
              </div>

              <div className="patient-user-info">
                <strong>{displayName}</strong>
                <span>Pasiyent</span>
              </div>
            </div>
          </header>

          <div className="patient-page-content">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
