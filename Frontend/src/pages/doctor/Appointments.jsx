
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  CalendarDays,
  Search,
  RefreshCw,
  Clock,
  UserRound,
  FileText,
  CheckCircle2,
  Hourglass,
  AlertCircle,
  Save,
} from "lucide-react";

const styles = `
.doctor-appointments {
  width:100%; min-width:0; padding:8px 4px 28px;
  color:#17243b; font-family:Inter,"Segoe UI",sans-serif;
}
.doctor-appointments * { box-sizing:border-box; }
.doctor-appointments .heading {
  display:flex; justify-content:space-between; align-items:center;
  flex-wrap:wrap; gap:16px; margin-bottom:25px;
}
.doctor-appointments .eyebrow {
  color:#5375e7; font-size:11px; font-weight:800;
  letter-spacing:1.7px; margin-bottom:8px;
}
.doctor-appointments h1 {
  margin:0; font-size:clamp(25px,3vw,32px);
  font-weight:800; letter-spacing:-1px; color:#15223b;
}
.doctor-appointments .subtitle {
  margin:8px 0 0; color:#8994a8; font-size:13px;
}
.doctor-appointments .refresh {
  display:flex; align-items:center; justify-content:center; gap:9px;
  padding:11px 15px; border:1px solid #e4eaf3;
  background:white; color:#34435e; border-radius:12px;
  font-size:13px; font-weight:700; cursor:pointer;
}
.doctor-appointments .refresh:hover { background:#f4f7ff; }
.doctor-appointments button:disabled,
.doctor-appointments select:disabled { opacity:.55; cursor:not-allowed; }
.doctor-appointments .stats {
  display:grid; grid-template-columns:repeat(4,minmax(0,1fr));
  gap:15px; margin-bottom:22px;
}
.doctor-appointments .stat {
  padding:19px; border:1px solid #e8edf5; border-radius:16px;
  background:white; box-shadow:0 5px 20px #1d315005;
}
.doctor-appointments .stat-top {
  display:flex; justify-content:space-between; align-items:center;
  gap:10px; margin-bottom:16px;
}
.doctor-appointments .stat-label { color:#8490a5; font-size:12px; }
.doctor-appointments .stat-icon {
  display:flex; align-items:center; justify-content:center;
  width:40px; height:40px; border-radius:13px;
}
.doctor-appointments .blue { color:#5375e7; background:#edf1ff; }
.doctor-appointments .green { color:#1c9a67; background:#e7f8ef; }
.doctor-appointments .orange { color:#d9952e; background:#fff3e3; }
.doctor-appointments .red { color:#d45b65; background:#fff0f0; }
.doctor-appointments .stat-value {
  color:#1a2944; font-size:29px; font-weight:800;
}
.doctor-appointments .stat-note {
  margin-top:6px; color:#9aa3b3; font-size:11px;
}
.doctor-appointments .panel {
  overflow:hidden; border:1px solid #e8edf5;
  border-radius:17px; background:white;
  box-shadow:0 5px 20px #1d315005;
}
.doctor-appointments .toolbar {
  display:flex; justify-content:space-between; align-items:center;
  flex-wrap:wrap; gap:16px; padding:21px;
  border-bottom:1px solid #edf0f6;
}
.doctor-appointments .toolbar h2 {
  margin:0; color:#1b2943; font-size:16px; font-weight:800;
}
.doctor-appointments .toolbar p {
  margin:7px 0 0; color:#8994a8; font-size:12px;
}
.doctor-appointments .tools {
  display:flex; align-items:center; gap:10px; flex-wrap:wrap;
}
.doctor-appointments .search {
  display:flex; align-items:center; gap:8px; padding:10px 12px;
  border:1px solid #e5eaf3; border-radius:10px;
  background:#fbfcff; color:#8793a7;
}
.doctor-appointments .search input {
  width:175px; min-width:0; border:0; outline:0;
  background:transparent; color:#263550; font-size:12px;
}
.doctor-appointments .select {
  padding:10px 12px; max-width:180px;
  border:1px solid #e5eaf3; border-radius:10px;
  background:white; color:#43516a; font-size:12px; outline:0;
}
.doctor-appointments .table-wrap { width:100%; overflow-x:auto; }
.doctor-appointments table {
  width:100%; border-collapse:collapse; text-align:left; font-size:12px;
}
.doctor-appointments th {
  padding:15px 16px; color:#7f8ba0; background:#f8faff;
  border-bottom:1px solid #e9edf5; font-size:10px;
  font-weight:800; text-transform:uppercase; letter-spacing:.5px;
  white-space:nowrap;
}
.doctor-appointments td {
  padding:16px; color:#46546c;
  border-bottom:1px solid #f0f2f7; white-space:nowrap;
}
.doctor-appointments tbody tr:hover { background:#f9faff; }
.doctor-appointments tbody tr:last-child td { border-bottom:0; }
.doctor-appointments .patient {
  display:flex; align-items:center; gap:10px;
}
.doctor-appointments .avatar {
  width:37px; height:37px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  background:#edf1ff; color:#5375e7; border-radius:12px;
}
.doctor-appointments .patient strong {
  display:block; color:#263550; font-size:12px;
}
.doctor-appointments .patient small {
  display:block; margin-top:4px; color:#909bad; font-size:10px;
}
.doctor-appointments .date-cell {
  display:flex; align-items:center; gap:8px;
}
.doctor-appointments .date-cell svg { color:#8494b4; flex-shrink:0; }
.doctor-appointments .status {
  display:inline-flex; align-items:center; gap:5px;
  padding:6px 9px; border-radius:20px;
  font-size:10px; font-weight:800;
  background:#fff4df; color:#a97113;
}
.doctor-appointments .status.confirmed,
.doctor-appointments .status.completed {
  background:#e6f8ef; color:#178354;
}
.doctor-appointments .status.cancelled {
  background:#fff0f0; color:#cc4c58;
}
.doctor-appointments .notes {
  display:inline-flex; align-items:center; gap:6px;
  color:#697892; max-width:200px; overflow:hidden;
  text-overflow:ellipsis; white-space:nowrap;
}
.doctor-appointments .status-editor {
  display:flex; align-items:center; gap:7px;
}
.doctor-appointments .status-select {
  width:145px; max-width:100%;
  padding:9px 8px; border:1px solid #e0e7f2;
  border-radius:9px; background:#fff; color:#34435e;
  font-size:11px; outline:none;
}
.doctor-appointments .save-status {
  display:flex; align-items:center; justify-content:center;
  gap:6px; padding:9px 10px; border:0; border-radius:9px;
  background:#5575e5; color:white; font-size:11px;
  font-weight:800; cursor:pointer;
}
.doctor-appointments .save-status:hover { background:#4263d5; }
.doctor-appointments .save-status.saved {
  background:#e7f8ef; color:#178354;
}
.doctor-appointments .row-error {
  max-width:220px; white-space:normal; color:#c34d58;
  font-size:10px; line-height:1.5; margin-top:6px;
}
.doctor-appointments .notice {
  display:flex; align-items:flex-start; gap:9px;
  margin:16px 20px 0; padding:12px 14px;
  border-radius:10px; font-size:12px; line-height:1.6;
}
.doctor-appointments .notice.error {
  background:#fff4f4; border:1px solid #f2d7d9; color:#b84650;
}
.doctor-appointments .notice.success {
  background:#edfaf3; border:1px solid #d1efdf; color:#187c51;
}
.doctor-appointments .empty,
.doctor-appointments .loading {
  min-height:220px; display:flex; align-items:center;
  justify-content:center; flex-direction:column; gap:12px;
  color:#8994a8; font-size:13px; text-align:center; padding:25px;
}
.doctor-appointments .empty-icon {
  width:53px; height:53px; border-radius:16px;
  background:#eff2ff; color:#5375e7;
  display:flex; align-items:center; justify-content:center;
}
.doctor-appointments .error {
  margin:18px; padding:15px; border:1px solid #f0d0d2;
  background:#fff7f7; color:#bd4851; border-radius:11px;
  font-size:13px;
}
.doctor-appointments .footer {
  display:flex; justify-content:space-between; gap:12px;
  padding:15px 21px; border-top:1px solid #edf0f6;
  color:#8994a8; font-size:11px;
}
.doctor-appointments .spin {
  animation:appointment-spin .8s linear infinite;
}
@keyframes appointment-spin { to { transform:rotate(360deg); } }
@media(max-width:1050px) {
  .doctor-appointments .stats { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media(max-width:560px) {
  .doctor-appointments .stats { gap:9px; }
  .doctor-appointments .stat { padding:13px; }
  .doctor-appointments .stat-value { font-size:24px; }
  .doctor-appointments .toolbar { padding:15px; }
  .doctor-appointments .search { width:100%; }
  .doctor-appointments .search input { width:100%; }
  .doctor-appointments .select { max-width:none; width:100%; }
  .doctor-appointments .tools { width:100%; }
}
`;

