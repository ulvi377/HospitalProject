
import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Building2,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  UserRound,
  LogOut,
  ShieldCheck,
  X,
  ArrowRight,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const menuItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Doctors", path: "/admin/doctors", icon: Stethoscope },
  { label: "Patients", path: "/admin/patients", icon: Users },
  { label: "Specialties", path: "/admin/specialties", icon: Building2 },
  { label: "Doctor Schedules", path: "/admin/doctor-schedules", icon: CalendarDays },
  { label: "Appointments", path: "/admin/appointments", icon: ClipboardList },
  { label: "Pain Areas", path: "/admin/pain-areas", icon: HeartPulse },
  { label: "Users", path: "/admin/users", icon: UserRound },
];

const styles = `
.admin-sidebar {
  width: 230px;
  min-width: 230px;
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 12px 11px 7px;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  color: #e8edf7;
  background: radial-gradient(circle at top left, #1b2b49 0%, transparent 40%), #101827;
  border-right: 1px solid rgba(255,255,255,.07);
  font-family: Inter, system-ui, sans-serif;
  scrollbar-width: thin;
  scrollbar-color: #33425c transparent;
}

.admin-sidebar,
.admin-sidebar * {
  box-sizing: border-box;
}

.admin-sidebar .sidebar-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 5px 11px;
  flex-shrink: 0;
}

.admin-sidebar .logo-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 10px;
  color: white;
  font-size: 27px;
  font-weight: 400;
  background: linear-gradient(135deg, #5894ff, #3559d9);
  box-shadow: 0 4px 14px #3564df40;
}

.admin-sidebar .sidebar-brand h2 {
  margin: 0 0 3px;
  color: white;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -.5px;
}

.admin-sidebar .sidebar-brand span {
  color: #899bb7;
  font-size: 8px;
  letter-spacing: .8px;
  font-weight: 700;
}

.admin-sidebar .sidebar-divider {
  height: 1px;
  flex-shrink: 0;
  margin: 0 4px 11px;
  background: rgba(255,255,255,.09);
}

.admin-sidebar .sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}

.admin-sidebar .sidebar-title {
  margin: 0 0 6px 9px;
  color: #7889a3;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.admin-sidebar .sidebar-link {
  min-height: 35px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: 9px;
  color: #b8c4d7;
  text-decoration: none;
  font-size: 11.5px;
  font-weight: 550;
  transition: background .2s ease, color .2s ease;
}

.admin-sidebar .sidebar-link:hover {
  color: white;
  background: rgba(255,255,255,.055);
}

.admin-sidebar .sidebar-link.active {
  color: white;
  border-color: rgba(99,145,255,.2);
  background: linear-gradient(100deg, #3b82f63d, #3b82f610);
  box-shadow: inset 3px 0 #6d9cff;
}

.admin-sidebar .sidebar-icon {
  width: 21px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #8b9bb4;
}

.admin-sidebar .sidebar-link.active .sidebar-icon,
.admin-sidebar .sidebar-link:hover .sidebar-icon {
  color: #8eb4ff;
}

.admin-sidebar .sidebar-link-label {
  flex: 1;
}

.admin-sidebar .sidebar-link-arrow {
  flex-shrink: 0;
  opacity: 0;
  color: #8eb4ff;
  transform: translateX(-3px);
  transition: all .2s ease;
}

.admin-sidebar .sidebar-link:hover .sidebar-link-arrow,
.admin-sidebar .sidebar-link.active .sidebar-link-arrow {
  opacity: 1;
  transform: translateX(0);
}

.admin-sidebar .sidebar-bottom {
  margin-top: auto;
  padding-top: 7px;
  flex-shrink: 0;
}

.admin-sidebar .sidebar-security {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
  padding: 7px 8px;
  border: 1px solid #ffffff0e;
  border-radius: 10px;
  background: #ffffff06;
}

.admin-sidebar .security-icon {
  width: 29px;
  height: 29px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 8px;
  color: #75ddb4;
  background: #34d39919;
}

.admin-sidebar .sidebar-security div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.admin-sidebar .sidebar-security strong {
  color: #e1e8f2;
  font-size: 10px;
}

.admin-sidebar .sidebar-security div span {
  color: #8492a8;
  font-size: 9px;
}

.admin-sidebar .sidebar-footer {
  padding: 8px;
  border: 1px solid #ffffff12;
  border-radius: 12px;
  background: #ffffff08;
}

.admin-sidebar .admin-user {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding-bottom: 7px;
}

.admin-sidebar .admin-avatar {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: 1px solid #ffffff25;
  border-radius: 9px;
  color: white;
  background: linear-gradient(145deg, #607df4, #8c65dc);
  font-size: 13px;
  font-weight: 800;
}

.admin-sidebar .admin-user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.admin-sidebar .admin-user-info strong {
  overflow: hidden;
  color: #f4f7fc;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-sidebar .admin-user-info span {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #9ba9bd;
  font-size: 9px;
}

.admin-sidebar .admin-online-dot {
  width: 6px;
  height: 6px;
  display: inline-block;
  flex-shrink: 0;
  border-radius: 50%;
  background: #42d7a0;
  box-shadow: 0 0 7px #42d7a075;
}

.admin-sidebar .admin-user-shield {
  color: #8faeff;
  flex-shrink: 0;
}

.admin-sidebar .sidebar-logout {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px;
  border: 1px solid #f871711f;
  border-radius: 9px;
  color: #ffb6b6;
  background: #ef44440e;
  text-align: left;
  cursor: pointer;
  transition: all .2s ease;
}

.admin-sidebar .sidebar-logout:hover {
  border-color: #f8717166;
  background: #ef444425;
}

.admin-sidebar .logout-icon {
  width: 29px;
  height: 29px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 8px;
  color: #ff8b8b;
  background: #ef44441f;
  transition: all .2s ease;
}

.admin-sidebar .sidebar-logout:hover .logout-icon {
  color: white;
  background: #dc4c4c;
}

.admin-sidebar .logout-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

.admin-sidebar .logout-text strong {
  color: #ffd1d1;
  font-size: 11px;
}

.admin-sidebar .logout-text small {
  color: #a98a91;
  font-size: 8px;
}

.admin-sidebar .logout-arrow {
  color: #c98289;
  flex-shrink: 0;
  transition: transform .2s ease;
}

.admin-sidebar .sidebar-logout:hover .logout-arrow {
  transform: translateX(3px);
}

.admin-sidebar .sidebar-version {
  display: flex;
  justify-content: space-between;
  gap: 5px;
  padding: 7px 3px 0;
  color: #65748a;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: .5px;
}

/* Logout modal */
.logout-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(5,12,25,.7);
  backdrop-filter: blur(7px);
  animation: logoutFadeIn .18s ease;
}

.logout-modal {
  position: relative;
  width: 100%;
  max-width: 390px;
  padding: 28px;
  border: 1px solid #e6eaf0;
  border-radius: 20px;
  background: white;
  color: #172033;
  box-shadow: 0 28px 90px #0003;
  animation: logoutModalIn .22s ease;
}

.logout-modal-close {
  position: absolute;
  top: 13px;
  right: 13px;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 9px;
  color: #778196;
  background: #f3f5f8;
  cursor: pointer;
}

.logout-modal-close:hover {
  color: #202b3c;
  background: #e9edf3;
}

.logout-modal-icon {
  width: 49px;
  height: 49px;
  display: grid;
  place-items: center;
  margin-bottom: 17px;
  border-radius: 14px;
  color: #dc4c4c;
  background: #fff0f0;
}

.logout-modal-eyebrow {
  color: #9aa3b3;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.logout-modal h2 {
  margin: 9px 0;
  color: #172033;
  font-size: 25px;
  letter-spacing: -.7px;
}

.logout-modal p {
  margin: 0;
  color: #707b8d;
  font-size: 12px;
  line-height: 1.8;
}

.logout-modal-actions {
  display: flex;
  gap: 9px;
  margin-top: 23px;
}

.logout-cancel-btn,
.logout-confirm-btn {
  min-height: 41px;
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s ease;
}

.logout-cancel-btn {
  border: 1px solid #e0e5ed;
  color: #475569;
  background: white;
}

.logout-cancel-btn:hover {
  background: #f5f7fa;
}

.logout-confirm-btn {
  border: 1px solid #dc4c4c;
  color: white;
  background: #dc4c4c;
  box-shadow: 0 5px 14px #dc4c4c29;
}

.logout-confirm-btn:hover {
  border-color: #c63737;
  background: #c63737;
}

@keyframes logoutFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes logoutModalIn {
  from { opacity: 0; transform: translateY(8px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-height: 800px) {
  .admin-sidebar {
    padding-top: 8px;
    padding-bottom: 5px;
  }

  .admin-sidebar .sidebar-logo {
    padding-bottom: 7px;
  }

  .admin-sidebar .sidebar-divider {
    margin-bottom: 7px;
  }

  .admin-sidebar .sidebar-title {
    margin-bottom: 4px;
  }

  .admin-sidebar .sidebar-link {
    min-height: 32px;
  }

  .admin-sidebar .sidebar-nav {
    gap: 1px;
  }

  .admin-sidebar .sidebar-bottom {
    padding-top: 4px;
  }

  .admin-sidebar .sidebar-security {
    margin-bottom: 4px;
    padding: 5px 7px;
  }

  .admin-sidebar .sidebar-footer {
    padding: 6px;
  }

  .admin-sidebar .admin-user {
    padding-bottom: 5px;
  }

  .admin-sidebar .sidebar-version {
    padding-top: 5px;
  }
}

@media (max-width: 900px) {
  .admin-sidebar {
    width: 220px;
    min-width: 220px;
  }

  .admin-sidebar .sidebar-link {
    font-size: 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .admin-sidebar *,
  .logout-modal-overlay,
  .logout-modal {
    animation: none !important;
    transition: none !important;
  }
}
`;

