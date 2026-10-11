
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  CalendarDays,
  ClipboardList,
  FileText,
  Activity,
  Phone,
  Mail,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";

const styles = `
* { box-sizing: border-box; }

.pd-page {
  min-height: 100vh;
  padding: 26px;
  background: #f5f7fb;
  color: #17243b;
  font-family: Inter, Arial, sans-serif;
}

.pd-container {
  max-width: 1250px;
  margin: 0 auto;
}

.pd-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.pd-back {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  border: 1px solid #e1e7f0;
  background: #fff;
  color: #34445c;
  padding: 11px 15px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: .2s;
}

.pd-back:hover {
  background: #edf4ff;
  color: #2563eb;
}

.pd-heading h1 {
  margin: 0 0 7px;
  font-size: 27px;
  font-weight: 750;
  letter-spacing: -.7px;
}

.pd-heading p {
  margin: 0;
  color: #8490a3;
  font-size: 13px;
}

.pd-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}

.pd-card {
  background: #fff;
  border: 1px solid #e9edf4;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(25, 45, 80, .035);
  overflow: hidden;
}

.pd-profile-top {
  padding: 27px 22px 23px;
  text-align: center;
  border-bottom: 1px solid #edf0f5;
}

.pd-avatar {
  width: 82px;
  height: 82px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  background: #eaf2ff;
  color: #3168d8;
  border-radius: 23px;
  overflow: hidden;
}

.pd-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pd-profile-top h2 {
  margin: 0 0 7px;
  font-size: 19px;
  font-weight: 750;
  overflow-wrap: anywhere;
}

.pd-profile-top p {
  margin: 0;
  font-size: 12px;
  color: #8793a6;
}

.pd-info {
  padding: 20px;
}

.pd-info-title {
  font-size: 12px;
  font-weight: 750;
  color: #9aa5b5;
  text-transform: uppercase;
  letter-spacing: .8px;
  margin: 0 0 17px;
}

.pd-info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 19px;
  min-width: 0;
}

.pd-info-row:last-child {
  margin-bottom: 0;
}

.pd-info-icon {
  flex-shrink: 0;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f5ff;
  color: #4878dc;
  border-radius: 10px;
}

.pd-info-label {
  color: #98a2b3;
  font-size: 11px;
  margin-bottom: 5px;
}

.pd-info-value {
  color: #334258;
  font-size: 13px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.pd-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.pd-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px;
}

.pd-stat {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 20px 17px;
  background: #fff;
  border: 1px solid #e9edf4;
  border-radius: 14px;
  min-width: 0;
}

.pd-stat-icon {
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.pd-blue { background: #eaf2ff; color: #3268d8; }
.pd-green { background: #e6f8ef; color: #15965a; }
.pd-orange { background: #fff2df; color: #d78b18; }

.pd-stat-number {
  font-size: 23px;
  font-weight: 750;
  line-height: 1.2;
}

.pd-stat-label {
  margin-top: 5px;
  color: #8995a7;
  font-size: 11px;
}

.pd-section {
  padding: 22px;
}

.pd-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.pd-section-head h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
}

.pd-section-head p {
  margin: 6px 0 0;
  color: #98a2b3;
  font-size: 12px;
}

.pd-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 29px;
  height: 27px;
  padding: 0 8px;
  border-radius: 8px;
  background: #edf3ff;
  color: #3268d8;
  font-size: 12px;
  font-weight: 700;
}

.pd-table-wrap {
  overflow-x: auto;
}

.pd-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 480px;
}

.pd-table th {
  padding: 12px 13px;
  text-align: left;
  background: #f7f9fc;
  color: #8c98aa;
  font-size: 10px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: .5px;
  white-space: nowrap;
}

.pd-table td {
  padding: 15px 13px;
  border-bottom: 1px solid #f0f2f6;
  color: #526077;
  font-size: 12px;
}

.pd-table tr:last-child td {
  border-bottom: none;
}

.pd-status {
  display: inline-flex;
  padding: 6px 9px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.pd-status-pending { background: #fff3d9; color: #b77910; }
.pd-status-confirmed { background: #e5efff; color: #3268d8; }
.pd-status-completed { background: #e2f7eb; color: #16834d; }
.pd-status-cancelled { background: #ffe8e8; color: #cf4545; }
.pd-status-other { background: #edf0f5; color: #65738a; }

.pd-notes {
  color: #65738a;
  line-height: 1.6;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.pd-empty {
  text-align: center;
  padding: 35px 15px;
  color: #97a2b3;
  font-size: 13px;
}

.pd-empty-icon {
  margin-bottom: 10px;
  color: #b4c0d1;
}

.pd-alert {
  padding: 14px 16px;
  background: #fff0f0;
  border: 1px solid #ffdada;
  color: #bd4141;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 18px;
  overflow-wrap: anywhere;
}

.pd-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  min-height: 260px;
  color: #8290a5;
  font-size: 14px;
}

.pd-retry {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
  padding: 9px 13px;
  background: #fff;
  border: 1px solid #e3e9f2;
  border-radius: 8px;
  cursor: pointer;
  color: #34445c;
}

@media (max-width: 950px) {
  .pd-layout { grid-template-columns: 1fr; }
  .pd-profile-top { display: flex; align-items: center; gap: 16px; text-align: left; }
  .pd-avatar { margin: 0; width: 65px; height: 65px; flex-shrink: 0; }
  .pd-stats { gap: 10px; }
  .pd-stat { padding: 15px 12px; }
}

@media (max-width: 600px) {
  .pd-page { padding: 15px; }
  .pd-heading h1 { font-size: 22px; }
  .pd-stats { grid-template-columns: 1fr; }
  .pd-stat { padding: 15px; }
  .pd-section { padding: 16px; }
  .pd-profile-top { padding: 20px 16px; }
  .pd-info { padding: 18px 16px; }
}
`;

