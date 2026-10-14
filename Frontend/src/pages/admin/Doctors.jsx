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
  if (Array.isArray(data?.Items)) return data.Items;
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
    return "Sorğu qəbul edilmədi. Məlumatları yoxlayın.";
  }

  if (err.response?.status === 401) {
    return "Sessiya bitib. Yenidən daxil olun.";
  }

  if (err.response?.status === 403) {
    return "Bu əməliyyat üçün Admin icazəsi lazımdır.";
  }

  if (err.response?.status === 404) {
    return "Həkim və ya şəkil yükləmə endpoint-i tapılmadı.";
  }

  if (err.response?.status === 413) {
    return "Şəkil çox böyükdür. Daha kiçik şəkil seçin.";
  }

  if (err.response?.status === 415) {
    return "Şəkil formatı server tərəfindən qəbul edilmir.";
  }

  if (err.response?.status === 500) {
    return "Server xətası. Backend və Cloudinary parametrlərini yoxlayın.";
  }

  return "Əməliyyat alınmadı. Backend bağlantısını yoxlayın.";
}

function getDoctorImage(doctor) {
  return (
    doctor?.imageUrl ??
    doctor?.ImageUrl ??
    doctor?.profileImageUrl ??
    doctor?.ProfileImageUrl ??
    doctor?.photoUrl ??
    doctor?.PhotoUrl ??
    null
  );
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

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const filteredDoctors = useMemo(() => {
    const term = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch =
        !term ||
        [
          doctor.fullName ?? doctor.FullName,
          doctor.email ?? doctor.Email,
          doctor.phoneNumber ?? doctor.PhoneNumber,
          doctor.specialty?.name ?? doctor.specialty?.Name,
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
    const currentImage = getDoctorImage(doctor) || "";

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
      imageUrl: currentImage,
      isActive: Boolean(
        doctor.isActive ?? doctor.IsActive
      ),
    });

    setSelectedImage(null);
    setImagePreview(currentImage);
    setError("");
    setSuccess("");
    setEditOpen(true);
  }

  function closeEditModal() {
    if (saving) return;

    setEditOpen(false);
    setSelectedDoctor(null);
    setForm(emptyForm);
    setSelectedImage(null);
    setImagePreview("");
    setError("");
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "imageUrl") {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setSelectedImage(null);
      setImagePreview(value);
    }
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Zəhmət olmasa, şəkil faylı seçin.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Şəkil 5 MB-dan böyük olmamalıdır.");
      event.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setError("");
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleUpdateDoctor(event) {
    event.preventDefault();

    if (!selectedDoctor) return;

    const doctorId =
      selectedDoctor.id ?? selectedDoctor.Id;

    if (!doctorId) {
      setError("Həkimin ID-si tapılmadı.");
      return;
    }

    if (!form.fullName.trim()) {
      setError("Həkimin adı boş ola bilməz.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email ünvanı boş ola bilməz.");
      return;
    }

    if (!form.specialtyId) {
      setError("Zəhmət olmasa, həkimin ixtisasını seçin.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // 1. Həkimin adi məlumatlarını yenilə.
      const payload = {
        id: doctorId,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        specialtyId: Number(form.specialtyId),
        imageUrl:
          form.imageUrl.trim() ||
          getDoctorImage(selectedDoctor) ||
          "",
        isActive: form.isActive,
      };

      await api.put(`/Doctors/${doctorId}`, payload);

      // 2. Yeni şəkil seçilibsə, ayrıca backend-ə göndər.
      if (selectedImage) {
        const formData = new FormData();
        formData.append("file", selectedImage);

        await api.post(
          `/Doctors/${doctorId}/image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      // 3. Yükləmə uğurludursa, siyahını yenilə.
      setEditOpen(false);
      setSelectedDoctor(null);
      setForm(emptyForm);
      setSelectedImage(null);
      setImagePreview("");

      setSuccess(
        selectedImage
          ? "Həkim məlumatları və şəkli uğurla yeniləndi."
          : "Həkim məlumatları uğurla yeniləndi."
      );

      await loadDoctors();
    } catch (err) {
      console.error(
        "Həkim və ya şəkil yeniləmə xətası:",
        err.response?.data ?? err
      );

      setError(getErrorMessage(err));

      // Məlumat PUT ilə yenilənmiş ola bilər; siyahını yoxla.
      try {
        const response = await api.get("/Doctors");
        setDoctors(normalizeList(response.data));
      } catch {
        // Əsas xətanı saxla.
      }
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
          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="doctor-notice doctor-notice-success">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")}>
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
                  const imageUrl = getDoctorImage(doctor);
                  const isActive =
                    doctor.isActive ?? doctor.IsActive ?? false;

                  const specialtyId =
                    doctor.specialtyId ?? doctor.SpecialtyId;

                  const specialtyName =
                    doctor.specialty?.name ??
                    doctor.specialty?.Name ??
                    specialties.find(
                      (item) =>
                        String(item.id ?? item.Id) ===
                        String(specialtyId)
                    )?.name ??
                    specialties.find(
                      (item) =>
                        String(item.id ?? item.Id) ===
                        String(specialtyId)
                    )?.Name ??
                    "Təyin edilməyib";

                  return (
                    <tr key={doctorId}>
                      <td>
                        <div className="doctor-person">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={fullName}
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
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
                <label htmlFor="doctor-phone">Telefon</label>

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
                <label htmlFor="doctor-image-file">
                  Həkimin şəklini seç
                </label>

                <input
                  id="doctor-image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={saving}
                />

                <small>
                  JPG, PNG və ya WEBP formatı. Maksimum 5 MB.
                </small>
              </div>

              {imagePreview && (
                <div className="doctor-form-field doctor-form-full">
                  <label>Şəkil önizləməsi</label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                      padding: 14,
                      border: "1px solid #e1e8f2",
                      borderRadius: 12,
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Həkim şəkli önizləməsi"
                      onError={(event) => {
                        event.currentTarget.style.opacity = "0.35";
                      }}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        objectPosition: "center top",
                        borderRadius: 12,
                        background: "#edf2f9",
                      }}
                    />

                    <div>
                      <strong style={{ display: "block" }}>
                        {selectedImage
                          ? "Yeni şəkil seçilib"
                          : "Hazırkı şəkil"}
                      </strong>

                      <small style={{ display: "block", marginTop: 6 }}>
                        {selectedImage
                          ? selectedImage.name
                          : "Yeni şəkil seçərək dəyişə bilərsiniz."}
                      </small>

                      {selectedImage && (
                        <button
                          type="button"
                          onClick={() => {
                            if (imagePreview.startsWith("blob:")) {
                              URL.revokeObjectURL(imagePreview);
                            }

                            setSelectedImage(null);

                            const oldImage =
                              getDoctorImage(selectedDoctor) || "";

                            setImagePreview(oldImage);

                            setForm((previous) => ({
                              ...previous,
                              imageUrl: oldImage,
                            }));
                          }}
                          disabled={saving}
                          style={{
                            marginTop: 10,
                            padding: "6px 10px",
                            border: "1px solid #e1e8f2",
                            borderRadius: 8,
                            background: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          Seçimi ləğv et
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="doctor-form-field doctor-form-full">
                <label htmlFor="doctor-imageUrl">
                  Şəkil URL-i (istəyə bağlı)
                </label>

                <input
                  id="doctor-imageUrl"
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://res.cloudinary.com/..."
                  maxLength={1000}
                />

                <small>
                  Fayl seçsəniz, yüklənən yeni şəkil bu URL-i əvəz edəcək.
                </small>
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
                    ? selectedImage
                      ? "Şəkil yüklənir..."
                      : "Yadda saxlanılır..."
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