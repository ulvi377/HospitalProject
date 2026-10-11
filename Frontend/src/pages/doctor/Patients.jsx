
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  Users,
  Search,
  RefreshCw,
  UserRound,
  CalendarDays,
  Clock,
  FileText,
  Activity,
  ChevronRight,
} from "lucide-react";

const css = `
.doctor-patients {
  width:100%; min-width:0; padding:8px 4px 28px;
  color:#17243b; font-family:Inter,"Segoe UI",sans-serif;
}
.doctor-patients * { box-sizing:border-box; }
.doctor-patients .heading {
  display:flex; align-items:center; justify-content:space-between;
  flex-wrap:wrap; gap:16px; margin-bottom:25px;
}
.doctor-patients .eyebrow {
  font-size:11px; font-weight:800; letter-spacing:1.7px;
  color:#5375e7; margin-bottom:8px;
}
.doctor-patients h1 {
  margin:0; font-size:clamp(25px,3vw,32px);
  font-weight:800; letter-spacing:-1px; color:#15223b;
}
.doctor-patients .subtitle {
  margin:8px 0 0; color:#8994a8; font-size:13px;
}
.doctor-patients .refresh {
  display:flex; align-items:center; gap:9px;
  padding:11px 15px; border:1px solid #e4eaf3;
  background:#fff; color:#34435e; border-radius:12px;
  font-size:13px; font-weight:700; cursor:pointer;
}
.doctor-patients .refresh:hover { background:#f4f7ff; }
.doctor-patients .summary {
  display:grid; grid-template-columns:repeat(3,minmax(0,1fr));
  gap:15px; margin-bottom:22px;
}
.doctor-patients .summary-card {
  display:flex; align-items:center; gap:15px;
  background:#fff; border:1px solid #e8edf5;
  border-radius:16px; padding:20px;
  box-shadow:0 5px 20px #1d315005;
}
.doctor-patients .summary-icon {
  width:45px; height:45px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  border-radius:14px; color:#5375e7; background:#edf1ff;
}
.doctor-patients .summary-card:nth-child(2) .summary-icon {
  color:#15956b; background:#e5f8ef;
}
.doctor-patients .summary-card:nth-child(3) .summary-icon {
  color:#d58c27; background:#fff2df;
}
.doctor-patients .summary-label { font-size:12px; color:#8994a8; }
.doctor-patients .summary-value {
  margin-top:5px; font-size:26px; font-weight:800; color:#1a2944;
}
.doctor-patients .panel {
  background:#fff; border:1px solid #e8edf5;
  border-radius:17px; overflow:hidden;
  box-shadow:0 5px 20px #1d315005;
}
.doctor-patients .toolbar {
  padding:21px; display:flex; align-items:center;
  justify-content:space-between; flex-wrap:wrap; gap:15px;
  border-bottom:1px solid #edf0f6;
}
.doctor-patients .toolbar h2 {
  margin:0; font-size:16px; font-weight:800; color:#1b2943;
}
.doctor-patients .toolbar p {
  margin:7px 0 0; font-size:12px; color:#8994a8;
}
.doctor-patients .search {
  display:flex; align-items:center; gap:9px;
  padding:11px 13px; border:1px solid #e5eaf3;
  border-radius:11px; background:#fbfcff; color:#8793a7;
}
.doctor-patients .search input {
  width:230px; min-width:0; border:0; outline:0;
  background:transparent; color:#263550; font-size:12px;
}
.doctor-patients .patient-grid {
  padding:20px; display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px;
}
.doctor-patients .patient-card {
  min-width:0; border:1px solid #e9edf5; border-radius:15px;
  padding:19px; transition:transform .2s,box-shadow .2s,border-color .2s;
  background:#fff;
}
.doctor-patients .patient-card:hover {
  transform:translateY(-3px); border-color:#d7e0ff;
  box-shadow:0 10px 28px #243b7010;
}
.doctor-patients .patient-top {
  display:flex; align-items:center; gap:12px; margin-bottom:17px;
}
.doctor-patients .avatar {
  width:47px; height:47px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  background:#edf1ff; color:#5375e7; border-radius:15px;
}
.doctor-patients .patient-name {
  min-width:0; font-size:14px; font-weight:800;
  color:#263550; overflow-wrap:anywhere;
}
.doctor-patients .patient-id {
  margin-top:5px; font-size:11px; color:#909bad;
}
.doctor-patients .divider { height:1px; background:#edf0f6; margin:14px 0; }
.doctor-patients .info-row {
  display:flex; align-items:flex-start; gap:9px;
  color:#77849a; font-size:12px; line-height:1.5;
  margin-top:12px;
}
.doctor-patients .info-row svg {
  color:#8798b8; flex-shrink:0; margin-top:1px;
}
.doctor-patients .info-row strong {
  color:#43516a; font-weight:600; overflow-wrap:anywhere;
}
.doctor-patients .last-visit {
  display:flex; align-items:center; gap:8px;
  background:#f6f8ff; color:#66769b;
  padding:10px 11px; border-radius:10px;
  font-size:11px; margin-top:16px;
}
.doctor-patients .last-visit strong { color:#3d548c; }
.doctor-patients .empty,
.doctor-patients .loading {
  min-height:240px; display:flex; align-items:center;
  justify-content:center; flex-direction:column; gap:12px;
  color:#8994a8; font-size:13px; text-align:center; padding:25px;
}
.doctor-patients .empty-icon {
  width:55px; height:55px; display:flex; align-items:center;
  justify-content:center; border-radius:17px;
  background:#eff2ff; color:#5375e7;
}
.doctor-patients .error {
  margin:18px; padding:15px; border-radius:11px;
  border:1px solid #f0d0d2; background:#fff7f7;
  color:#bd4851; font-size:13px;
}
.doctor-patients .footer {
  padding:15px 21px; border-top:1px solid #edf0f6;
  color:#8994a8; font-size:11px;
}
.doctor-patients .spin { animation:patient-spin .8s linear infinite; }
@keyframes patient-spin { to { transform:rotate(360deg); } }
@media(max-width:1150px) {
  .doctor-patients .patient-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media(max-width:850px) {
  .doctor-patients .summary { grid-template-columns:1fr; gap:10px; }
  .doctor-patients .summary-card { padding:15px; }
}
@media(max-width:560px) {
  .doctor-patients .patient-grid { grid-template-columns:1fr; padding:13px; }
  .doctor-patients .toolbar { padding:15px; }
  .doctor-patients .search { width:100%; }
  .doctor-patients .search input { width:100%; }
}
`;

