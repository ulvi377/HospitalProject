
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  UserRound,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import appointmentService from "../../services/appointmentService";

const styles = `
.patient-appointments {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  color: #172b4d;
  font-family: Inter, "Segoe UI", sans-serif;
}
.patient-appointments * { box-sizing: border-box; }
.patient-appointments .heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 26px;
}
.patient-appointments .eyebrow {
  color: #1769e0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  margin: 0 0 8px;
}
.patient-appointments h1 {
  font-size: 28px;
  margin: 0;
  font-weight: 800;
  color: #172b4d;
}
.patient-appointments .subtitle {
  color: #8491a7;
  font-size: 14px;
  margin-top: 9px;
}
.patient-appointments .refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e1e8f2;
  background: #fff;
  color: #344b6b;
  border-radius: 10px;
  padding: 11px 14px;
  cursor: pointer;
  font-weight: 700;
}
.patient-appointments .refresh:disabled {
  opacity: .6;
  cursor: not-allowed;
}
.patient-appointments .stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}
.patient-appointments .stat {
  background: #fff;
  border: 1px solid #e9edf5;
  border-radius: 14px;
  padding: 18px 22px;
}
.patient-appointments .stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #eaf2ff;
  color: #1769e0;
}
.patient-appointments .stat-label {
  color: #8491a7;
  font-size: 12px;
  margin: 12px 0 5px;
}
.patient-appointments .stat-value {
  font-size: 25px;
  font-weight: 800;
  color: #172b4d;
}
.patient-appointments .panel {
  display: grid;
  gap: 14px;
}
.patient-appointments .appointment-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  background: #fff;
  border: 1px solid #e9edf5;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 4px 16px rgba(23,43,77,.025);
}
.patient-appointments .doctor-info {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 210px;
  flex: 1;
}
.patient-appointments .avatar {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: #eaf2ff;
  color: #1769e0;
}
.patient-appointments .doctor-name {
  margin: 0 0 7px;
  font-size: 15px;
  font-weight: 800;
  color: #172b4d;
}
.patient-appointments .specialty {
  margin: 0;
  color: #8491a7;
  font-size: 13px;
}
.patient-appointments .date-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
}
.patient-appointments .date-info svg {
  color: #1769e0;
  flex-shrink: 0;
}
.patient-appointments .status {
  padding: 8px 12px;
  border-radius: 20px;
  background: #fff4df;
  color: #a97113;
  font-size: 12px;
  font-weight: 800;
}
.patient-appointments .status.confirmed,
.patient-appointments .status.completed {
  background: #e7f8ef;
  color: #178354;
}
.patient-appointments .status.cancelled {
  background: #fff0f0;
  color: #c43d4c;
}
.patient-appointments .message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-radius: 12px;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
}
.patient-appointments .message.error {
  background: #fff1f2;
  color: #be3545;
  border: 1px solid #f5d5d9;
}
.patient-appointments .message.success {
  background: #edfaf3;
  color: #187c51;
  border: 1px solid #d1efdf;
}
.patient-appointments .empty,
.patient-appointments .loading {
  background: #fff;
  border: 1px solid #e9edf5;
  border-radius: 16px;
  padding: 45px 20px;
  text-align: center;
  color: #8491a7;
}
.patient-appointments .empty svg {
  color: #9aabc3;
}
.patient-appointments .empty h3 {
  margin: 15px 0 8px;
  color: #172b4d;
}
.patient-appointments .empty p {
  font-size: 14px;
  margin: 0;
}
.patient-appointments .spin {
  animation: patient-appointment-spin .8s linear infinite;
}
@keyframes patient-appointment-spin {
  to { transform: rotate(360deg); }
}
@media(max-width: 700px) {
  .patient-appointments .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .patient-appointments .appointment-card {
    padding: 17px;
  }
}
@media(max-width: 480px) {
  .patient-appointments .stats {
    grid-template-columns: 1fr;
  }
  .patient-appointments h1 {
    font-size: 24px;
  }
  .patient-appointments .appointment-card {
    align-items: flex-start;
    flex-direction: column;
  }
}
`;

function getName(value, fallback = "") {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    return (
      value.fullName ||
      value.name ||
      value.title ||
      value.specialtyName ||
      value.specialityName ||
      fallback
    );
  }

  return fallback;
}

function getSpecialty(appointment) {
  const doctor = appointment?.doctor;

  const value =
    doctor?.specialty ??
    doctor?.specialtyName ??
    doctor?.speciality ??
    doctor?.specialityName ??
    appointment?.specialty ??
    appointment?.specialtyName;

  return getName(value, "Həkim qəbulu");
}

function getDoctorName(appointment) {
  return getName(
    appointment?.doctor,
    appointment?.doctorName ||
      appointment?.doctorFullName ||
      (appointment?.doctorId
        ? `Həkim #${appointment.doctorId}`
        : "Həkim")
  );
}

function getStatus(status) {
  const value = String(status || "Pending").toLowerCase();

  if (["confirmed", "approved"].includes(value)) {
    return "Təsdiqlənib";
  }

  if (["completed", "finished"].includes(value)) {
    return "Tamamlanıb";
  }

  if (["cancelled", "canceled"].includes(value)) {
    return "Ləğv edilib";
  }

  return "Gözləyir";
}

