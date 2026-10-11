
import { useEffect, useMemo, useState } from "react";
import doctorScheduleService from "../../services/doctorScheduleService";
import api from "../../services/api";
import "./DoctorSchedules.css";

const emptyForm = {
  doctorId: "",
  dayOfWeek: 1,
  startTime: "09:00",
  endTime: "17:00",
  isAvailable: true,
};

const days = [
  { value: 1, label: "Bazar ertəsi" },
  { value: 2, label: "Çərşənbə axşamı" },
  { value: 3, label: "Çərşənbə" },
  { value: 4, label: "Cümə axşamı" },
  { value: 5, label: "Cümə" },
  { value: 6, label: "Şənbə" },
  { value: 0, label: "Bazar" },
];

const dayNameToNumber = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function getDoctorName(schedule) {
  return (
    schedule.doctor?.fullName ||
    schedule.doctorName ||
    schedule.doctor?.name ||
    `Həkim #${schedule.doctorId ?? schedule.doctor?.id ?? ""}`
  );
}

function getDayNumber(value) {
  if (typeof value === "number") {
    return value;
  }

  if (value === null || value === undefined || value === "") {
    return 1;
  }

  const normalized = String(value).trim();

  if (Object.prototype.hasOwnProperty.call(dayNameToNumber, normalized)) {
    return dayNameToNumber[normalized];
  }

  const numericValue = Number(normalized);

  if (
    Number.isInteger(numericValue) &&
    numericValue >= 0 &&
    numericValue <= 6
  ) {
    return numericValue;
  }

  const found = days.find(
    (day) => day.label.toLowerCase() === normalized.toLowerCase()
  );

  return found ? found.value : 1;
}

function getDayLabel(value) {
  const day = days.find((item) => item.value === getDayNumber(value));
  return day?.label || "—";
}

function getTime(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value.substring(0, 5);
  }

  return String(value);
}

function getErrorMessage(err) {
  const data = err.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.title) {
    const validationErrors = data.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";

    return validationErrors
      ? `${data.title}: ${validationErrors}`
      : data.title;
  }

  if (data?.errors) {
    return Object.values(data.errors).flat().join(" ");
  }

  if (err.response?.status === 400) {
    return "Göndərilən məlumatlar yanlışdır. Gün və saatları yoxla.";
  }

  return "Əməliyyat alınmadı. Backend bağlantısını yoxla.";
}

