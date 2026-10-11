
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./Doctor.css";

const emptyForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  specialtyId: "",
  imageUrl: "",
  isActive: true,
};

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getErrorMessage(err) {
  const data = err.response?.data;

  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.title) return data.title;

  if (data?.errors) {
    return Object.values(data.errors).flat().join(" ");
  }

  if (err.response?.status === 400) {
    return "Sorğu qəbul edilmədi. Məlumatları və əlaqələri yoxlayın.";
  }

  if (err.response?.status === 401) {
    return "Sessiya bitib. Yenidən daxil olun.";
  }

  if (err.response?.status === 403) {
    return "Bu əməliyyat üçün Admin icazəsi lazımdır.";
  }

  if (err.response?.status === 404) {
    return "Həkim və ya API endpoint tapılmadı.";
  }

  if (err.response?.status === 500) {
    return "Server xətası. Həkimin başqa cədvəllərlə əlaqəsi ola bilər.";
  }

  return "Əməliyyat alınmadı. Backend bağlantısını yoxlayın.";
}

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [specialtiesLoading, setSpecialtiesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [specialtyError, setSpecialtyError] = useState("");
  const [success, setSuccess] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function loadDoctors() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/Doctors");
      setDoctors(normalizeList(response.data));
    } catch (err) {
      console.error(
        "Həkimləri yükləmə xətası:",
        err.response?.data ?? err
      );
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadSpecialties() {
    setSpecialtiesLoading(true);
    setSpecialtyError("");

    try {
      const response = await api.get("/Specialties");
      setSpecialties(normalizeList(response.data));
    } catch (err) {
      console.error(
        "İxtisasları yükləmə xətası:",
        err.response?.data ?? err
      );

      setSpecialtyError(
        "İxtisaslar yüklənmədi. /api/Specialties endpoint-ini yoxlayın."
      );
    } finally {
      setSpecialtiesLoading(false);
    }
  }

  useEffect(() => {
    loadDoctors();
    loadSpecialties();
  }, []);

  const filteredDoctors = useMemo(() => {
    const term = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch =
        !term ||
        [
          doctor.fullName ?? doctor.FullName,
          doctor.email ?? doctor.Email,
          doctor.phoneNumber ?? doctor.PhoneNumber,
          doctor.specialty?.name ??
            doctor.specialty?.Name,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(term)
        );

      const doctorSpecialtyId =
        doctor.specialtyId ??
        doctor.SpecialtyId ??
        doctor.specialty?.id ??
        doctor.specialty?.Id;

      const matchesSpecialty =
        !specialty ||
        String(doctorSpecialtyId ?? "") === specialty;

      const isActive =
        doctor.isActive ?? doctor.IsActive ?? false;

      const matchesStatus =
        status === "all" ||
        (status === "active" && isActive) ||
        (status === "inactive" && !isActive);

      return matchesSearch && matchesSpecialty && matchesStatus;
    });
  }, [doctors, search, specialty, status]);

  const activeCount = doctors.filter(
    (doctor) => doctor.isActive ?? doctor.IsActive
  ).length;

  function openEditModal(doctor) {
    setSelectedDoctor(doctor);

    setForm({
      fullName: doctor.fullName ?? doctor.FullName ?? "",
      email: doctor.email ?? doctor.Email ?? "",
      phoneNumber:
        doctor.phoneNumber ?? doctor.PhoneNumber ?? "",
      specialtyId:
        doctor.specialtyId ??
        doctor.SpecialtyId ??
        doctor.specialty?.id ??
        doctor.specialty?.Id ??
        "",
      imageUrl: doctor.imageUrl ?? doctor.ImageUrl ?? "",
      isActive: Boolean(
        doctor.isActive ?? doctor.IsActive
      ),
    });

    setError("");
    setSuccess("");
    setEditOpen(true);
  }

  function closeEditModal() {
    if (saving) return;

    setEditOpen(false);
    setSelectedDoctor(null);
    setForm(emptyForm);
    setError("");
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleUpdateDoctor(event) {
    event.preventDefault();

    if (!selectedDoctor) return;

    const doctorId =
      selectedDoctor.id ?? selectedDoctor.Id;

    if (!form.fullName.trim()) {
      setError("Həkimin adı boş ola bilməz.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email ünvanı boş ola bilməz.");
      return;
    }

    if (!form.specialtyId) {
      setError("Zəhmət olmasa həkimin ixtisasını seçin.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      id: doctorId,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      specialtyId: Number(form.specialtyId),
      imageUrl: form.imageUrl.trim(),
      isActive: form.isActive,
    };

    try {
      await api.put(`/Doctors/${doctorId}`, payload);

      setEditOpen(false);
      setSelectedDoctor(null);
      setForm(emptyForm);
      setSuccess("Həkim məlumatları uğurla yeniləndi.");

      await loadDoctors();
    } catch (err) {
      console.error(
        "Həkim yeniləmə xətası:",
        err.response?.data ?? err
      );
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteDoctor(doctor) {
    const doctorId = doctor.id ?? doctor.Id;
    const doctorName =
      doctor.fullName ?? doctor.FullName ?? "Bu həkim";

    if (!doctorId) {
      setError("Həkimin ID-si tapılmadı.");
      return;
    }

    const confirmed = window.confirm(
      `"${doctorName}" həkimini tamamilə silmək istəyirsiniz? Bu əməliyyat geri qaytarılmaya bilər.`
    );

    if (!confirmed) return;

    setDeletingId(doctorId);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/Doctors/${doctorId}`);

      setDoctors((previous) =>
        previous.filter(
          (item) => (item.id ?? item.Id) !== doctorId
        )
      );

      setSuccess(`"${doctorName}" uğurla silindi.`);
    } catch (err) {
      console.error(
        "Həkim silmə xətası:",
        err.response?.data ?? err
      );

      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="doctors-page">
      <div className="doctors-header">
        <div>
          <h1>Həkimlərin idarə edilməsi</h1>
          <p>
            Həkim məlumatlarına baxın, redaktə edin və
            siyahını idarə edin.
          </p>
        </div>

        <button
          type="button"
          className="doctor-btn doctor-btn-primary"
          onClick={() => {
            loadDoctors();
            loadSpecialties();
          }}
          disabled={loading || specialtiesLoading || saving}
        >
          Yenilə
        </button>
      </div>

      {error && (
        <div className="doctor-notice doctor-notice-error">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="doctor-notice doctor-notice-success">
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            ×
          </button>
        </div>
      )}

      {specialtyError && (
        <div className="doctor-notice doctor-notice-error">
          <span>{specialtyError}</span>
          <button
            type="button"
            onClick={() => {
              setSpecialtyError("");
              loadSpecialties();
            }}
          >
            Yenidən yoxla
          </button>
        </div>
      )}

      <div className="doctors-stats">
        <div className="doctor-stat-card">
          <span>Ümumi həkimlər</span>
          <strong>{doctors.length}</strong>
        </div>

        <div className="doctor-stat-card">
          <span>Aktiv həkimlər</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="doctor-stat-card">
          <span>Passiv həkimlər</span>
          <strong>{doctors.length - activeCount}</strong>
        </div>
      </div>

      <div className="doctors-panel">
        <div className="doctors-filters">
          <input
            type="search"
            placeholder="Ad, email, telefon və ya ixtisas axtar..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
            aria-label="İxtisasa görə filtr"
          >
            <option value="">Bütün ixtisaslar</option>

            {specialties.map((item) => (
              <option
                key={item.id ?? item.Id}
                value={String(item.id ?? item.Id)}
              >
                {item.name ?? item.Name}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Statusa görə filtr"
          >
            <option value="all">Bütün statuslar</option>
            <option value="active">Aktiv</option>
            <option value="inactive">Passiv</option>
          </select>
        </div>

        {loading ? (
          <div className="doctors-message">
            Həkimlər yüklənir...
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="doctors-message">
            Axtarışa uyğun həkim tapılmadı.
          </div>
        ) : (
          <div className="doctors-table-wrapper">
            <table className="doctors-table">
              <thead>
                <tr>
                  <th>Həkim</th>
                  <th>İxtisas</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Status</th>
                  <th>Əməliyyat</th>
                </tr>
              </thead>

              <tbody>
                {filteredDoctors.map((doctor) => {
                  const doctorId = doctor.id ?? doctor.Id;
                  const fullName =
                    doctor.fullName ?? doctor.FullName ?? "";
                  const email = doctor.email ?? doctor.Email;
                  const phone =
                    doctor.phoneNumber ?? doctor.PhoneNumber;
                  const imageUrl =
                    doctor.imageUrl ?? doctor.ImageUrl;
                  const isActive =
                    doctor.isActive ?? doctor.IsActive ?? false;

                  const specialtyName =
                    doctor.specialty?.name ??
                    doctor.specialty?.Name ??
                    specialties.find(
                      (item) =>
                        String(item.id ?? item.Id) ===
                        String(
                          doctor.specialtyId ??
                          doctor.SpecialtyId
                        )
                    )?.name ??
                    "Təyin edilməyib";

                  return (
                    <tr key={doctorId}>
                      <td>
                        <div className="doctor-person">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={fullName}
                            />
                          ) : (
                            <div className="doctor-avatar">
                              {fullName.charAt(0).toUpperCase() || "H"}
                            </div>
                          )}

                          <div>
                            <strong>{fullName}</strong>
                            <small>ID: {doctorId}</small>
                          </div>
                        </div>
                      </td>

                      <td>{specialtyName}</td>
                      <td>{email || "—"}</td>
                      <td>{phone || "—"}</td>

                      <td>
                        <span
                          className={
                            isActive
                              ? "doctor-status doctor-status-active"
                              : "doctor-status doctor-status-inactive"
                          }
                        >
                          {isActive ? "Aktiv" : "Passiv"}
                        </span>
                      </td>

                      <td>
                        <div className="doctor-action-buttons">
                          <button
                            type="button"
                            className="doctor-edit-btn"
                            onClick={() => openEditModal(doctor)}
                            disabled={
                              saving || deletingId !== null
                            }
                          >
                            ✎ Redaktə et
                          </button>

                          <button
                            type="button"
                            className="doctor-delete-btn"
                            onClick={() => handleDeleteDoctor(doctor)}
                            disabled={
                              saving || deletingId !== null
                            }
                          >
                            {deletingId === doctorId
                              ? "Silinir..."
                              : "Sil"}
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

        <div className="doctors-footer">
          Göstərilir: {filteredDoctors.length} / {doctors.length}
        </div>
      </div>

      {editOpen && selectedDoctor && (
        <div
          className="doctor-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditModal();
            }
          }}
        >
          <section
            className="doctor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-edit-title"
          >
            <div className="doctor-modal-header">
              <div>
                <span className="doctor-modal-eyebrow">
                  HƏKİM İDARƏETMƏSİ
                </span>
                <h2 id="doctor-edit-title">
                  Həkimi redaktə et
                </h2>
                <p>
                  ID: {selectedDoctor.id ?? selectedDoctor.Id}
                </p>
              </div>

              <button
                type="button"
                className="doctor-modal-close"
                onClick={closeEditModal}
                disabled={saving}
                aria-label="Bağla"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="doctor-notice doctor-notice-error">
                <span>{error}</span>
              </div>
            )}

            <form
              className="doctor-edit-form"
              onSubmit={handleUpdateDoctor}
            >
              <div className="doctor-form-field">
                <label htmlFor="doctor-fullName">
                  Ad və soyad *
                </label>
                <input
                  id="doctor-fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  maxLength={150}
                />
              </div>

              <div className="doctor-form-field">
                <label htmlFor="doctor-email">Email *</label>
                <input
                  id="doctor-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  maxLength={256}
                />
              </div>

              <div className="doctor-form-field">
                <label htmlFor="doctor-phone">
                  Telefon
                </label>
                <input
                  id="doctor-phone"
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  maxLength={30}
                />
              </div>

              <div className="doctor-form-field">
                <label htmlFor="doctor-specialty">
                  İxtisas *
                </label>

                <select
                  id="doctor-specialty"
                  name="specialtyId"
                  value={form.specialtyId}
                  onChange={handleChange}
                  required
                >
                  <option value="">İxtisas seçin</option>

                  {specialties.map((item) => (
                    <option
                      key={item.id ?? item.Id}
                      value={String(item.id ?? item.Id)}
                    >
                      {item.name ?? item.Name}
                    </option>
                  ))}
                </select>

                {specialtiesLoading && (
                  <small>İxtisaslar yüklənir...</small>
                )}
              </div>

              <div className="doctor-form-field doctor-form-full">
                <label htmlFor="doctor-imageUrl">
                  Şəkil URL-i
                </label>
                <input
                  id="doctor-imageUrl"
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/doctor.jpg"
                  maxLength={1000}
                />
              </div>

              <label className="doctor-active-toggle">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                <span>Həkim aktivdir</span>
              </label>

              <div className="doctor-edit-actions">
                <button
                  type="button"
                  className="doctor-cancel-btn"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  Ləğv et
                </button>

                <button
                  type="submit"
                  className="doctor-save-btn"
                  disabled={saving || specialtiesLoading}
                >
                  {saving
                    ? "Yadda saxlanılır..."
                    : "Dəyişiklikləri yadda saxla"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