function getStatusClass(status) {
  const value = String(status || "pending").toLowerCase();

  if (["confirmed", "approved"].includes(value)) {
    return "confirmed";
  }

  if (["completed", "finished"].includes(value)) {
    return "completed";
  }

  if (["cancelled", "canceled"].includes(value)) {
    return "cancelled";
  }

  return "pending";
}

function formatDate(value) {
  if (!value) return "Tarix göstərilməyib";

  // Tarix YYYY-MM-DD şəklindədirsə, günü dəyişmədən göstər.
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      return `${match[3]}.${match[2]}.${match[1]}`;
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tarix göstərilməyib";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Baku",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "--:--";

  // Saat ayrıca gəlirsə: 9:30, 09:30 və ya 09:30:00.
  if (typeof value === "string") {
    const timeMatch = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

    if (timeMatch) {
      return `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Baku",
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;

  if (hour == null || minute == null) return "--:--";

  return `${hour}:${minute}`;
}

function extractArray(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.$values)) return data.data.$values;
  if (Array.isArray(data?.items?.$values)) return data.items.$values;

  return [];
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadAppointments() {
      setLoading(true);
      setError("");

      try {
        const response = await appointmentService.getAll();

        if (!active) return;

        const data = extractArray(response);
        setAppointments(data);
      } catch (err) {
        if (!active) return;

        const status = err?.response?.status;

        if (status === 401 || status === 403) {
          setError(
            "Qəbulları görmək üçün hesabınıza yenidən daxil olun. İcazə problemi varsa, backend-də xəstə üçün qəbullara giriş icazəsini yoxlayın."
          );
        } else {
          setError(
            err?.response?.data?.message ||
              err?.response?.data?.title ||
              "Qəbulları yükləmək mümkün olmadı. Backend bağlantısını yoxlayın."
          );
        }

        setAppointments([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAppointments();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const stats = useMemo(() => {
    const total = appointments.length;

    const pending = appointments.filter((item) => {
      const status = String(item?.status || "pending").toLowerCase();
      return ![
        "confirmed",
        "approved",
        "completed",
        "finished",
        "cancelled",
        "canceled",
      ].includes(status);
    }).length;

    const confirmed = appointments.filter((item) =>
      ["confirmed", "approved"].includes(
        String(item?.status || "").toLowerCase()
      )
    ).length;

    return { total, pending, confirmed };
  }, [appointments]);

  function getAppointmentDate(item) {
    return (
      item?.appointmentDate ??
      item?.date ??
      item?.startDate ??
      item?.startTime ??
      null
    );
  }

  function getAppointmentTime(item) {
    // Ayrı saat sahəsi varsa, ilk növbədə onu istifadə et.
    return (
      item?.appointmentTime ??
      item?.time ??
      item?.startTime ??
      item?.appointmentDate ??
      item?.date ??
      null
    );
  }

  return (
    <div className="patient-appointments">
      <style>{styles}</style>

      <div className="heading">
        <div>
          <p className="eyebrow">ŞƏXSİ KABİNET</p>
          <h1>Qəbullarım</h1>
          <p className="subtitle">
            Həkim qəbuluna yazılışlarınızı buradan izləyə bilərsiniz.
          </p>
        </div>

        <button
          className="refresh"
          type="button"
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Yenilə
        </button>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-icon">
            <CalendarDays size={20} />
          </div>
          <div className="stat-label">Ümumi qəbullar</div>
          <div className="stat-value">{stats.total}</div>
        </div>

        <div className="stat">
          <div className="stat-icon">
            <Clock size={20} />
          </div>
          <div className="stat-label">Gözləyən qəbullar</div>
          <div className="stat-value">{stats.pending}</div>
        </div>

        <div className="stat">
          <div className="stat-icon">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-label">Təsdiqlənmiş qəbullar</div>
          <div className="stat-value">{stats.confirmed}</div>
        </div>
      </div>

      {error && (
        <div className="message error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <RefreshCw size={24} className="spin" />
          <p>Qəbullar yüklənir...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="empty">
          <CalendarDays size={42} />
          <h3>Hələ qəbulunuz yoxdur</h3>
          <p>Həkim qəbuluna yazıldıqdan sonra məlumatlar burada görünəcək.</p>
        </div>
      ) : (
        <div className="panel">
          {appointments.map((item, index) => {
            const status = item?.status || "Pending";
            const appointmentDate = getAppointmentDate(item);
            const appointmentTime = getAppointmentTime(item);

            return (
              <div
                className="appointment-card"
                key={item?.id ?? item?.appointmentId ?? index}
              >
                <div className="doctor-info">
                  <div className="avatar">
                    <UserRound size={23} />
                  </div>

                  <div>
                    <h3 className="doctor-name">
                      {getDoctorName(item)}
                    </h3>
                    <p className="specialty">
                      {getSpecialty(item)}
                    </p>
                  </div>
                </div>

                <div className="date-info">
                  <CalendarDays size={17} />
                  <span>{formatDate(appointmentDate)}</span>
                </div>

                <div className="date-info">
                  <Clock size={17} />
                  <span>{formatTime(appointmentTime)}</span>
                </div>

                <span className={`status ${getStatusClass(status)}`}>
                  {getStatus(status)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
