import { useEffect, useMemo, useState } from "react";
import appointmentService from "../../services/appointmentService";
import "./Appointments.css";

const statusOptions = [
  { value: "", label: "Bütün statuslar" },
  { value: "Pending", label: "Gözləyir" },
  { value: "Confirmed", label: "Təsdiqlənib" },
  { value: "Completed", label: "Tamamlanıb" },
  { value: "Cancelled", label: "Ləğv edilib" },
];

const getStatus = (status) => {
  const value = String(status ?? "").toLowerCase();

  if (value.includes("confirm")) return "Confirmed";
  if (value.includes("complete")) return "Completed";
  if (value.includes("cancel")) return "Cancelled";
  if (value.includes("pending") || value.includes("wait")) return "Pending";

  return status || "Pending";
};

const statusLabel = (status) => {
  const normalized = getStatus(status);

  return (
    statusOptions.find((item) => item.value === normalized)?.label ||
    normalized
  );
};

const getAppointmentDate = (appointment) =>
  appointment.appointmentDate ??
  appointment.date ??
  appointment.scheduledAt ??
  appointment.startTime ??
  null;

const getPatientName = (appointment) =>
  appointment.patientName ??
  appointment.patient?.fullName ??
  appointment.patient?.name ??
  appointment.patientFullName ??
  "Pasiyent #" + (appointment.patientId ?? "?");

const getDoctorName = (appointment) =>
  appointment.doctorName ??
  appointment.doctor?.fullName ??
  appointment.doctor?.name ??
  appointment.doctorFullName ??
  "Həkim #" + (appointment.doctorId ?? "?");