export default function DoctorSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [scheduleResult, doctorResult] = await Promise.all([
        doctorScheduleService.getAll(),
        api.get("/Doctors"),
      ]);

      const scheduleData = Array.isArray(scheduleResult)
        ? scheduleResult
        : scheduleResult?.$values ?? scheduleResult?.items ?? [];

      const doctorData = Array.isArray(doctorResult.data)
        ? doctorResult.data
        : doctorResult.data?.$values ?? doctorResult.data?.items ?? [];

      setSchedules(scheduleData);
      setDoctors(doctorData);
    } catch (err) {
      console.error("Qrafikləri yükləmə xətası:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredSchedules = useMemo(() => {
    const term = search.trim().toLowerCase();

    return schedules.filter((schedule) => {
      const doctorName = getDoctorName(schedule).toLowerCase();
      const dayValue = getDayNumber(
        schedule.dayOfWeek ?? schedule.day ?? schedule.weekDay
      );
      const dayLabel = getDayLabel(dayValue).toLowerCase();

      const matchesSearch =
        !term ||
        doctorName.includes(term) ||
        String(schedule.doctorId ?? "").includes(term) ||
        dayLabel.includes(term);

      const matchesDay =
        dayFilter === "" || dayValue === Number(dayFilter);

      return matchesSearch && matchesDay;
    });
  }, [schedules, search, dayFilter]);

  function openCreateModal() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      doctorId: doctors[0]?.id ? String(doctors[0].id) : "",
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditModal(schedule) {
    setEditingId(schedule.id);

    setForm({
      doctorId: String(schedule.doctorId ?? schedule.doctor?.id ?? ""),
      dayOfWeek: getDayNumber(
        schedule.dayOfWeek ?? schedule.day ?? schedule.weekDay
      ),
      startTime: getTime(
        schedule.startTime ?? schedule.start ?? schedule.fromTime
      ),
      endTime: getTime(
        schedule.endTime ?? schedule.end ?? schedule.toTime
      ),
      isAvailable: schedule.isAvailable ?? true,
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.doctorId && editingId === null) {
      setError("Həkim seçilməlidir.");
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError("Başlama və bitmə vaxtlarını daxil et.");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError("Bitmə vaxtı başlama vaxtından sonra olmalıdır.");
      return;
    }

    const payload = {
      dayOfWeek: Number(form.dayOfWeek),
      startTime: `${form.startTime}:00`,
      endTime: `${form.endTime}:00`,
      isAvailable: Boolean(form.isAvailable),
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        // Update DTO-da doctorId və id yoxdur.
        await doctorScheduleService.update(editingId, payload);
        setSuccess("Həkim qrafiki yeniləndi.");
      } else {
        // Create DTO üçün doctorId də göndərilir.
        await doctorScheduleService.create({
          doctorId: Number(form.doctorId),
          ...payload,
        });
        setSuccess("Yeni həkim qrafiki yaradıldı.");
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(
        "DoctorSchedule sorğusunun xətası:",
        err.response?.data ?? err
      );
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(schedule) {
    const confirmed = window.confirm(
      `${getDoctorName(schedule)} üçün bu qrafiki silmək istəyirsən?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await doctorScheduleService.delete(schedule.id);

      setSchedules((previous) =>
        previous.filter((item) => item.id !== schedule.id)
      );

      setSuccess("Qrafik uğurla silindi.");
    } catch (err) {
      console.error("Qrafiki silmə xətası:", err);
      setError(getErrorMessage(err));
    }
  }

  const activeDoctorCount = new Set(
    schedules.map((schedule) => schedule.doctorId ?? schedule.doctor?.id)
  ).size;

  return (
    <div className="doctor-schedules-page">
      <div className="ds-header">
        <div>
          <span className="ds-eyebrow">İDARƏETMƏ PANELİ</span>
          <h1>Həkim qrafikləri</h1>
          <p>Həkimlərin iş günlərini və qəbul saatlarını idarə et.</p>
        </div>

        <button
          className="ds-primary-btn"
          type="button"
          onClick={openCreateModal}
        >
          <span>＋</span> Yeni qrafik
        </button>
      </div>

      {error && !modalOpen && (
        <div className="ds-alert ds-alert-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="ds-alert ds-alert-success">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")}>
            ×
          </button>
        </div>
      )}

      <div className="ds-stats">
        <div className="ds-stat-card">
          <div className="ds-stat-icon ds-blue">▦</div>
          <div>
            <span>Ümumi qrafiklər</span>
            <strong>{schedules.length}</strong>
          </div>
        </div>

        <div className="ds-stat-card">
          <div className="ds-stat-icon ds-green">♙</div>
          <div>
            <span>Qrafiki olan həkimlər</span>
            <strong>{activeDoctorCount}</strong>
          </div>
        </div>

        <div className="ds-stat-card">
          <div className="ds-stat-icon ds-purple">◷</div>
          <div>
            <span>Göstərilən nəticələr</span>
            <strong>{filteredSchedules.length}</strong>
          </div>
        </div>
      </div>

      <section className="ds-panel">
        <div className="ds-panel-heading">
          <div>
            <h2>İş qrafikləri</h2>
            <p>Qrafiklərə bax, axtar, redaktə et və sil.</p>
          </div>

          <button
            className="ds-refresh-btn"
            type="button"
            onClick={loadData}
            disabled={loading}
          >
            ↻ Yenilə
          </button>
        </div>

        <div className="ds-filters">
          <div className="ds-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Həkim və ya gün üzrə axtar..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            aria-label="Həftənin günü"
            value={dayFilter}
            onChange={(event) => setDayFilter(event.target.value)}
          >
            <option value="">Bütün günlər</option>
            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="ds-empty">
            <div className="ds-loader" />
            <p>Qrafiklər yüklənir...</p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="ds-empty">
            <div className="ds-empty-icon">▦</div>
            <h3>Qrafik tapılmadı</h3>
            <p>Başqa axtarış sözü yoxla və ya yeni qrafik yarat.</p>
          </div>
        ) : (
          <div className="ds-table-wrapper">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>HƏKİM</th>
                  <th>İŞ GÜNÜ</th>
                  <th>BAŞLAMA</th>
                  <th>BİTMƏ</th>
                  <th>STATUS</th>
                  <th className="ds-actions-heading">ƏMƏLİYYAT</th>
                </tr>
              </thead>

              <tbody>
                {filteredSchedules.map((schedule) => {
                  const name = getDoctorName(schedule);
                  const start = getTime(
                    schedule.startTime ?? schedule.start ?? schedule.fromTime
                  );
                  const end = getTime(
                    schedule.endTime ?? schedule.end ?? schedule.toTime
                  );

                  return (
                    <tr key={schedule.id}>
                      <td>
                        <div className="ds-doctor">
                          <div className="ds-avatar">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{name}</strong>
                            <small>
                              Həkim ID:{" "}
                              {schedule.doctorId ?? schedule.doctor?.id ?? "—"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="ds-day">
                          {getDayLabel(
                            schedule.dayOfWeek ??
                              schedule.day ??
                              schedule.weekDay
                          )}
                        </span>
                      </td>

                      <td>
                        <span className="ds-time">{start || "—"}</span>
                      </td>

                      <td>
                        <span className="ds-time">{end || "—"}</span>
                      </td>

                      <td>
                        <span className="ds-day">
                          {schedule.isAvailable === false
                            ? "Deaktiv"
                            : "Aktiv"}
                        </span>
                      </td>

                      <td>
                        <div className="ds-row-actions">
                          <button
                            type="button"
                            className="ds-edit-btn"
                            onClick={() => openEditModal(schedule)}
                          >
                            Redaktə
                          </button>

                          <button
                            type="button"
                            className="ds-delete-btn"
                            onClick={() => handleDelete(schedule)}
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

        <div className="ds-panel-footer">
          Cəmi {filteredSchedules.length} qrafik göstərilir
        </div>
      </section>

      {modalOpen && (
        <div
          className="ds-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="ds-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ds-modal-title"
          >
            <div className="ds-modal-header">
              <div>
                <span className="ds-eyebrow">
                  {editingId !== null ? "QRAFİKİ DƏYİŞ" : "YENİ QEYD"}
                </span>
                <h2 id="ds-modal-title">
                  {editingId !== null
                    ? "Qrafiki redaktə et"
                    : "Yeni həkim qrafiki"}
                </h2>
              </div>

              <button
                className="ds-close-btn"
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                ×
              </button>
            </div>

            {error && (
              <div className="ds-alert ds-alert-error">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              {editingId === null && (
                <label>
                  Həkim
                  <select
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Həkim seç</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.fullName ||
                          doctor.name ||
                          `Həkim #${doctor.id}`}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label>
                Həftənin günü
                <select
                  name="dayOfWeek"
                  value={form.dayOfWeek}
                  onChange={handleChange}
                  required
                >
                  {days.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="ds-time-fields">
                <label>
                  Başlama vaxtı
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Bitmə vaxtı
                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <label>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                />
                Qrafik aktivdir
              </label>

              <div className="ds-modal-actions">
                <button
                  className="ds-cancel-btn"
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Ləğv et
                </button>

                <button
                  className="ds-primary-btn"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Yadda saxlanılır..."
                    : editingId !== null
                      ? "Dəyişiklikləri saxla"
                      : "Qrafik yarat"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
