
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  Activity,
  CalendarDays,
  Clock,
  Users,
  Stethoscope,
  RefreshCw,
  CheckCircle2,
  Hourglass,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  XCircle,
  Pill,
  CalendarClock,
} from "lucide-react";

const css = `
.doctor-dashboard {
  width: 100%;
  min-width: 0;
  padding: 8px 6px 32px;
  color: #17243b;
  font-family: Inter, "Segoe UI", sans-serif;
}
.doctor-dashboard * { box-sizing: border-box; }

.doctor-dashboard .heading {
  display:flex;
  justify-content:space-between;
  align-items:center;
  flex-wrap:wrap;
  gap:18px;
  margin-bottom:25px;
}
.doctor-dashboard .eyebrow {
  display:flex;
  align-items:center;
  gap:8px;
  color:#5877e8;
  font-size:10px;
  font-weight:850;
  letter-spacing:2px;
  margin-bottom:10px;
}
.doctor-dashboard .eyebrow:before {
  content:"";
  width:22px;
  height:3px;
  border-radius:5px;
  background:#5877e8;
}
.doctor-dashboard h1 {
  margin:0;
  font-size:clamp(25px,3vw,34px);
  font-weight:850;
  letter-spacing:-1.1px;
  color:#14213a;
}
.doctor-dashboard .muted {
  margin:9px 0 0;
  color:#8793a8;
  font-size:13px;
  line-height:1.7;
}
.doctor-dashboard .refresh {
  display:flex;
  align-items:center;
  justify-content:center;
  gap:9px;
  padding:12px 17px;
  background:#fff;
  color:#35435e;
  border:1px solid #e3e9f3;
  border-radius:13px;
  font-size:12px;
  font-weight:750;
  cursor:pointer;
  box-shadow:0 5px 16px #1c315008;
  transition:all .2s ease;
}
.doctor-dashboard .refresh:hover {
  background:#f5f7ff;
  border-color:#cbd6fb;
  transform:translateY(-1px);
}
.doctor-dashboard .refresh:disabled {
  opacity:.6;
  cursor:wait;
  transform:none;
}
.doctor-dashboard .spin {
  animation:doctor-spin 1s linear infinite;
}
@keyframes doctor-spin {
  to { transform:rotate(360deg); }
}

.doctor-dashboard .welcome {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:22px;
  padding:30px;
  margin-bottom:24px;
  border-radius:22px;
  color:white;
  background:
    radial-gradient(circle at 90% 10%, #7193ff45, transparent 30%),
    linear-gradient(115deg,#14213d 0%,#213f7c 58%,#456be0 100%);
  position:relative;
  overflow:hidden;
  box-shadow:0 16px 38px #253f841c;
}
.doctor-dashboard .welcome:after {
  content:"";
  position:absolute;
  width:230px;
  height:230px;
  border:1px solid #ffffff16;
  border-radius:50%;
  right:75px;
  top:-135px;
  pointer-events:none;
}
.doctor-dashboard .welcome-content {
  position:relative;
  z-index:1;
}
.doctor-dashboard .welcome-label {
  display:inline-flex;
  align-items:center;
  gap:7px;
  padding:6px 10px;
  margin-bottom:15px;
  border:1px solid #ffffff24;
  background:#ffffff12;
  color:#dce6ff;
  border-radius:30px;
  font-size:10px;
  font-weight:750;
  letter-spacing:.6px;
}
.doctor-dashboard .welcome h2 {
  margin:0;
  font-size:clamp(21px,2.3vw,27px);
  font-weight:850;
  letter-spacing:-.7px;
}
.doctor-dashboard .welcome p {
  max-width:510px;
  margin:11px 0 0;
  color:#d7e2ff;
  font-size:12px;
  line-height:1.9;
}
.doctor-dashboard .welcome-icon {
  width:76px;
  height:76px;
  flex-shrink:0;
  display:flex;
  align-items:center;
  justify-content:center;
  border:1px solid #ffffff32;
  border-radius:23px;
  background:#ffffff12;
  color:white;
  box-shadow:inset 0 1px 0 #ffffff12;
  position:relative;
  z-index:1;
}

.doctor-dashboard .stats {
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:16px;
  margin-bottom:25px;
}
.doctor-dashboard .stat {
  min-width:0;
  padding:20px;
  background:#fff;
  border:1px solid #e7ecf5;
  border-radius:19px;
  box-shadow:0 7px 24px #20385a06;
  transition:transform .2s ease,box-shadow .2s ease;
}
.doctor-dashboard .stat:hover {
  transform:translateY(-3px);
  box-shadow:0 13px 28px #20385a0c;
}
.doctor-dashboard .stat-top {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:8px;
  margin-bottom:20px;
}
.doctor-dashboard .stat-icon {
  width:44px;
  height:44px;
  flex-shrink:0;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:15px;
}
.doctor-dashboard .blue { background:#edf1ff; color:#5375e7; }
.doctor-dashboard .green { background:#e7f8ef; color:#20a66b; }
.doctor-dashboard .orange { background:#fff3e3; color:#d98b20; }
.doctor-dashboard .red { background:#fff0f0; color:#d85c69; }
.doctor-dashboard .stat-label {
  color:#78859c;
  font-size:11px;
  font-weight:750;
  line-height:1.5;
}
.doctor-dashboard .stat-value {
  font-size:clamp(27px,2.6vw,34px);
  line-height:1.15;
  font-weight:850;
  letter-spacing:-1px;
  color:#182640;
}
.doctor-dashboard .stat-note {
  display:flex;
  align-items:center;
  gap:6px;
  margin-top:11px;
  color:#95a0b1;
  font-size:10px;
  line-height:1.5;
}
.doctor-dashboard .stat-note svg { flex-shrink:0; }

.doctor-dashboard .content-grid {
  display:grid;
  grid-template-columns:minmax(0,1.55fr) minmax(260px,.9fr);
  gap:20px;
  align-items:start;
}
.doctor-dashboard .panel {
  min-width:0;
  overflow:hidden;
  background:#fff;
  border:1px solid #e7ecf5;
  border-radius:20px;
  box-shadow:0 7px 24px #20385a06;
}
.doctor-dashboard .panel-head {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  padding:21px 22px;
  border-bottom:1px solid #edf0f6;
}
.doctor-dashboard .panel-title {
  display:flex;
  align-items:center;
  gap:11px;
  min-width:0;
}
.doctor-dashboard .panel-title-icon {
  width:37px;
  height:37px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  border-radius:12px;
  background:#eef2ff;
  color:#5375e7;
}
.doctor-dashboard .panel-head h3 {
  margin:0;
  font-size:14px;
  font-weight:850;
  color:#1c2a44;
}
.doctor-dashboard .panel-subtitle {
  margin-top:5px;
  color:#9aa4b5;
  font-size:10px;
}
.doctor-dashboard .count-badge {
  flex-shrink:0;
  padding:7px 10px;
  border-radius:9px;
  color:#4e6dde;
  background:#eff3ff;
  font-size:10px;
  font-weight:800;
}
.doctor-dashboard .appointment-list { padding:0 21px; }
.doctor-dashboard .appointment {
  display:flex;
  align-items:center;
  gap:12px;
  padding:17px 0;
  border-bottom:1px solid #f0f2f7;
}
.doctor-dashboard .appointment:last-child { border-bottom:0; }
.doctor-dashboard .person-icon {
  display:flex;
  align-items:center;
  justify-content:center;
  width:42px;
  height:42px;
  flex-shrink:0;
  color:#5274e8;
  background:#eef2ff;
  border-radius:14px;
}
.doctor-dashboard .person-info { flex:1; min-width:0; }
.doctor-dashboard .person-info strong {
  display:block;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:#263550;
  font-size:12px;
  font-weight:800;
}
.doctor-dashboard .person-info span {
  display:flex;
  align-items:center;
  gap:5px;
  margin-top:6px;
  color:#8a96aa;
  font-size:10px;
}
.doctor-dashboard .status {
  flex-shrink:0;
  padding:6px 9px;
  border-radius:20px;
  font-size:9px;
  font-weight:850;
  background:#fff4df;
  color:#a97113;
}
.doctor-dashboard .status.confirmed,
.doctor-dashboard .status.completed {
  background:#e8f8ef;
  color:#168354;
}
.doctor-dashboard .status.cancelled {
  background:#fff0f0;
  color:#cc4e59;
}
.doctor-dashboard .status.pending {
  background:#fff4df;
  color:#a97113;
}
.doctor-dashboard .empty {
  padding:38px 18px;
  text-align:center;
  color:#8994a8;
  font-size:12px;
  line-height:1.8;
}
.doctor-dashboard .empty-icon {
  width:54px;
  height:54px;
  margin:0 auto 12px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:17px;
  color:#8397d8;
  background:#f0f3ff;
}
.doctor-dashboard .quick-list { padding:8px 21px 13px; }
.doctor-dashboard .quick-item {
  display:flex;
  align-items:center;
  gap:12px;
  padding:16px 0;
  border-bottom:1px solid #f0f2f7;
}
.doctor-dashboard .quick-item:last-child { border:0; }
.doctor-dashboard .quick-icon {
  width:41px;
  height:41px;
  flex-shrink:0;
  border-radius:14px;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#5274e8;
  background:#eef2ff;
}
.doctor-dashboard .quick-icon.orange {
  background:#fff3e4;
  color:#d98b20;
}
.doctor-dashboard .quick-icon.green {
  background:#e7f8ef;
  color:#20a66b;
}
.doctor-dashboard .quick-icon.red {
  background:#fff0f0;
  color:#d85c69;
}
.doctor-dashboard .quick-item strong {
  display:block;
  color:#2a3852;
  font-size:11px;
  font-weight:800;
}
.doctor-dashboard .quick-item span {
  display:block;
  margin-top:5px;
  color:#8a96aa;
  font-size:10px;
  line-height:1.6;
}
.doctor-dashboard .error {
  padding:14px 17px;
  margin-bottom:18px;
  border:1px solid #f0d0d2;
  background:#fff7f7;
  border-radius:12px;
  color:#bd4851;
  font-size:12px;
  line-height:1.7;
}
.doctor-dashboard .loading-line {
  height:12px;
  width:100%;
  border-radius:8px;
  background:linear-gradient(90deg,#f0f2f7,#e6eaf3,#f0f2f7);
  background-size:200% 100%;
  animation:doctor-loading 1.5s infinite;
}
@keyframes doctor-loading {
  to { background-position:-200% 0; }
}

@media(max-width:1100px) {
  .doctor-dashboard .stats {
    grid-template-columns:repeat(2,minmax(0,1fr));
  }
  .doctor-dashboard .content-grid {
    grid-template-columns:1fr;
  }
}
@media(max-width:560px) {
  .doctor-dashboard { padding:5px 0 24px; }
  .doctor-dashboard .heading { margin-bottom:19px; }
  .doctor-dashboard .welcome {
    padding:22px;
    border-radius:18px;
  }
  .doctor-dashboard .welcome-icon { display:none; }
  .doctor-dashboard .stats { gap:10px; margin-bottom:17px; }
  .doctor-dashboard .stat { padding:14px; border-radius:15px; }
  .doctor-dashboard .stat-top {
    align-items:flex-start;
    margin-bottom:15px;
  }
  .doctor-dashboard .stat-icon {
    width:35px;
    height:35px;
    border-radius:11px;
  }
  .doctor-dashboard .stat-label { font-size:10px; }
  .doctor-dashboard .stat-value { font-size:26px; }
  .doctor-dashboard .stat-note { font-size:9px; }
  .doctor-dashboard .panel { border-radius:16px; }
  .doctor-dashboard .panel-head { padding:16px; }
  .doctor-dashboard .appointment-list,
  .doctor-dashboard .quick-list { padding-left:15px; padding-right:15px; }
  .doctor-dashboard .status { display:none; }
}
`;

