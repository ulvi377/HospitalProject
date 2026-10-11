
import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ClipboardList,
  HeartPulse,
  FileText,
  Clock,
  UserRound,
  LogOut,
  Stethoscope,
  X,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const menuItems = [
  { label: "Dashboard", path: "/doctor", icon: LayoutDashboard, end: true },
  { label: "Appointments", path: "/doctor/appointments", icon: CalendarDays },
  { label: "Patients", path: "/doctor/patients", icon: Users },
  { label: "Medical Records", path: "/doctor/medical-records", icon: ClipboardList },
  { label: "Pain Assessments", path: "/doctor/pain-assessments", icon: HeartPulse },
  { label: "Prescriptions", path: "/doctor/prescriptions", icon: FileText },
  { label: "Schedule", path: "/doctor/schedule", icon: Clock },
  { label: "Profile", path: "/doctor/profile", icon: UserRound },
];

const styles = `
.doctor-sidebar, .doctor-sidebar * { box-sizing: border-box; }

.doctor-sidebar {
  width: 235px;
  min-width: 235px;
  min-height: 100vh;
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 16px 12px 10px;
  overflow-y: auto;
  flex-shrink: 0;
  color: #e8edf7;
  background: radial-gradient(circle at top left, #203658, transparent 42%), #101827;
  border-right: 1px solid #ffffff10;
  font-family: Inter, Arial, sans-serif;
}

.doctor-sidebar .ds-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 3px 5px 17px;
}

.doctor-sidebar .ds-logo {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  color: white;
  background: linear-gradient(135deg, #5894ff, #3559d9);
  border-radius: 12px;
  flex-shrink: 0;
}

.doctor-sidebar .ds-brand h2 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 800;
  color: white;
}

.doctor-sidebar .ds-brand span {
  color: #8fa2bf;
  font-size: 8px;
  letter-spacing: 1px;
  font-weight: 700;
}

.doctor-sidebar .ds-divider {
  height: 1px;
  background: #ffffff12;
  margin: 0 4px 18px;
}

.doctor-sidebar .ds-title {
  margin: 0 0 9px 9px;
  color: #8495ae;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.doctor-sidebar .ds-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.doctor-sidebar .ds-link {
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 11px;
  color: #b8c5d9;
  text-decoration: none;
  font-size: 12px;
  font-weight: 550;
  border: 1px solid transparent;
  border-radius: 10px;
  transition: .2s;
}

.doctor-sidebar .ds-link:hover {
  color: white;
  background: #ffffff0b;
}

.doctor-sidebar .ds-link.active {
  color: white;
  border-color: #709cff30;
  background: linear-gradient(100deg, #3b82f63b, #3b82f60d);
  box-shadow: inset 3px 0 #75a2ff;
}

.doctor-sidebar .ds-link-icon {
  display: grid;
  place-items: center;
  width: 21px;
  flex-shrink: 0;
  color: #91a3bd;
}

.doctor-sidebar .ds-link.active .ds-link-icon,
.doctor-sidebar .ds-link:hover .ds-link-icon {
  color: #8eb4ff;
}

.doctor-sidebar .ds-bottom {
  margin-top: auto;
  padding-top: 20px;
}

.doctor-sidebar .ds-status {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 9px;
  margin-bottom: 10px;
  border: 1px solid #ffffff10;
  border-radius: 11px;
  background: #ffffff06;
}

.doctor-sidebar .ds-status-icon {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  color: #66ddb0;
  background: #34d39919;
  border-radius: 9px;
}

.doctor-sidebar .ds-status strong {
  display: block;
  color: #e2eaf6;
  font-size: 10px;
  margin-bottom: 4px;
}

.doctor-sidebar .ds-status small {
  color: #8798b1;
  font-size: 9px;
}

.doctor-sidebar .ds-user {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 9px;
  border: 1px solid #ffffff12;
  border-radius: 11px;
  background: #ffffff08;
}

.doctor-sidebar .ds-avatar {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  flex-shrink: 0;
  color: white;
  background: linear-gradient(135deg, #4388f4, #7658d7);
  font-weight: 800;
  font-size: 13px;
}

.doctor-sidebar .ds-user-info {
  flex: 1;
  min-width: 0;
}

.doctor-sidebar .ds-user-info strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #f4f7fc;
  font-size: 11px;
  margin-bottom: 5px;
}

.doctor-sidebar .ds-user-info span {
  display: block;
  color: #9baac0;
  font-size: 9px;
}

.doctor-sidebar .ds-logout {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  margin-top: 8px;
  border: 1px solid #f8717124;
  border-radius: 10px;
  color: #ffb9b9;
  background: #ef44440d;
  cursor: pointer;
  font-size: 11px;
  font-weight: 650;
  transition: .2s;
}

.doctor-sidebar .ds-logout:hover {
  background: #ef444425;
  border-color: #f8717160;
}

.doctor-sidebar .ds-version {
  display: flex;
  justify-content: space-between;
  gap: 5px;
  padding: 12px 3px 0;
  color: #65748a;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: .5px;
}

.ds-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: grid;
  place-items: center;
  padding: 20px;
  background: #050c19b8;
  backdrop-filter: blur(5px);
}

.ds-modal {
  position: relative;
  width: 100%;
  max-width: 380px;
  padding: 27px;
  border-radius: 18px;
  background: white;
  color: #172033;
  box-shadow: 0 25px 80px #0003;
}

.ds-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 9px;
  color: #667085;
  background: #f1f4f8;
  cursor: pointer;
}

.ds-modal-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  margin-bottom: 16px;
  border-radius: 13px;
  color: #dc4c4c;
  background: #fff0f0;
}

.ds-modal h2 {
  margin: 0 0 9px;
  font-size: 23px;
}

.ds-modal p {
  margin: 0;
  color: #707b8d;
  font-size: 12px;
  line-height: 1.7;
}

.ds-modal-actions {
  display: flex;
  gap: 9px;
  margin-top: 22px;
}

.ds-modal-actions button {
  flex: 1;
  min-height: 40px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.ds-cancel {
  color: #475569;
  border: 1px solid #e0e5ed;
  background: white;
}

.ds-confirm {
  color: white;
  border: 1px solid #dc4c4c;
  background: #dc4c4c;
}

@media (max-width: 850px) {
  .doctor-sidebar {
    width: 215px;
    min-width: 215px;
  }
}

@media (max-height: 760px) {
  .doctor-sidebar { padding-top: 9px; }
  .doctor-sidebar .ds-brand { padding-bottom: 10px; }
  .doctor-sidebar .ds-divider { margin-bottom: 10px; }
  .doctor-sidebar .ds-link { min-height: 36px; }
  .doctor-sidebar .ds-nav { gap: 2px; }
  .doctor-sidebar .ds-bottom { padding-top: 10px; }
}
`;