const formatDate = (value) => {
  if (!value) return "Tarix göstərilməyib";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "--:--";

  const date = new Date(value);

  if (String(value).includes("T") && !Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("az-AZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const match = String(value).match(/(\d{2}:\d{2})/);
  return match ? match[1] : "--:--";
};

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const params = statusFilter ? { status: statusFilter } : {};
      const data = await appointmentService.getAll(params);

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.$values)
        ? data.$values
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setAppointments(list);
    } catch (err) {
      console.error("Randevuları yükləmək mümkün olmadı:", err);

      if (err.response?.status === 401) {
        setError("Sessiya bitib. Yenidən daxil ol və təkrar yoxla.");
      } else if (err.response?.status === 403) {
        setError("Bu bölməyə baxmaq üçün icazən yoxdur.");
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.title ||
            "Randevuları yükləmək mümkün olmadı. Backend bağlantısını yoxla."
        );
      }

      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const filteredAppointments = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return appointments;

    return appointments.filter((item) => {
      const searchable = [
        item.id,
        getPatientName(item),
        getDoctorName(item),
        item.reason,
        item.description,
        statusLabel(item.status),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [appointments, search]);

  const counts = useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter(
        (item) => getStatus(item.status) === "Pending"
      ).length,
      confirmed: appointments.filter(
        (item) => getStatus(item.status) === "Confirmed"
      ).length,
      completed: appointments.filter(
        (item) => getStatus(item.status) === "Completed"
      ).length,
    }),
    [appointments]
  );

  const handleStatusChange = async (appointment, newStatus) => {
    if (getStatus(appointment.status) === newStatus) return;

    const confirmed = window.confirm(
      `Randevu #${appointment.id} statusunu "${statusLabel(newStatus)}" etmək istəyirsən?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(appointment.id);
      setError("");

      // Mövcud məlumatları saxlayaraq yalnız statusu dəyişirik.
      await appointmentService.update(appointment.id, {
        ...appointment,
        status: newStatus,
      });

      await loadAppointments();
    } catch (err) {
      console.error("Randevu statusunu dəyişmək mümkün olmadı:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Status dəyişdirilmədi. Backend-in Update DTO-sunu yoxlamaq lazımdır."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (appointment) => {
    const confirmed = window.confirm(
      `Randevu #${appointment.id} silinsin? Bu əməliyyat geri qaytarılmaya bilər.`
    );

    if (!confirmed) return;

    try {
      setError("");
      await appointmentService.delete(appointment.id);
      await loadAppointments();
    } catch (err) {
      console.error("Randevunu silmək mümkün olmadı:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Randevu silinmədi. Admin icazəsini yoxla."
      );
    }
  };

  return (
    <div className="appointments-page">
      <header className="appointments-header">
        <div>
          <span className="appointments-eyebrow">HOSPITAL İDARƏETMƏSİ</span>
          <h1>Randevular</h1>
          <p>Pasiyentlərin həkim qəbulunu idarə et.</p>
        </div>

        <button
          type="button"
          className="appointments-refresh-btn"
          onClick={loadAppointments}
          disabled={loading}
        >
          ↻ Yenilə
        </button>
      </header>

      <section className="appointments-stats">
        <div className="appointment-stat-card">
          <div className="appointment-stat-icon blue">▤</div>
          <div>
            <p>Bütün randevular</p>
            <h2>{counts.total}</h2>
          </div>
        </div>

        <div className="appointment-stat-card">
          <div className="appointment-stat-icon orange">◷</div>
          <div>
            <p>Gözləyən</p>
            <h2>{counts.pending}</h2>
          </div>
        </div>

        <div className="appointment-stat-card">
          <div className="appointment-stat-icon green">✓</div>
          <div>
            <p>Təsdiqlənən</p>
            <h2>{counts.confirmed}</h2>
          </div>
        </div>

        <div className="appointment-stat-card">
          <div className="appointment-stat-icon purple">✚</div>
          <div>
            <p>Tamamlanan</p>
            <h2>{counts.completed}</h2>
          </div>
        </div>
      </section>

      {error && (
        <div className="appointments-alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      <section className="appointments-panel">
        <div className="appointments-panel-header">
          <div>
            <h2>Randevu siyahısı</h2>
            <p>Randevulara bax və statuslarını idarə et.</p>
          </div>

          <div className="appointments-filters">
            <div className="appointments-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Pasiyent, həkim və ya ID axtar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Axtarışı təmizlə"
                >
                  ×
                </button>
              )}
            </div>

            <select
              aria-label="Status üzrə filtr"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="appointments-state">
            <div className="appointments-spinner" />
            <p>Randevular yüklənir...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="appointments-state">
            <div className="appointments-empty-icon">▤</div>
            <h3>
              {search || statusFilter
                ? "Randevu tapılmadı"
                : "Hələ randevu yoxdur"}
            </h3>
            <p>
              {search || statusFilter
                ? "Axtarış sözünü və ya status filtrini dəyiş."
                : "Randevular backend-dən gələndə burada görünəcək."}
            </p>
          </div>
        ) : (
          <div className="appointments-table-wrapper">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>PASİYENT</th>
                  <th>HƏKİM</th>
                  <th>QƏBUL TARİXİ</th>
                  <th>STATUS</th>
                  <th>ƏMƏLİYYATLAR</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map((appointment) => {
                  const status = getStatus(appointment.status);
                  const date = getAppointmentDate(appointment);

                  return (
                    <tr key={appointment.id}>
                      <td>
                        <span className="appointment-id">
                          #{appointment.id}
                        </span>
                      </td>

                      <td>
                        <div className="appointment-person">
                          <div className="appointment-avatar patient-avatar">
                            {getPatientName(appointment)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <span>{getPatientName(appointment)}</span>
                        </div>
                      </td>

                      <td>
                        <div className="appointment-person">
                          <div className="appointment-avatar doctor-avatar">
                            {getDoctorName(appointment)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <span>{getDoctorName(appointment)}</span>
                        </div>
                      </td>

                      <td>
                        <div className="appointment-date">
                          <span>{formatDate(date)}</span>
                          <small>{formatTime(date)}</small>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`appointment-status status-${String(
                            status
                          ).toLowerCase()}`}
                        >
                          {statusLabel(status)}
                        </span>
                      </td>

                      <td>
                        <div className="appointment-actions">
                          <select
                            aria-label={`Randevu ${appointment.id} statusu`}
                            value={status}
                            disabled={updatingId === appointment.id}
                            onChange={(e) =>
                              handleStatusChange(appointment, e.target.value)
                            }
                          >
                            {statusOptions
                              .filter((option) => option.value !== "")
                              .map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </option>
                              ))}
                          </select>

                          <button
                            type="button"
                            className="appointment-delete-btn"
                            disabled={updatingId === appointment.id}
                            onClick={() => handleDelete(appointment)}
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredAppointments.length > 0 && (
          <footer className="appointments-footer">
            Göstərilir: <strong>{filteredAppointments.length}</strong> randevu
          </footer>
        )}
      </section>
    </div>
  );
}

export default Appointments;