function getArray(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;

  if (Array.isArray(data?.data?.$values)) return data.data.$values;
  if (Array.isArray(data?.items?.$values)) return data.items.$values;

  return [];
}

function getStatus(appointment) {
  return String(
    appointment?.status ??
    appointment?.Status ??
    "Pending"
  ).trim().toLowerCase();
}

function getAppointmentDate(appointment) {
  return (
    appointment?.appointmentDate ??
    appointment?.AppointmentDate ??
    null
  );
}

function getAppointmentId(appointment) {
  return appointment?.id ?? appointment?.Id;
}

function getPatientId(appointment) {
  return appointment?.patientId ?? appointment?.PatientId;
}

function getPatientName(appointment) {
  return (
    appointment?.patient?.fullName ??
    appointment?.patient?.FullName ??
    appointment?.Patient?.FullName ??
    appointment?.Patient?.fullName ??
    appointment?.patientName ??
    appointment?.PatientName ??
    `Pasiyent #${getPatientId(appointment) ?? "?"}`
  );
}

function isSameLocalDay(dateValue, referenceDate = new Date()) {
  if (!dateValue) return false;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth() &&
    date.getDate() === referenceDate.getDate()
  );
}

function formatAppointmentDate(dateValue) {
  if (!dateValue) return "Tarix göstərilməyib";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Tarix düzgün deyil";
  }

  return date.toLocaleString("az-AZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status) {
  const values = {
    pending: "Gözləyir",
    confirmed: "Təsdiqlənib",
    completed: "Tamamlanıb",
    cancelled: "Ləğv edilib",
  };

  return values[String(status ?? "").trim().toLowerCase()] ??
    status ??
    "Gözləyir";
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/Appointment");
      const list = getArray(response.data);

      setAppointments(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Qəbul məlumatları yüklənmədi. Girişinizi və API bağlantısını yoxlayın."
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, refresh]);

  const {
    todayAppointments,
    pendingAppointments,
    completedAppointments,
    cancelledAppointments,
    upcomingAppointments,
  } = useMemo(() => {
    const now = new Date();

    const notCancelled = appointments.filter(
      (appointment) => getStatus(appointment) !== "cancelled"
    );

    const todayList = notCancelled.filter(
      (appointment) =>
        isSameLocalDay(getAppointmentDate(appointment), now)
    );

    const pendingList = appointments.filter(
      (appointment) => getStatus(appointment) === "pending"
    );

    const completedList = appointments.filter(
      (appointment) => getStatus(appointment) === "completed"
    );

    const cancelledList = appointments.filter(
      (appointment) => getStatus(appointment) === "cancelled"
    );

    const upcomingList = appointments
      .filter((appointment) => {
        const dateValue = getAppointmentDate(appointment);
        const date = dateValue ? new Date(dateValue) : null;
        const status = getStatus(appointment);

        return (
          date &&
          !Number.isNaN(date.getTime()) &&
          date >= now &&
          status !== "cancelled" &&
          status !== "completed"
        );
      })
      .sort(
        (a, b) =>
          new Date(getAppointmentDate(a)) -
          new Date(getAppointmentDate(b))
      )
      .slice(0, 5);

    return {
      todayAppointments: todayList,
      pendingAppointments: pendingList,
      completedAppointments: completedList,
      cancelledAppointments: cancelledList,
      upcomingAppointments: upcomingList,
    };
  }, [appointments]);

  return (
    <div className="doctor-dashboard">
      <style>{css}</style>

      <header className="heading">
        <div>
          <div className="eyebrow">DOCTOR WORKSPACE</div>
          <h1>İdarəetmə paneli</h1>
          <p className="muted">
            Qəbullarınızı, pasiyentlərinizi və gündəlik iş yükünüzü izləyin.
          </p>
        </div>

        <button
          type="button"
          className="refresh"
          onClick={() => setRefresh((value) => value + 1)}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          {loading ? "Yüklənir..." : "Məlumatları yenilə"}
        </button>
      </header>

      {error && (
        <div className="error">
          <strong>Məlumat yüklənmədi.</strong> {error}
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              className="refresh"
              onClick={() => setRefresh((value) => value + 1)}
            >
              <RefreshCw size={14} />
              Yenidən cəhd et
            </button>
          </div>
        </div>
      )}

      <section className="welcome">
        <div className="welcome-content">
          <div className="welcome-label">
            <Activity size={13} />
            HƏKİM PANELİ
          </div>
          <h2>Xoş gəlmisiniz, həkim!</h2>
          <p>
            Bu günkü iş yükünüzü izləyin, gözləyən qəbullara baxın
            və pasiyentlərinizin qəbul vəziyyətini nəzarətdə saxlayın.
          </p>
        </div>

        <div className="welcome-icon">
          <Stethoscope size={36} />
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Ümumi qəbullar</span>
            <div className="stat-icon blue">
              <CalendarDays size={21} />
            </div>
          </div>
          <div className="stat-value">
            {loading ? "—" : appointments.length}
          </div>
          <div className="stat-note">
            <TrendingUp size={13} />
            Sizə görünən bütün qəbullar
          </div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Bugünkü qəbullar</span>
            <div className="stat-icon green">
              <CalendarCheck size={21} />
            </div>
          </div>
          <div className="stat-value">
            {loading ? "—" : todayAppointments.length}
          </div>
          <div className="stat-note">
            <CalendarDays size={13} />
            Bu gün üçün ləğv edilməyən qəbullar
          </div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Gözləyənlər</span>
            <div className="stat-icon orange">
              <Hourglass size={21} />
            </div>
          </div>
          <div className="stat-value">
            {loading ? "—" : pendingAppointments.length}
          </div>
          <div className="stat-note">
            <Clock size={13} />
            Statusu Pending olan qəbullar
          </div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Tamamlananlar</span>
            <div className="stat-icon green">
              <CheckCircle2 size={21} />
            </div>
          </div>
          <div className="stat-value">
            {loading ? "—" : completedAppointments.length}
          </div>
          <div className="stat-note">
            <CheckCircle2 size={13} />
            Tamamlanmış qəbullar
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">
              <div className="panel-title-icon">
                <CalendarClock size={19} />
              </div>
              <div>
                <h3>Yaxınlaşan qəbullar</h3>
                <div className="panel-subtitle">
                  Vaxtı yaxın olan aktiv qəbullar
                </div>
              </div>
            </div>

            <span className="count-badge">
              {loading ? "..." : `${upcomingAppointments.length} qeyd`}
            </span>
          </div>

          <div className="appointment-list">
            {loading ? (
              <div className="empty">
                <div style={{ maxWidth: 200, margin: "0 auto" }}>
                  <div className="loading-line" />
                  <div className="loading-line" style={{ marginTop: 12, width: "75%" }} />
                  <div className="loading-line" style={{ marginTop: 12, width: "90%" }} />
                </div>
                <div style={{ marginTop: 18 }}>Qəbullar yüklənir...</div>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">
                  <CalendarDays size={25} />
                </div>
                <strong>Yaxınlaşan qəbul yoxdur</strong>
                <div>
                  Hazırda gələcək tarixli aktiv qəbul görünmür.
                </div>
              </div>
            ) : (
              upcomingAppointments.map((item, index) => {
                const status = getStatus(item);

                return (
                  <div
                    className="appointment"
                    key={getAppointmentId(item) ?? `${getPatientId(item)}-${index}`}
                  >
                    <div className="person-icon">
                      <Users size={19} />
                    </div>

                    <div className="person-info">
                      <strong>{getPatientName(item)}</strong>
                      <span>
                        <Clock size={12} />
                        {formatAppointmentDate(getAppointmentDate(item))}
                      </span>
                    </div>

                    <span className={`status ${status}`}>
                      {statusLabel(status)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">
              <div className="panel-title-icon">
                <Activity size={19} />
              </div>
              <div>
                <h3>İş xülasəsi</h3>
                <div className="panel-subtitle">
                  Qəbul vəziyyətinin icmalı
                </div>
              </div>
            </div>
          </div>

          <div className="quick-list">
            <div className="quick-item">
              <div className="quick-icon">
                <CalendarDays size={19} />
              </div>
              <div>
                <strong>Bugünkü iş yükü</strong>
                <span>
                  {loading
                    ? "Məlumatlar yüklənir..."
                    : `${todayAppointments.length} qəbul`}
                </span>
              </div>
            </div>

            <div className="quick-item">
              <div className="quick-icon orange">
                <Hourglass size={19} />
              </div>
              <div>
                <strong>Gözləyən qəbullar</strong>
                <span>
                  {loading
                    ? "Məlumatlar yüklənir..."
                    : `${pendingAppointments.length} qəbul`}
                </span>
              </div>
            </div>

            <div className="quick-item">
              <div className="quick-icon green">
                <CheckCircle2 size={19} />
              </div>
              <div>
                <strong>Tamamlanmış qəbullar</strong>
                <span>
                  {loading
                    ? "Məlumatlar yüklənir..."
                    : `${completedAppointments.length} qəbul`}
                </span>
              </div>
            </div>

            <div className="quick-item">
              <div className="quick-icon red">
                <XCircle size={19} />
              </div>
              <div>
                <strong>Ləğv edilmiş qəbullar</strong>
                <span>
                  {loading
                    ? "Məlumatlar yüklənir..."
                    : `${cancelledAppointments.length} qəbul`}
                </span>
              </div>
            </div>

            <div className="quick-item">
              <div className="quick-icon">
                <Pill size={19} />
              </div>
              <div>
                <strong>Reseptlər</strong>
                <span>
                  Resept yazmaq üçün pasiyentin qəbulunu açın.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