export default function DoctorSidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const name =
    user?.fullName ||
    user?.name ||
    user?.email ||
    "Doctor";

  const initial = name.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    setShowLogout(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      <style>{styles}</style>

      <aside className="doctor-sidebar">
        <div className="ds-brand">
          <div className="ds-logo">
            <Stethoscope size={23} />
          </div>

          <div>
            <h2>Hospital</h2>
            <span>DOCTOR PORTAL</span>
          </div>
        </div>

        <div className="ds-divider" />

        <p className="ds-title">DOCTOR WORKSPACE</p>

        <nav className="ds-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `ds-link ${isActive ? "active" : ""}`
                }
              >
                <span className="ds-link-icon">
                  <Icon size={18} strokeWidth={1.8} />
                </span>

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="ds-bottom">
          <div className="ds-status">
            <span className="ds-status-icon">
              <Stethoscope size={17} />
            </span>

            <div>
              <strong>Doctor Workspace</strong>
              <small>Medical portal</small>
            </div>
          </div>

          <div className="ds-user">
            <div className="ds-avatar">{initial}</div>

            <div className="ds-user-info">
              <strong title={name}>{name}</strong>
              <span>Doctor account</span>
            </div>
          </div>

          <button
            type="button"
            className="ds-logout"
            onClick={() => setShowLogout(true)}
          >
            <LogOut size={16} />
            Sign out
          </button>

          <div className="ds-version">
            <span>HOSPITAL HMS</span>
            <span>DOCTOR PORTAL</span>
          </div>
        </div>
      </aside>

      {showLogout && (
        <div
          className="ds-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLogout(false);
            }
          }}
        >
          <section
            className="ds-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ds-modal-title"
          >
            <button
              className="ds-modal-close"
              type="button"
              onClick={() => setShowLogout(false)}
              aria-label="Close"
            >
              <X size={17} />
            </button>

            <div className="ds-modal-icon">
              <LogOut size={23} />
            </div>

            <h2 id="ds-modal-title">Sign out?</h2>

            <p>
              Are you sure you want to sign out of your doctor account?
            </p>

            <div className="ds-modal-actions">
              <button
                className="ds-cancel"
                type="button"
                onClick={() => setShowLogout(false)}
              >
                Cancel
              </button>

              <button
                className="ds-confirm"
                type="button"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