const normalizeStatus = (status) =>
  String(status || "Pending").toLowerCase();

const statusText = (status) => {
  const statuses = {
    pending: "Gözləyir",
    confirmed: "Təsdiqlənib",
    completed: "Tamamlanıb",
    cancelled: "Ləğv edilib",
  };

  return statuses[normalizeStatus(status)] || status || "Gözləyir";
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("az-AZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [savingIds, setSavingIds] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadAppointments() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/Appointment");

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.$values || [];

        if (active) {
          setAppointments(data);
          setSelectedStatuses({});
          setRowErrors({});
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Qəbulları yükləmək mümkün olmadı. Girişinizi və API bağlantısını yoxlayın."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAppointments();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const stats = {
    total: appointments.length,
    pending: appointments.filter(
      (a) => normalizeStatus(a.status) === "pending"
    ).length,
    confirmed: appointments.filter(
      (a) => normalizeStatus(a.status) === "confirmed"
    ).length,
    completed: appointments.filter(
      (a) => normalizeStatus(a.status) === "completed"
    ).length,
  };

  const filteredAppointments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return appointments
      .filter((item) => {
        const patientName = item.patient?.fullName || "";
        const doctorName = item.doctor?.fullName || "";
        const notes = item.notes || "";

        const matchesSearch =
          !term ||
          patientName.toLowerCase().includes(term) ||
          doctorName.toLowerCase().includes(term) ||
          String(item.id).includes(term) ||
          notes.toLowerCase().includes(term);

        const matchesStatus =
          statusFilter === "all" ||
          normalizeStatus(item.status) === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.appointmentDate).getTime();
        const dateB = new Date(b.appointmentDate).getTime();

        return (
          (Number.isFinite(dateB) ? dateB : 0) -
          (Number.isFinite(dateA) ? dateA : 0)
        );
      });
  }, [appointments, search, statusFilter]);

  const handleStatusChange = (id, value) => {
    setSelectedStatuses((previous) => ({
      ...previous,
      [id]: value,
    }));

    setRowErrors((previous) => ({
      ...previous,
      [id]: "",
    }));

    setNotice(null);
  };

  async function saveStatus(item) {
    const newStatus = selectedStatuses[item.id];

    if (
      !newStatus ||
      normalizeStatus(newStatus) === normalizeStatus(item.status)
    ) {
      return;
    }

    setSavingIds((previous) => ({
      ...previous,
      [item.id]: true,
    }));

    setRowErrors((previous) => ({
      ...previous,
      [item.id]: "",
    }));

    setNotice(null);

    try {
      const payload = {
        id: item.id,
        patientId: item.patientId,
        doctorId: item.doctorId,
        appointmentDate: item.appointmentDate,
        notes: item.notes || "",
        status: newStatus,
      };

      const response = await api.put(
        `/Appointment/${item.id}`,
        payload
      );

      const updated = response.data;

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment.id === item.id
            ? {
                ...appointment,
                ...(updated && typeof updated === "object"
                  ? updated
                  : {}),
                status: updated?.status || newStatus,
              }
            : appointment
        )
      );

      setSelectedStatuses((previous) => {
        const next = { ...previous };
        delete next[item.id];
        return next;
      });

      setNotice({
        type: "success",
        text: `#${item.id} nömrəli qəbulun statusu "${statusText(
          newStatus
        )}" olaraq yeniləndi.`,
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? "Sessiya bitib. Yenidən daxil ol."
          : err.response?.status === 403
          ? "Bu qəbulu dəyişmək üçün icazən yoxdur."
          : err.response?.status === 400
          ? "Backend məlumatları qəbul etmədi. Tarix və iş qrafiki yoxlamasını nəzərdən keçir."
          : "Status yenilənmədi. Backend API-ni yoxla.");

      setRowErrors((previous) => ({
        ...previous,
        [item.id]: message,
      }));
    } finally {
      setSavingIds((previous) => ({
        ...previous,
        [item.id]: false,
      }));
    }
  }

  return (
    <div className="doctor-appointments">
      <style>{styles}</style>

      <header className="heading">
        <div>
          <div className="eyebrow">DOCTOR WORKSPACE</div>
          <h1>Qəbul cədvəli</h1>
          <p className="subtitle">
            Pasiyent qəbullarını, görüş vaxtlarını və statusları idarə edin.
          </p>
        </div>

        <button
          className="refresh"
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={loading}
          type="button"
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Yenilə
        </button>
      </header>

      <section className="stats">
        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Bütün qəbullar</span>
            <div className="stat-icon blue">
              <CalendarDays size={20} />
            </div>
          </div>
          <div className="stat-value">{loading ? "—" : stats.total}</div>
          <div className="stat-note">Ümumi qəbul sayı</div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Gözləyən</span>
            <div className="stat-icon orange">
              <Hourglass size={20} />
            </div>
          </div>
          <div className="stat-value">{loading ? "—" : stats.pending}</div>
          <div className="stat-note">Qərar gözləyən qəbullar</div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Təsdiqlənmiş</span>
            <div className="stat-icon green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-value">{loading ? "—" : stats.confirmed}</div>
          <div className="stat-note">Təsdiqlənmiş görüşlər</div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Tamamlanmış</span>
            <div className="stat-icon blue">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-value">{loading ? "—" : stats.completed}</div>
          <div className="stat-note">Bitmiş qəbul sayı</div>
        </div>
      </section>

      <section className="panel">
        <div className="toolbar">
          <div>
            <h2>Pasiyent qəbulları</h2>
            <p>Qəbul siyahısını axtarın və statusları dəyişin.</p>
          </div>

          <div className="tools">
            <label className="search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pasiyent, qeyd və ya ID..."
              />
            </label>

            <select
              className="select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Qəbul statusu"
            >
              <option value="all">Bütün statuslar</option>
              <option value="pending">Gözləyir</option>
              <option value="confirmed">Təsdiqlənib</option>
              <option value="completed">Tamamlanıb</option>
              <option value="cancelled">Ləğv edilib</option>
            </select>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {notice && (
          <div className={`notice ${notice.type}`}>
            {notice.type === "success" ? (
              <CheckCircle2 size={17} />
            ) : (
              <AlertCircle size={17} />
            )}
            <span>{notice.text}</span>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <RefreshCw size={25} className="spin" />
            Qəbullar yüklənir...
          </div>
        ) : error ? null : filteredAppointments.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              <CalendarDays size={26} />
            </div>
            <strong>
              {search ? "Nəticə tapılmadı" : "Hələ qəbul yoxdur"}
            </strong>
            <span>
              {search
                ? "Axtarış sözünü və ya status filtrini dəyişin."
                : "Yeni rezervasiyalar yarandıqda burada görünəcək."}
            </span>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pasiyent</th>
                  <th>Tarix</th>
                  <th>Saat</th>
                  <th>Mövcud status</th>
                  <th>Statusu dəyiş</th>
                  <th>Qeyd</th>
                  <th>Qəbul ID</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map((item) => {
                  const currentStatus = normalizeStatus(item.status);
                  const selectedStatus =
                    selectedStatuses[item.id] ?? item.status ?? "Pending";
                  const changed =
                    normalizeStatus(selectedStatus) !== currentStatus;
                  const saving = Boolean(savingIds[item.id]);

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="patient">
                          <div className="avatar">
                            <UserRound size={18} />
                          </div>
                          <div>
                            <strong>
                              {item.patient?.fullName ||
                                `Pasiyent #${item.patientId}`}
                            </strong>
                            <small>Pasiyent ID: {item.patientId}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="date-cell">
                          <CalendarDays size={15} />
                          {formatDate(item.appointmentDate)}
                        </div>
                      </td>

                      <td>
                        <div className="date-cell">
                          <Clock size={15} />
                          {formatTime(item.appointmentDate)}
                        </div>
                      </td>

                      <td>
                        <span className={`status ${currentStatus}`}>
                          {statusText(item.status)}
                        </span>
                      </td>

                      <td>
                        <div className="status-editor">
                          <select
                            className="status-select"
                            value={selectedStatus}
                            onChange={(event) =>
                              handleStatusChange(item.id, event.target.value)
                            }
                            disabled={saving}
                            aria-label={`${item.id} nömrəli qəbulun yeni statusu`}
                          >
                            <option value="Pending">Gözləyir</option>
                            <option value="Confirmed">Təsdiqlənib</option>
                            <option value="Completed">Tamamlanıb</option>
                            <option value="Cancelled">Ləğv edilib</option>
                          </select>

                          <button
                            type="button"
                            className={`save-status ${!changed ? "saved" : ""}`}
                            onClick={() => saveStatus(item)}
                            disabled={!changed || saving}
                            title="Statusu yadda saxla"
                          >
                            {saving ? (
                              <RefreshCw size={14} className="spin" />
                            ) : (
                              <Save size={14} />
                            )}
                            Saxla
                          </button>
                        </div>

                        {rowErrors[item.id] && (
                          <div className="row-error">
                            <AlertCircle
                              size={12}
                              style={{
                                display: "inline",
                                marginRight: 4,
                              }}
                            />
                            {rowErrors[item.id]}
                          </div>
                        )}
                      </td>

                      <td>
                        <span
                          className="notes"
                          title={item.notes || "Qeyd yoxdur"}
                        >
                          <FileText size={14} />
                          {item.notes || "Qeyd yoxdur"}
                        </span>
                      </td>

                      <td>#{item.id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="footer">
          <span>Göstərilir: {filteredAppointments.length} qəbul</span>
          <span>Ümumi: {appointments.length}</span>
        </div>
      </section>
    </div>
  );
}