const getStatusClass = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "pending") return "pd-status-pending";
  if (value === "confirmed") return "pd-status-confirmed";
  if (value === "completed") return "pd-status-completed";
  if (value === "cancelled") return "pd-status-cancelled";

  return "pd-status-other";
};

const getStatusLabel = (status) => {
  const labels = {
    pending: "Gözləyir",
    confirmed: "Təsdiqlənib",
    completed: "Tamamlanıb",
    cancelled: "Ləğv edilib",
  };

  return labels[String(status || "").toLowerCase()] || status || "Naməlum";
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleTimeString("az-AZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPatientDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const appointmentsResponse = await api.get("/Appointment");
      const allAppointments = Array.isArray(appointmentsResponse.data)
        ? appointmentsResponse.data
        : [];

      const patientAppointments = allAppointments.filter(
        (item) => String(item.patientId ?? item.patient?.id) === String(id)
      );

      setAppointments(
        patientAppointments.sort(
          (a, b) =>
            new Date(b.appointmentDate) - new Date(a.appointmentDate)
        )
      );

      const foundPatient = patientAppointments.find((item) => item.patient)?.patient;

      if (foundPatient) {
        setPatient(foundPatient);
      } else {
        setPatient(null);
      }

      try {
        const recordsResponse = await api.get("/MedicalRecord");
        const allRecords = Array.isArray(recordsResponse.data)
          ? recordsResponse.data
          : [];

        setRecords(
          allRecords.filter(
            (item) =>
              String(item.patientId ?? item.patient?.id) === String(id)
          )
        );
      } catch {
        setRecords([]);
      }

      if (!foundPatient && patientAppointments.length === 0) {
        setError(
          "Bu pasiyent üçün məlumat tapılmadı. Pasiyent qəbul siyahınızda olmaya bilər."
        );
      }
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Sessiya bitib. Yenidən daxil olun."
          : err.response?.status === 403
          ? "Bu məlumatlara baxmaq üçün icazəniz yoxdur."
          : err.response?.data?.message ||
            "Pasiyent məlumatlarını yükləmək mümkün olmadı."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientDetails();
  }, [id]);

  const completedCount = appointments.filter(
    (item) => String(item.status).toLowerCase() === "completed"
  ).length;

  const nextAppointment = appointments
    .filter(
      (item) =>
        new Date(item.appointmentDate) >= new Date() &&
        !["cancelled", "completed"].includes(
          String(item.status).toLowerCase()
        )
    )
    .sort(
      (a, b) =>
        new Date(a.appointmentDate) - new Date(b.appointmentDate)
    )[0];

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="pd-page">
          <div className="pd-container">
            <div className="pd-loading">
              <RefreshCw size={19} />
              Pasiyent məlumatları yüklənir...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="pd-page">
        <div className="pd-container">
          <div className="pd-top">
            <div className="pd-heading">
              <h1>Pasiyent məlumatları</h1>
              <p>Pasiyentin qəbul tarixçəsi və tibbi məlumatları</p>
            </div>

            <button
              className="pd-back"
              onClick={() => navigate("/doctor/patients")}
            >
              <ArrowLeft size={16} />
              Pasiyentlərə qayıt
            </button>
          </div>

          {error && (
            <div className="pd-alert">
              <AlertCircle
                size={17}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              {error}
              <br />
              <button className="pd-retry" onClick={loadPatientDetails}>
                <RefreshCw size={14} />
                Yenidən yoxla
              </button>
            </div>
          )}

          <div className="pd-layout">
            <aside className="pd-card">
              <div className="pd-profile-top">
                <div className="pd-avatar">
                  {patient?.imageUrl ? (
                    <img src={patient.imageUrl} alt="Pasiyent" />
                  ) : (
                    <UserRound size={35} />
                  )}
                </div>

                <div>
                  <h2>
                    {patient?.fullName || `Pasiyent #${id}`}
                  </h2>
                  <p>Pasiyent profili</p>
                </div>
              </div>

              <div className="pd-info">
                <h3 className="pd-info-title">Əlaqə məlumatları</h3>

                <div className="pd-info-row">
                  <div className="pd-info-icon">
                    <Mail size={17} />
                  </div>
                  <div>
                    <div className="pd-info-label">E-poçt</div>
                    <div className="pd-info-value">
                      {patient?.email || "Məlumat yoxdur"}
                    </div>
                  </div>
                </div>

                <div className="pd-info-row">
                  <div className="pd-info-icon">
                    <Phone size={17} />
                  </div>
                  <div>
                    <div className="pd-info-label">Telefon</div>
                    <div className="pd-info-value">
                      {patient?.phoneNumber ||
                        patient?.phone ||
                        "Məlumat yoxdur"}
                    </div>
                  </div>
                </div>

                <div className="pd-info-row">
                  <div className="pd-info-icon">
                    <CalendarDays size={17} />
                  </div>
                  <div>
                    <div className="pd-info-label">İlk qəbul</div>
                    <div className="pd-info-value">
                      {appointments.length
                        ? formatDate(
                            [...appointments].sort(
                              (a, b) =>
                                new Date(a.appointmentDate) -
                                new Date(b.appointmentDate)
                            )[0].appointmentDate
                          )
                        : "Qəbul yoxdur"}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <main className="pd-main">
              <div className="pd-stats">
                <div className="pd-stat">
                  <div className="pd-stat-icon pd-blue">
                    <CalendarDays size={21} />
                  </div>
                  <div>
                    <div className="pd-stat-number">
                      {appointments.length}
                    </div>
                    <div className="pd-stat-label">Ümumi qəbul</div>
                  </div>
                </div>

                <div className="pd-stat">
                  <div className="pd-stat-icon pd-green">
                    <ClipboardList size={21} />
                  </div>
                  <div>
                    <div className="pd-stat-number">
                      {completedCount}
                    </div>
                    <div className="pd-stat-label">Tamamlanmış qəbul</div>
                  </div>
                </div>

                <div className="pd-stat">
                  <div className="pd-stat-icon pd-orange">
                    <FileText size={21} />
                  </div>
                  <div>
                    <div className="pd-stat-number">{records.length}</div>
                    <div className="pd-stat-label">Tibbi qeyd</div>
                  </div>
                </div>
              </div>

              <section className="pd-card pd-section">
                <div className="pd-section-head">
                  <div>
                    <h3>Qəbul tarixçəsi</h3>
                    <p>Pasiyentin bütün qəbul qeydləri</p>
                  </div>
                  <span className="pd-count">{appointments.length}</span>
                </div>

                {appointments.length === 0 ? (
                  <div className="pd-empty">
                    <div className="pd-empty-icon">
                      <CalendarDays size={28} />
                    </div>
                    Bu pasiyent üçün qəbul qeydi yoxdur.
                  </div>
                ) : (
                  <div className="pd-table-wrap">
                    <table className="pd-table">
                      <thead>
                        <tr>
                          <th>Tarix</th>
                          <th>Saat</th>
                          <th>Status</th>
                          <th>Qeyd</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((item) => (
                          <tr key={item.id}>
                            <td>{formatDate(item.appointmentDate)}</td>
                            <td>{formatTime(item.appointmentDate)}</td>
                            <td>
                              <span
                                className={`pd-status ${getStatusClass(
                                  item.status
                                )}`}
                              >
                                {getStatusLabel(item.status)}
                              </span>
                            </td>
                            <td>
                              {item.notes || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="pd-card pd-section">
                <div className="pd-section-head">
                  <div>
                    <h3>Tibbi qeydlər</h3>
                    <p>Pasiyent haqqında saxlanılmış qeydlər</p>
                  </div>
                  <span className="pd-count">{records.length}</span>
                </div>

                {records.length === 0 ? (
                  <div className="pd-empty">
                    <div className="pd-empty-icon">
                      <Activity size={28} />
                    </div>
                    Tibbi qeyd tapılmadı.
                  </div>
                ) : (
                  <div className="pd-table-wrap">
                    <table className="pd-table">
                      <thead>
                        <tr>
                          <th>Tarix</th>
                          <th>Diaqnoz</th>
                          <th>Açıqlama</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((record) => (
                          <tr key={record.id}>
                            <td>
                              {formatDate(
                                record.recordDate ||
                                  record.createdAt ||
                                  record.date
                              )}
                            </td>
                            <td>
                              {record.diagnosis ||
                                record.title ||
                                "—"}
                            </td>
                            <td>
                              <div className="pd-notes">
                                {record.description ||
                                  record.notes ||
                                  record.treatment ||
                                  "—"}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {nextAppointment && (
                  <div
                    style={{
                      marginTop: 18,
                      padding: 15,
                      borderRadius: 11,
                      background: "#f0f5ff",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div className="pd-info-icon">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b7c96",
                          marginBottom: 5,
                        }}
                      >
                        Növbəti qəbul
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#2e5fc2",
                        }}
                      >
                        {formatDate(nextAppointment.appointmentDate)} ·{" "}
                        {formatTime(nextAppointment.appointmentDate)}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
