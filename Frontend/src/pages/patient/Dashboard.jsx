
import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Bell,
  RefreshCw,
  MapPin,
  ChevronRight,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContext";
import patientService from "../../services/patientService";
import appointmentService from "../../services/appointmentService";
import "./Dashboard.css";

function getList(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

function formatDate(value) {
  if (!value) return "Tarix göstərilməyib";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tarix göstərilməyib";
  }

  return date.toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "--:--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString("az-AZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "confirmed" || value === "təsdiqlənib") {
    return {
      label: "Təsdiqlənib",
      className: "patient-status-confirmed",
    };
  }

  if (value === "completed" || value === "tamamlanıb") {
    return {
      label: "Tamamlanıb",
      className: "patient-status-completed",
    };
  }

  if (
    value === "cancelled" ||
    value === "canceled" ||
    value === "ləğv edilib"
  ) {
    return {
      label: "Ləğv edilib",
      className: "patient-status-cancelled",
    };
  }

  return {
    label: "Gözləyir",
    className: "patient-status-pending",
  };
}

function getInitials(name) {
  return (
    String(name || "P")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P"
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        patientService.getAll(),
        appointmentService.getAll(),
      ]);

      const patientResult = results[0];
      const appointmentResult = results[1];

      if (patientResult.status === "fulfilled") {
        const patientList = getList(patientResult.value);
        setPatient(patientList[0] || null);
      } else {
        setPatient(null);
      }

      if (appointmentResult.status === "fulfilled") {
        setAppointments(getList(appointmentResult.value));
      } else {
        setAppointments([]);
      }

      if (
        patientResult.status === "rejected" &&
        appointmentResult.status === "rejected"
      ) {
        setError(
          "Məlumatları yükləmək mümkün olmadı. Hesabına yenidən daxil olmağı yoxla."
        );
      } else if (
        patientResult.status === "rejected" ||
        appointmentResult.status === "rejected"
      ) {
        setError(
          "Bəzi məlumatlar yüklənmədi. Daha sonra yenidən cəhd edə bilərsən."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();

    return appointments
      .filter((appointment) => {
        const date = new Date(appointment.appointmentDate);
        const status = String(appointment.status || "").toLowerCase();

        return (
          !Number.isNaN(date.getTime()) &&
          date >= now &&
          !["cancelled", "canceled", "ləğv edilib"].includes(status)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.appointmentDate) - new Date(b.appointmentDate)
      );
  }, [appointments]);

  const completedCount = appointments.filter((appointment) =>
    ["completed", "tamamlanıb"].includes(
      String(appointment.status || "").toLowerCase()
    )
  ).length;

  const pendingCount = appointments.filter((appointment) =>
    ["pending", "confirmed", "gözləyir", "təsdiqlənib"].includes(
      String(appointment.status || "").toLowerCase()
    )
  ).length;

  const firstName =
    patient?.fullName?.trim().split(/\s+/)[0] ||
    user?.name?.trim().split(/\s+/)[0] ||
    "Pasiyent";

  const today = new Date().toLocaleDateString("az-AZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const recentAppointments = [...appointments]
    .sort(
      (a, b) =>
        new Date(b.appointmentDate) - new Date(a.appointmentDate)
    )
    .slice(0, 4);

  const nextAppointment = upcomingAppointments[0];

  return (
    <main className="patient-dashboard">
      <header className="pd-topbar">
        <div className="pd-breadcrumb">
          <span>Şəxsi kabinet</span>
          <ChevronRight size={14} />
          <strong>İcmal</strong>
        </div>

        <div className="pd-topbar-right">
          <span className="pd-today">
            <CalendarDays size={15} />
            {today}
          </span>

          <Link
            to="/patient/notifications"
            className="pd-notification"
            aria-label="Bildirişlər"
          >
            <Bell size={19} />
          </Link>

          <div className="pd-top-avatar">
            {getInitials(patient?.fullName || user?.name)}
          </div>
        </div>
      </header>

      {/* Xoş gəldin */}
      <section className="pd-welcome">
        <div className="pd-welcome-content">
          <span className="pd-eyebrow">
            <Activity size={14} />
            AVROPA HOSPITAL · ŞƏXSİ KABİNET
          </span>

          <h1>Xoş gəldin, {firstName}!</h1>

          <p>
            Sağlamlığınla bağlı məlumatları bir yerdən izlə,
            həkimlərini tap və qəbul vaxtlarını rahat idarə et.
          </p>

          <div className="pd-welcome-actions">
            <Link
              to="/patient/book-appointment"
              className="pd-primary-button"
            >
              <CalendarPlus size={17} />
              Qəbul götür
              <ArrowRight size={16} />
            </Link>

            <Link to="/patient/doctors" className="pd-outline-button">
              <Search size={17} />
              Həkimləri tap
            </Link>

            <Link
              to="/patient/pain-assessment"
              className="pd-outline-button"
            >
              <HeartPulse size={17} />
              Ağrı analizi
            </Link>
          </div>
        </div>

        <div className="pd-welcome-art" aria-hidden="true">
          <div className="pd-art-circle pd-art-circle-one" />
          <div className="pd-art-circle pd-art-circle-two" />

          <div className="pd-art-cross">
            <span />
            <i />
          </div>

          <div className="pd-art-card">
            <div className="pd-art-card-icon">
              <HeartPulse size={25} />
            </div>

            <div>
              <strong>Sağlamlığın önəmlidir</strong>
              <span>Özünə yaxşı bax!</span>
            </div>

            <CheckCircle2 size={21} className="pd-art-check" />
          </div>

          <div className="pd-art-mini-card">
            <Activity size={20} />
            <span>
              <strong>Sağlamlıq</strong>
              <small>Qayğı ilə başla</small>
            </span>
          </div>
        </div>
      </section>

      {error && (
        <div className="pd-error">
          <span>{error}</span>

          <button type="button" onClick={loadDashboard}>
            <RefreshCw size={14} />
            Yenidən yoxla
          </button>
        </div>
      )}

      {/* Statistikalar */}
      <section className="pd-stat-grid">
        <article className="pd-stat-card">
          <div className="pd-stat-top">
            <span className="pd-stat-icon pd-blue">
              <CalendarDays size={21} />
            </span>
            <span className="pd-stat-tag">Bütün tarixçə</span>
          </div>

          <span className="pd-stat-label">Ümumi qəbullarım</span>

          <strong className="pd-stat-number">
            {loading ? "—" : appointments.length}
          </strong>

          <span className="pd-stat-foot">Sistemdə olan qəbullar</span>
        </article>

        <article className="pd-stat-card">
          <div className="pd-stat-top">
            <span className="pd-stat-icon pd-purple">
              <Clock3 size={21} />
            </span>
            <span className="pd-stat-tag">Aktiv</span>
          </div>

          <span className="pd-stat-label">Qarşıdakı qəbullar</span>

          <strong className="pd-stat-number">
            {loading ? "—" : upcomingAppointments.length}
          </strong>

          <span className="pd-stat-foot">Gələcək görüşlərin</span>
        </article>

        <article className="pd-stat-card">
          <div className="pd-stat-top">
            <span className="pd-stat-icon pd-green">
              <CheckCircle2 size={21} />
            </span>
            <span className="pd-stat-tag">Tarixçə</span>
          </div>

          <span className="pd-stat-label">Tamamlanan qəbullar</span>

          <strong className="pd-stat-number">
            {loading ? "—" : completedCount}
          </strong>

          <span className="pd-stat-foot">Keçirilmiş görüşlərin</span>
        </article>

        <article className="pd-stat-card">
          <div className="pd-stat-top">
            <span className="pd-stat-icon pd-orange">
              <Activity size={21} />
            </span>
            <span className="pd-stat-tag">Status</span>
          </div>

          <span className="pd-stat-label">Aktiv müraciətlər</span>

          <strong className="pd-stat-number">
            {loading ? "—" : pendingCount}
          </strong>

          <span className="pd-stat-foot">
            Gözləyən və təsdiqlənən
          </span>
        </article>
      </section>

      {/* Qəbullar və profil */}
      <section className="pd-content-grid">
        <div className="pd-panel pd-appointments-panel">
          <div className="pd-panel-heading">
            <div>
              <span className="pd-panel-eyebrow">QƏBULLARIN</span>
              <h2>Yaxınlaşan qəbul</h2>
              <p>Növbəti həkim görüşün və qəbul məlumatları.</p>
            </div>

            <Link to="/patient/appointments" className="pd-view-all">
              Hamısına bax <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="pd-loading">
              <span className="pd-spinner" />
              Məlumatlar yüklənir...
            </div>
          ) : nextAppointment ? (
            <div className="pd-next-appointment">
              <div className="pd-next-date">
                <span>
                  {new Date(nextAppointment.appointmentDate)
                    .toLocaleDateString("az-AZ", { month: "short" })}
                </span>

                <strong>
                  {new Date(nextAppointment.appointmentDate).getDate()}
                </strong>

                <small>
                  {new Date(nextAppointment.appointmentDate)
                    .toLocaleDateString("az-AZ", { weekday: "short" })}
                </small>
              </div>

              <div className="pd-next-info">
                <span className="pd-next-label">NÖVBƏTİ GÖRÜŞ</span>

                <h3>
                  {nextAppointment.doctor?.fullName || "Həkim məlumatı"}
                </h3>

                <p>
                  <Clock3 size={14} />
                  {formatTime(nextAppointment.appointmentDate)}
                  <span className="pd-info-separator">•</span>
                  <Stethoscope size={14} />
                  Həkim qəbulu
                </p>

                <span
                  className={`pd-status ${
                    getStatus(nextAppointment.status).className
                  }`}
                >
                  {getStatus(nextAppointment.status).label}
                </span>
              </div>

              <Link
                to="/patient/appointments"
                className="pd-next-arrow"
                aria-label="Qəbul məlumatlarına bax"
              >
                <ArrowRight size={19} />
              </Link>
            </div>
          ) : (
            <div className="pd-empty">
              <div className="pd-empty-icon">
                <CalendarDays size={25} />
              </div>

              <strong>Qarşıda qəbul yoxdur</strong>

              <p>
                Həkim seçərək özün üçün yeni qəbul vaxtı təyin edə bilərsən.
              </p>

              <Link
                to="/patient/book-appointment"
                className="pd-empty-link"
              >
                Qəbul vaxtı seç <ArrowRight size={15} />
              </Link>
            </div>
          )}

          <div className="pd-subsection-heading">
            <h3>Son qəbullar</h3>
            <Link to="/patient/appointments">Tarixçəyə bax</Link>
          </div>

          {loading ? (
            <div className="pd-table-placeholder">
              Qəbullar yüklənir...
            </div>
          ) : recentAppointments.length > 0 ? (
            <div className="pd-recent-list">
              {recentAppointments.map((appointment) => {
                const status = getStatus(appointment.status);

                return (
                  <div className="pd-recent-item" key={appointment.id}>
                    <div className="pd-doctor-avatar">
                      <Stethoscope size={19} />
                    </div>

                    <div className="pd-recent-main">
                      <strong>
                        {appointment.doctor?.fullName || "Həkim"}
                      </strong>

                      <span>
                        {formatDate(appointment.appointmentDate)}
                        {" · "}
                        {formatTime(appointment.appointmentDate)}
                      </span>
                    </div>

                    <span className={`pd-status ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="pd-recent-empty">
              Qəbul tarixçən burada görünəcək.
            </p>
          )}
        </div>

        {/* Sağ tərəf */}
        <aside className="pd-side-column">
          <div className="pd-panel pd-profile-panel">
            <div className="pd-panel-heading">
              <div>
                <span className="pd-panel-eyebrow">
                  ŞƏXSİ MƏLUMATLAR
                </span>
                <h2>Profilim</h2>
              </div>

              <Link
                to="/patient/profile"
                className="pd-round-link"
                aria-label="Profili redaktə et"
              >
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="pd-profile-user">
              <div className="pd-profile-avatar">
                {getInitials(patient?.fullName || user?.name)}
              </div>

              <div className="pd-profile-user-info">
                <strong>
                  {patient?.fullName || user?.name || "Pasiyent"}
                </strong>
                <span>Pasiyent hesabı</span>
              </div>

              <ShieldCheck size={19} className="pd-profile-shield" />
            </div>

            <div className="pd-profile-details">
              <div>
                <span>Telefon</span>
                <strong>
                  {patient?.phoneNumber || "Qeyd edilməyib"}
                </strong>
              </div>

              <div>
                <span>Doğum tarixi</span>
                <strong>{formatDate(patient?.dateOfBirth)}</strong>
              </div>

              <div>
                <span>Ünvan</span>
                <strong className="pd-profile-address">
                  {patient?.address || "Qeyd edilməyib"}
                </strong>
              </div>
            </div>

            <Link to="/patient/profile" className="pd-profile-edit">
              <UserRound size={16} />
              Profil məlumatlarını idarə et
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="pd-health-card">
            <div className="pd-health-icon">
              <HeartPulse size={24} />
            </div>

            <span className="pd-health-eyebrow">SAĞLAMLIĞIN ÜÇÜN</span>

            <h3>Öz sağlamlığını izləməyə davam et</h3>

            <p>
              Həkim qəbulunu planlaşdır və tibbi məlumatlarını bir yerdə saxla.
            </p>

            <Link to="/patient/medical-history">
              Tibbi tarixçəm <ArrowRight size={16} />
            </Link>

            <div className="pd-health-decoration">
              <HeartPulse size={100} />
            </div>
          </div>

          <div className="pd-quick-panel">
            <span className="pd-panel-eyebrow">SÜRƏTLİ KEÇİDLƏR</span>
            <h2>Sənə lazım olanlar</h2>

            <Link to="/patient/doctors" className="pd-quick-link">
              <span className="pd-quick-icon pd-blue">
                <Stethoscope size={18} />
              </span>

              <span>
                <strong>Həkimlər</strong>
                <small>Mütəxəssis seç</small>
              </span>

              <ChevronRight size={17} />
            </Link>

            <Link to="/patient/appointments" className="pd-quick-link">
              <span className="pd-quick-icon pd-purple">
                <CalendarDays size={18} />
              </span>

              <span>
                <strong>Qəbullarım</strong>
                <small>Görüşlərini izlə</small>
              </span>

              <ChevronRight size={17} />
            </Link>

            <Link to="/patient/prescriptions" className="pd-quick-link">
              <span className="pd-quick-icon pd-green">
                <Activity size={18} />
              </span>

              <span>
                <strong>Reseptlərim</strong>
                <small>Təyin edilmiş reseptlər</small>
              </span>

              <ChevronRight size={17} />
            </Link>

            {/* Yeni əlavə edilən ağrı analizi keçidi */}
            <Link
              to="/patient/pain-assessment"
              className="pd-quick-link"
            >
              <span className="pd-quick-icon pd-blue">
                <HeartPulse size={18} />
              </span>

              <span>
                <strong>Ağrı analizi</strong>
                <small>Bədən nahiyəsini seç və ağrını qiymətləndir</small>
              </span>

              <ChevronRight size={17} />
            </Link>
          </div>
        </aside>
      </section>

      <footer className="pd-footer">
        <span>© {new Date().getFullYear()} Avropa Hospital</span>

        <span>
          <MapPin size={13} />
          Sağlamlığınız bizim üçün önəmlidir
        </span>
      </footer>
    </main>
  );
}