function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    logout();
    setConfirmLogout(false);
    navigate("/login", { replace: true });
  };

  const displayName = user?.name || user?.fullName || "Administrator";
  const displayRole = user?.role || "Admin";

  const avatarLetter = (
    user?.name || user?.fullName || user?.email || "A"
  ).charAt(0).toUpperCase();

  return (
    <>
      <style>{styles}</style>

      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">+</div>

          <div className="sidebar-brand">
            <h2>Hospital</h2>
            <span>MANAGEMENT SYSTEM</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          <p className="sidebar-title">WORKSPACE</p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <span className="sidebar-icon">
                  <Icon size={18} strokeWidth={1.8} />
                </span>

                <span className="sidebar-link-label">
                  {item.label}
                </span>

                <ArrowRight
                  className="sidebar-link-arrow"
                  size={14}
                />
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-security">
            <span className="security-icon">
              <ShieldCheck size={17} />
            </span>

            <div>
              <strong>Secure workspace</strong>
              <span>Admin access enabled</span>
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="admin-user">
              <div className="admin-avatar">{avatarLetter}</div>

              <div className="admin-user-info">
                <strong title={displayName}>{displayName}</strong>
                <span>
                  <i className="admin-online-dot" />
                  {displayRole}
                </span>
              </div>

              <span className="admin-user-shield">
                <ShieldCheck size={16} />
              </span>
            </div>

            <button
              type="button"
              className="sidebar-logout"
              onClick={() => setConfirmLogout(true)}
            >
              <span className="logout-icon">
                <LogOut size={17} />
              </span>

              <span className="logout-text">
                <strong>Sign out</strong>
                <small>Log out of your account</small>
              </span>

              <ArrowRight
                className="logout-arrow"
                size={15}
              />
            </button>
          </div>

          <div className="sidebar-version">
            <span>HOSPITAL HMS</span>
            <span>ADMIN PORTAL</span>
          </div>
        </div>
      </aside>

      {confirmLogout && (
        <div
          className="logout-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setConfirmLogout(false);
            }
          }}
        >
          <section
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
          >
            <button
              type="button"
              className="logout-modal-close"
              onClick={() => setConfirmLogout(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="logout-modal-icon">
              <LogOut size={24} />
            </div>

            <span className="logout-modal-eyebrow">
              SESSION MANAGEMENT
            </span>

            <h2 id="logout-modal-title">Sign out?</h2>

            <p>
              Are you sure you want to sign out of your Hospital admin account?
            </p>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-cancel-btn"
                onClick={() => setConfirmLogout(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm-btn"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default Sidebar;