const formatDate = (value) => {
  if (!value) return "Tarix göstərilməyib";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tarix göstərilməyib";

  return date.toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function Patients() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadPatients() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/Appointment");

        if (active) {
          setAppointments(
            Array.isArray(response.data) ? response.data : []
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Pasiyent siyahısını yükləmək mümkün olmadı. API bağlantısını və giriş icazəsini yoxlayın."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPatients();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const patients = useMemo(() => {
    const uniquePatients = new Map();

    appointments.forEach((appointment) => {
      const patientId = appointment.patientId ?? appointment.patient?.id;

      if (patientId == null) return;

      const current = uniquePatients.get(String(patientId));
      const appointmentDate = appointment.appointmentDate
        ? new Date(appointment.appointmentDate)
        : null;

      if (!current) {
        uniquePatients.set(String(patientId), {
          id: patientId,
          fullName:
            appointment.patient?.fullName || `Pasiyent #${patientId}`,
          appointments: [appointment],
          lastAppointment: appointment,
          lastAppointmentDate: appointmentDate,
        });
      } else {
        current.appointments.push(appointment);

        if (
          appointmentDate &&
          !Number.isNaN(appointmentDate.getTime()) &&
          (!current.lastAppointmentDate ||
            appointmentDate > current.lastAppointmentDate)
        ) {
          current.lastAppointment = appointment;
          current.lastAppointmentDate = appointmentDate;
        }

        if (
          appointment.patient?.fullName &&
          current.fullName.startsWith("Pasiyent #")
        ) {
          current.fullName = appointment.patient.fullName;
        }
      }
    });

    return Array.from(uniquePatients.values()).sort((a, b) =>
      a.fullName.localeCompare(b.fullName, "az")
    );
  }, [appointments]);

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return patients;

    return patients.filter(
      (patient) =>
        patient.fullName.toLowerCase().includes(term) ||
        String(patient.id).includes(term)
    );
  }, [patients, search]);

  const totalAppointments = appointments.length;

  const pendingAppointments = appointments.filter(
    (appointment) =>
      String(appointment.status || "Pending").toLowerCase() === "pending"
  ).length;

  return (
    <div className="doctor-patients">
      <style>{css}</style>

      <header className="heading">
        <div>
          <div className="eyebrow">DOCTOR WORKSPACE</div>
          <h1>Pasiyentlər</h1>
          <p className="subtitle">
            Qəbullarınıza əsasən pasiyent siyahınıza baxın.
          </p>
        </div>

        <button
          className="refresh"
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Yenilə
        </button>
      </header>

      <section className="summary">
        <div className="summary-card">
          <div className="summary-icon"><Users size={22} /></div>
          <div>
            <div className="summary-label">Pasiyent sayı</div>
            <div className="summary-value">{loading ? "—" : patients.length}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon"><CalendarDays size={22} /></div>
          <div>
            <div className="summary-label">Ümumi qəbullar</div>
            <div className="summary-value">
              {loading ? "—" : totalAppointments}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon"><Clock size={22} /></div>
          <div>
            <div className="summary-label">Gözləyən qəbullar</div>
            <div className="summary-value">
              {loading ? "—" : pendingAppointments}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="toolbar">
          <div>
            <h2>Pasiyent siyahısı</h2>
            <p>Hər pasiyentin qəbul sayını və son qəbul tarixini görün.</p>
          </div>

          <label className="search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ad və ya pasiyent ID-si..."
            />
          </label>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">
            <RefreshCw size={25} className="spin" />
            Pasiyentlər yüklənir...
          </div>
        ) : !error && filteredPatients.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><Users size={27} /></div>
            <strong>
              {search ? "Pasiyent tapılmadı" : "Pasiyent siyahısı boşdur"}
            </strong>
            <span>
              {search
                ? "Başqa ad və ya ID ilə axtarış edin."
                : "Sizə aid qəbullar olduqda pasiyentlər burada görünəcək."}
            </span>
          </div>
        ) : !error ? (
          <div className="patient-grid">
            {filteredPatients.map((patient) => (
              <article className="patient-card" key={patient.id}>
                <div className="patient-top">
                  <div className="avatar"><UserRound size={23} /></div>
                  <div>
                    <div className="patient-name">{patient.fullName}</div>
                    <div className="patient-id">Pasiyent ID: #{patient.id}</div>
                  </div>
                </div>

                <div className="divider" />

                <div className="info-row">
                  <CalendarDays size={16} />
                  <span>
                    Qəbul sayı:{" "}
                    <strong>{patient.appointments.length}</strong>
                  </span>
                </div>

                <div className="info-row">
                  <Activity size={16} />
                  <span>
                    Son qəbul:{" "}
                    <strong>
                      {formatDate(patient.lastAppointment?.appointmentDate)}
                    </strong>
                  </span>
                </div>

                <div className="info-row">
                  <FileText size={16} />
                  <span>
                    Son qəbul statusu:{" "}
                    <strong>
                      {patient.lastAppointment?.status || "Gözləyir"}
                    </strong>
                  </span>
                </div>

                <div className="last-visit">
                  <Clock size={15} />
                  <span>
                    Pasiyent ID-si <strong>#{patient.id}</strong>
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        <div className="footer">
          Göstərilir: {loading ? "—" : filteredPatients.length} pasiyent
        </div>
      </section>
    </div>
  );
}
