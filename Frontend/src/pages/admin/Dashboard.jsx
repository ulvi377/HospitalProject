
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Stethoscope,
  Users,
  UserRound,
  Building2,
  CalendarCheck,
  AlertCircle,
} from "lucide-react";

import doctorService from "../../services/doctorService";
import patientService from "../../services/patientService";
import specialtyService from "../../services/specialtyService";
import appointmentService from "../../services/appointmentService";

import "./Dashboard.css";

// API cavabını massivə çevirir.
// Bəzi endpoint-lər birbaşa massiv, bəziləri obyekt qaytara bilər.
function toArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.$values)) return response.$values;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.$values)) {
    return response.data.$values;
  }

  return [];
}

function getAppointmentDate(appointment) {
  const value =
    appointment?.appointmentDate ??
    appointment?.AppointmentDate ??
    appointment?.date ??
    appointment?.Date ??
    appointment?.startTime ??
    appointment?.StartTime;

  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getAppointmentStatus(appointment) {
  return String(
    appointment?.status ??
      appointment?.Status ??
      appointment?.appointmentStatus ??
      appointment?.AppointmentStatus ??
      "",
  );
}

function getPatientName(appointment) {
  const patient = appointment?.patient ?? appointment?.Patient;

  return (
    patient?.fullName ??
    patient?.FullName ??
    patient?.name ??
    patient?.Name ??
    appointment?.patientName ??
    appointment?.PatientName ??
    "Pasiyent"
  );
}

function getDoctorName(appointment) {
  const doctor = appointment?.doctor ?? appointment?.Doctor;

  return (
    doctor?.fullName ??
    doctor?.FullName ??
    doctor?.name ??
    doctor?.Name ??
    appointment?.doctorName ??
    appointment?.DoctorName ??
    "Həkim"
  );
}

function formatDate(date) {
  if (!date) return "Tarix göstərilməyib";

  return date.toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date) {
  if (!date) return "--:--";

  return date.toLocaleTimeString("az-AZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status) {
  const value = status.toLowerCase();

  if (
    value.includes("confirm") ||
    value.includes("approve") ||
    value.includes("təsdiq")
  ) {
    return "confirmed";
  }

  if (
    value.includes("cancel") ||
    value.includes("reject") ||
    value.includes("ləğv")
  ) {
    return "cancelled";
  }

  if (
    value.includes("complete") ||
    value.includes("finish") ||
    value.includes("tamam")
  ) {
    return "completed";
  }

  return "pending";
}

function getStatusLabel(status) {
  if (!status) return "Gözləyir";

  const value = status.toLowerCase();

  if (
    value.includes("confirm") ||
    value.includes("approve") ||
    value.includes("təsdiq")
  ) {
    return "Təsdiqlənib";
  }

  if (
    value.includes("cancel") ||
    value.includes("reject") ||
    value.includes("ləğv")
  ) {
    return "Ləğv edilib";
  }

  if (
    value.includes("complete") ||
    value.includes("finish") ||
    value.includes("tamam")
  ) {
    return "Tamamlanıb";
  }

  if (value.includes("pending") || value.includes("wait")) {
    return "Gözləyir";
  }

  return status;
}

const statDefinitions = [
  {
    key: "doctors",
    title: "Həkimlər",
    description: "Ümumi qeydiyyat",
    icon: Stethoscope,
    color: "blue",
    link: "/admin/doctors",
  },
  {
    key: "patients",
    title: "Pasiyentlər",
    description: "Ümumi qeydiyyat",
    icon: Users,
    color: "purple",
    link: "/admin/patients",
  },
  {
    key: "appointments",
    title: "Görüşlər",
    description: "Bütün görüşlər",
    icon: CalendarCheck,
    color: "green",
    link: "/admin/appointments",
  },
  {
    key: "specialties",
    title: "İxtisaslar",
    description: "Tibbi ixtisaslar",
    icon: Building2,
    color: "orange",
    link: "/admin/specialties",
  },
];

function Dashboard() {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    specialties: 0,
  });

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    const requests = await Promise.allSettled([
      doctorService.getAll(),
      patientService.getAll(),
      specialtyService.getAll(),
      appointmentService.getAll(),
    ]);

    const [doctorsResult, patientsResult, specialtiesResult, appointmentsResult] =
      requests;

    const failures = requests.filter(
      (result) => result.status === "rejected",
    );

    if (failures.length === requests.length) {
      setError(
        "Dashboard məlumatlarını yükləmək mümkün olmadı. Backend-in işlədiyini yoxla.",
      );
      setLoading(false);
      return;
    }

    const doctors =
      doctorsResult.status === "fulfilled"
        ? toArray(doctorsResult.value)
        : [];

    const patients =
      patientsResult.status === "fulfilled"
        ? toArray(patientsResult.value)
        : [];

    const specialties =
      specialtiesResult.status === "fulfilled"
        ? toArray(specialtiesResult.value)
        : [];

    const appointmentList =
      appointmentsResult.status === "fulfilled"
        ? toArray(appointmentsResult.value)
        : [];

    setStats({
      doctors: doctors.length,
      patients: patients.length,
      specialties: specialties.length,
      appointments: appointmentList.length,
    });

    setAppointments(appointmentList);

    if (failures.length > 0) {
      setError(
        "Bəzi məlumatlar yüklənmədi. Backend endpoint-lərini yoxla.",
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => {
        const dateA = getAppointmentDate(a)?.getTime() ?? 0;
        const dateB = getAppointmentDate(b)?.getTime() ?? 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [appointments]);

  const weeklyAppointments = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      return {
        date,
        label: date.toLocaleDateString("az-AZ", {
          weekday: "short",
        }),
        count: 0,
      };
    });

    appointments.forEach((appointment) => {
      const date = getAppointmentDate(appointment);

      if (!date) return;

      date.setHours(0, 0, 0, 0);

      const day = days.find(
        (item) => item.date.getTime() === date.getTime(),
      );

      if (day) day.count += 1;
    });

    return days;
  }, [appointments]);

  const maxWeeklyCount = Math.max(
    1,
    ...weeklyAppointments.map((day) => day.count),
  );

  const todayAppointments = appointments.filter((appointment) => {
    const date = getAppointmentDate(appointment);
    if (!date) return false;

    const now = new Date();

    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }).length;

  return (
    <main className="hospital-dashboard">
      <header className="hd-header">
        <div>
          <div className="hd-eyebrow">
            <Activity size={15} />
            İDARƏETMƏ PANELİ
          </div>

          <h1>Dashboard</h1>

          <p>
            Xəstəxananın ümumi vəziyyətini buradan izləyə bilərsən.
          </p>
        </div>

        <div className="hd-header-actions">
          <div className="hd-date">
            <CalendarDays size={18} />
            <span>
              {new Date().toLocaleDateString("az-AZ", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <button
            className="hd-refresh"
            type="button"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "hd-spinning" : ""}
            />
            Yenilə
          </button>
        </div>
      </header>

      {error && (
        <div className="hd-alert" role="alert">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}

      <section className="hd-stats-grid">
        {statDefinitions.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              to={item.link}
              className="hd-stat-card"
              key={item.key}
            >
              <div className="hd-stat-top">
                <span className={`hd-stat-icon ${item.color}`}>
                  <Icon size={22} />
                </span>

                <span className="hd-stat-link">
                  <ArrowUpRight size={17} />
                </span>
              </div>

              <p>{item.title}</p>

              <div className="hd-stat-number">
                {loading ? (
                  <span className="hd-skeleton" />
                ) : (
                  stats[item.key].toLocaleString("az-AZ")
                )}
              </div>

              <span className="hd-stat-description">
                {item.description}
              </span>
            </Link>
          );
        })}
      </section>

      <section className="hd-main-grid">
        <div className="hd-panel hd-chart-panel">
          <div className="hd-panel-header">
            <div>
              <span className="hd-panel-eyebrow">STATİSTİKA</span>
              <h2>Həftəlik görüşlər</h2>
              <p>Son 7 gün ərzində yaradılmış görüşlər</p>
            </div>

            <span className="hd-panel-icon">
              <CalendarDays size={20} />
            </span>
          </div>

          <div className="hd-chart">
            <div className="hd-chart-y-labels">
              <span>{maxWeeklyCount}</span>
              <span>{Math.ceil(maxWeeklyCount / 2)}</span>
              <span>0</span>
            </div>

            <div className="hd-chart-content">
              <div className="hd-chart-grid-lines">
                <span />
                <span />
                <span />
              </div>

              <div className="hd-bars">
                {weeklyAppointments.map((day) => (
                  <div className="hd-bar-column" key={day.date.toISOString()}>
                    <div className="hd-bar-area">
                      {day.count > 0 && (
                        <span className="hd-bar-value">
                          {day.count}
                        </span>
                      )}

                      <div
                        className={`hd-bar ${
                          day.date.toDateString() ===
                          new Date().toDateString()
                            ? "today"
                            : ""
                        }`}
                        style={{
                          height: `${Math.max(
                            day.count > 0 ? 8 : 0,
                            (day.count / maxWeeklyCount) * 100,
                          )}%`,
                        }}
                        title={`${day.count} görüş`}
                      />
                    </div>

                    <span className="hd-bar-label">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hd-chart-footer">
            <span>
              <span className="hd-legend-dot" />
              Günlük görüş sayı
            </span>

            <strong>
              {weeklyAppointments.reduce(
                (total, day) => total + day.count,
                0,
              )}{" "}
              görüş
            </strong>
          </div>
        </div>

        <div className="hd-panel hd-today-panel">
          <div className="hd-panel-header">
            <div>
              <span className="hd-panel-eyebrow">BU GÜN</span>
              <h2>Gündəlik xülasə</h2>
              <p>Bugünkü görüşlərin vəziyyəti</p>
            </div>

            <span className="hd-panel-icon green">
              <Clock3 size={20} />
            </span>
          </div>

          <div className="hd-today-total">
            <span>Bu günə təyin edilən görüşlər</span>

            <strong>
              {loading ? "—" : todayAppointments}
            </strong>
          </div>

          <div className="hd-summary-note">
            <div className="hd-summary-note-icon">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <strong>Məlumatlara nəzarət</strong>
              <p>
                Görüşlərin siyahısını açaraq tarixləri və statusları
                ətraflı yoxlaya bilərsən.
              </p>
            </div>
          </div>

          <Link
            to="/admin/appointments"
            className="hd-primary-link"
          >
            Bütün görüşlərə bax
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="hd-panel hd-appointments-panel">
        <div className="hd-panel-header hd-appointments-heading">
          <div>
            <span className="hd-panel-eyebrow">SON QEYDLƏR</span>
            <h2>Son görüşlər</h2>
            <p>Sistemdəki son görüş məlumatları</p>
          </div>

          <Link
            to="/admin/appointments"
            className="hd-view-all"
          >
            Hamısına bax
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="hd-table-message">
            <RefreshCw size={20} className="hd-spinning" />
            Məlumatlar yüklənir...
          </div>
        ) : recentAppointments.length === 0 ? (
          <div className="hd-empty">
            <div className="hd-empty-icon">
              <CalendarDays size={25} />
            </div>
            <strong>Hələ görüş yoxdur</strong>
            <p>Görüşlər yaradıldıqda burada görünəcək.</p>
          </div>
        ) : (
          <div className="hd-table-wrapper">
            <table className="hd-table">
              <thead>
                <tr>
                  <th>Pasiyent</th>
                  <th>Həkim</th>
                  <th>Tarix</th>
                  <th>Saat</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentAppointments.map((appointment, index) => {
                  const date = getAppointmentDate(appointment);
                  const status = getAppointmentStatus(appointment);

                  return (
                    <tr
                      key={
                        appointment.id ??
                        appointment.Id ??
                        appointment.appointmentId ??
                        index
                      }
                    >
                      <td>
                        <div className="hd-person">
                          <span className="hd-person-avatar patient">
                            <UserRound size={17} />
                          </span>

                          <strong>{getPatientName(appointment)}</strong>
                        </div>
                      </td>

                      <td>
                        <div className="hd-person">
                          <span className="hd-person-avatar doctor">
                            <Stethoscope size={16} />
                          </span>

                          <span>{getDoctorName(appointment)}</span>
                        </div>
                      </td>

                      <td>{formatDate(date)}</td>

                      <td>{formatTime(date)}</td>

                      <td>
                        <span
                          className={`hd-status ${getStatusClass(status)}`}
                        >
                          <span />
                          {getStatusLabel(status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="hd-quick-section">
        <div className="hd-quick-heading">
          <div>
            <span className="hd-panel-eyebrow">SÜRƏTLİ KEÇİDLƏR</span>
            <h2>İdarəetmə bölmələri</h2>
          </div>
        </div>

        <div className="hd-quick-grid">
          <Link to="/admin/doctors" className="hd-quick-card">
            <span className="hd-quick-icon blue">
              <Stethoscope size={22} />
            </span>
            <span>
              <strong>Həkimlər</strong>
              <small>Həkimləri idarə et</small>
            </span>
            <ArrowRight size={17} />
          </Link>

          <Link to="/admin/patients" className="hd-quick-card">
            <span className="hd-quick-icon purple">
              <Users size={22} />
            </span>
            <span>
              <strong>Pasiyentlər</strong>
              <small>Pasiyent siyahısı</small>
            </span>
            <ArrowRight size={17} />
          </Link>

          <Link to="/admin/appointments" className="hd-quick-card">
            <span className="hd-quick-icon green">
              <CalendarCheck size={22} />
            </span>
            <span>
              <strong>Görüşlər</strong>
              <small>Qəbulları idarə et</small>
            </span>
            <ArrowRight size={17} />
          </Link>

          <Link to="/admin/specialties" className="hd-quick-card">
            <span className="hd-quick-icon orange">
              <Building2 size={22} />
            </span>
            <span>
              <strong>İxtisaslar</strong>
              <small>Tibbi ixtisaslar</small>
            </span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
