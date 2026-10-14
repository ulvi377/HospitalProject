
import { useContext, useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarX,
  Users,
  ClipboardList,
  FileText,
  Clock,
  UserRound,
  LogOut,
  Stethoscope,
  X,
  Star,
  ChevronRight,
  Activity,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const menuItems = [
  {
    label: "Dashboard",
    path: "/doctor",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Appointments",
    path: "/doctor/appointments",
    icon: CalendarDays,
  },
  {
    label: "Patients",
    path: "/doctor/patients",
    icon: Users,
  },
  {
    label: "Medical Records",
    path: "/doctor/medical-records",
    icon: ClipboardList,
  },
  {
    label: "Prescriptions",
    path: "/doctor/prescriptions",
    icon: FileText,
  },
  {
    label: "Reviews",
    path: "/doctor/ratings",
    icon: Star,
  },
  {
    label: "Schedule",
    path: "/doctor/schedule",
    icon: Clock,
  },
  {
    label: "Absence Requests",
    path: "/doctor/absence-requests",
    icon: CalendarX,
  },
  {
    label: "Profile",
    path: "/doctor/profile",
    icon: UserRound,
  },
];

const styles = `
.doctor-sidebar,
.doctor-sidebar * {
  box-sizing: border-box;
}

.doctor-sidebar {
  width: 250px;
  min-width: 250px;
  height: 100vh;
  min-height: 100vh;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 20px 14px 13px;
  overflow-y: auto;
  overflow-x: hidden;
  color: #e6edf8;
  background:
    radial-gradient(ellipse at 0% 0%, #284778 0%, transparent 38%),
    radial-gradient(ellipse at 100% 45%, #172944 0%, transparent 45%),
    #0b1424;
  border-right: 1px solid rgba(148, 163, 184, 0.13);
  font-family: Inter, "Segoe UI", Arial, sans-serif;
  scrollbar-width: thin;
  scrollbar-color: #34445f transparent;
}

.doctor-sidebar::-webkit-scrollbar {
  width: 4px;
}

.doctor-sidebar::-webkit-scrollbar-thumb {
  background: #34445f;
  border-radius: 10px;
}

.doctor-sidebar .ds-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 2px 7px 23px;
}

.doctor-sidebar .ds-logo {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 14px;
  background: linear-gradient(145deg, #4f91ff, #3159d9);
  box-shadow: 0 7px 22px rgba(49, 89, 217, 0.32);
}

.doctor-sidebar .ds-brand h2 {
  margin: 0 0 5px;
  color: #ffffff;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.6px;
}

.doctor-sidebar .ds-brand span {
  display: block;
  color: #8fa8cb;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 1.65px;
}

.doctor-sidebar .ds-divider {
  height: 1px;
  flex-shrink: 0;
  margin: 0 5px 22px;
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.22),
    rgba(148, 163, 184, 0.03)
  );
}

.doctor-sidebar .ds-title {
  margin: 0 0 11px 11px;
  color: #7086a7;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.doctor-sidebar .ds-nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.doctor-sidebar .ds-link {
  position: relative;
  min-height: 45px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 11px;
  color: #a8b8d0;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05px;
  border: 1px solid transparent;
  border-radius: 11px;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.doctor-sidebar .ds-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.055);
  border-color: rgba(255, 255, 255, 0.055);
  transform: translateX(2px);
}

.doctor-sidebar .ds-link.active {
  color: #ffffff;
  border-color: rgba(103, 155, 255, 0.23);
  background: linear-gradient(
    100deg,
    rgba(59, 130, 246, 0.25),
    rgba(59, 130, 246, 0.08)
  );
  box-shadow: inset 3px 0 0 #69a0ff;
}

.doctor-sidebar .ds-link-icon {
  width: 23px;
  height: 23px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #8198b8;
  transition: color 0.2s ease;
}

.doctor-sidebar .ds-link.active .ds-link-icon,
.doctor-sidebar .ds-link:hover .ds-link-icon {
  color: #91baff;
}

.doctor-sidebar .ds-link-label {
  flex: 1;
  min-width: 0;
}

.doctor-sidebar .ds-link-arrow {
  color: #7fb0ff;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s ease;
}

.doctor-sidebar .ds-link.active .ds-link-arrow {
  opacity: 1;
  transform: translateX(0);
}

.doctor-sidebar .ds-appointment-badge {
  min-width: 23px;
  height: 23px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  color: #ffffff;
  background: linear-gradient(145deg, #ff626b, #dc2626);
  box-shadow: 0 3px 12px rgba(239, 68, 68, 0.3);
  font-size: 10px;
  font-weight: 850;
  line-height: 1;
  animation: ds-badge-appear 0.3s ease-out;
}

@keyframes ds-badge-appear {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.doctor-sidebar .ds-bottom {
  margin-top: auto;
  padding-top: 25px;
}

.doctor-sidebar .ds-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 10px;
  margin-bottom: 12px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 13px;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.055),
    rgba(255, 255, 255, 0.018)
  );
}

.doctor-sidebar .ds-status-icon {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #67e8b5;
  border: 1px solid rgba(52, 211, 153, 0.13);
  border-radius: 11px;
  background: rgba(52, 211, 153, 0.1);
}

.doctor-sidebar .ds-status strong {
  display: block;
  margin-bottom: 5px;
  color: #e5edf8;
  font-size: 10px;
  font-weight: 750;
}

.doctor-sidebar .ds-status small {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #8297b5;
  font-size: 9px;
}

.doctor-sidebar .ds-online-dot {
  width: 6px;
  height: 6px;
  display: inline-block;
  flex-shrink: 0;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.55);
}

.doctor-sidebar .ds-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 9px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.035);
}

.doctor-sidebar .ds-avatar {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: linear-gradient(145deg, #4c91f4, #7355d8);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.17);
  font-size: 14px;
  font-weight: 850;
}

.doctor-sidebar .ds-user-info {
  flex: 1;
  min-width: 0;
}

.doctor-sidebar .ds-user-info strong {
  display: block;
  overflow: hidden;
  margin-bottom: 5px;
  color: #f1f5fb;
  font-size: 11px;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doctor-sidebar .ds-user-info span {
  display: block;
  color: #91a3bd;
  font-size: 9px;
}

.doctor-sidebar .ds-logout {
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  margin-top: 9px;
  border: 1px solid rgba(248, 113, 113, 0.17);
  border-radius: 11px;
  color: #f5aaaa;
  background: rgba(239, 68, 68, 0.045);
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.doctor-sidebar .ds-logout:hover {
  color: #ffffff;
  border-color: rgba(248, 113, 113, 0.42);
  background: rgba(239, 68, 68, 0.15);
}

.doctor-sidebar .ds-version {
  display: flex;
  justify-content: space-between;
  gap: 5px;
  padding: 13px 3px 0;
  color: #61738e;
  font-size: 8px;
  font-weight: 750;
  letter-spacing: 0.6px;
}

.ds-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(5, 12, 25, 0.72);
  backdrop-filter: blur(7px);
}

.ds-modal {
  position: relative;
  width: 100%;
  max-width: 390px;
  padding: 30px;
  border: 1px solid #e7edf5;
  border-radius: 20px;
  color: #172033;
  background: #ffffff;
  box-shadow: 0 25px 90px rgba(0, 0, 0, 0.25);
  animation: ds-modal-enter 0.2s ease-out;
}

@keyframes ds-modal-enter {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.ds-modal-close {
  position: absolute;
  top: 13px;
  right: 13px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  color: #667085;
  background: #f1f4f8;
  cursor: pointer;
}

.ds-modal-icon {
  width: 49px;
  height: 49px;
  display: grid;
  place-items: center;
  margin-bottom: 18px;
  border-radius: 14px;
  color: #dc4c4c;
  background: #fff0f0;
}

.ds-modal h2 {
  margin: 0 0 10px;
  color: #182338;
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.ds-modal p {
  margin: 0;
  color: #707b8d;
  font-size: 12px;
  line-height: 1.8;
}

.ds-modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}

.ds-modal-actions button {
  flex: 1;
  min-height: 42px;
  border-radius: 10px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 750;
  transition: all 0.2s ease;
}

.ds-cancel {
  color: #475569;
  border: 1px solid #dfe5ee;
  background: #ffffff;
}

.ds-cancel:hover {
  background: #f5f7fb;
}

.ds-confirm {
  color: #ffffff;
  border: 1px solid #dc4c4c;
  background: #dc4c4c;
}

.ds-confirm:hover {
  background: #c93636;
}

@media (max-width: 850px) {
  .doctor-sidebar {
    width: 225px;
    min-width: 225px;
    padding-right: 11px;
    padding-left: 11px;
  }
}

@media (max-height: 790px) {
  .doctor-sidebar {
    padding-top: 11px;
  }

  .doctor-sidebar .ds-brand {
    padding-bottom: 13px;
  }

  .doctor-sidebar .ds-divider {
    margin-bottom: 13px;
  }

  .doctor-sidebar .ds-link {
    min-height: 38px;
  }

  .doctor-sidebar .ds-nav {
    gap: 3px;
  }

  .doctor-sidebar .ds-bottom {
    padding-top: 12px;
  }

  .doctor-sidebar .ds-status {
    padding: 8px;
    margin-bottom: 8px;
  }

  .doctor-sidebar .ds-user {
    padding: 9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .doctor-sidebar *,
  .ds-modal {
    animation: none !important;
    transition: none !important;
  }
}
`;

export default function DoctorSidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showLogout, setShowLogout] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState(0);

  const name =
    user?.fullName ||
    user?.FullName ||
    user?.name ||
    user?.email ||
    user?.Email ||
    "Doctor";

  const initial = String(name).trim().charAt(0).toUpperCase() || "D";

  const loadPendingAppointments = useCallback(async () => {
    try {
      const response = await api.get("/Appointment");
      const data = response.data;

      const appointments = Array.isArray(data)
        ? data
        : Array.isArray(data?.$values)
        ? data.$values
        : Array.isArray(data?.appointments)
        ? data.appointments
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.$values)
        ? data.data.$values
        : [];

      const count = appointments.filter((appointment) => {
        const status = appointment?.status ?? appointment?.Status;

        return String(status || "").toLowerCase() === "pending";
      }).length;

      setPendingAppointments(count);
    } catch (error) {
      console.error(
        "Gözləyən rezervasiyaları yükləmək mümkün olmadı:",
        error
      );
    }
  }, []);

  useEffect(() => {
    loadPendingAppointments();

    const intervalId = window.setInterval(
      loadPendingAppointments,
      30000
    );

    const handleFocus = () => {
      loadPendingAppointments();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadPendingAppointments();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [loadPendingAppointments]);

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
            <Stethoscope size={24} strokeWidth={2} />
          </div>

          <div>
            <h2>Hospital</h2>
            <span>DOCTOR PORTAL</span>
          </div>
        </div>

        <div className="ds-divider" />

        <p className="ds-title">DOCTOR WORKSPACE</p>

        <nav className="ds-nav" aria-label="Doctor navigation">
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
                  <Icon size={19} strokeWidth={1.8} />
                </span>

                <span className="ds-link-label">{item.label}</span>

                {item.path === "/doctor/appointments" &&
                  pendingAppointments > 0 && (
                    <span
                      className="ds-appointment-badge"
                      aria-label={`${pendingAppointments} pending appointments`}
                      title={`${pendingAppointments} gözləyən rezervasiya`}
                    >
                      {pendingAppointments > 99
                        ? "99+"
                        : pendingAppointments}
                    </span>
                  )}

                <ChevronRight
                  className="ds-link-arrow"
                  size={15}
                  strokeWidth={2.2}
                />
              </NavLink>
            );
          })}
        </nav>

        <div className="ds-bottom">
          <div className="ds-status">
            <span className="ds-status-icon">
              <Activity size={18} strokeWidth={2} />
            </span>

            <div>
              <strong>Doctor Workspace</strong>
              <small>
                <span className="ds-online-dot" />
                Medical portal
              </small>
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
