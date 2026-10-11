import { useEffect, useMemo, useState } from "react";
import patientService from "../../services/patientService";
import "./patient.css";

const emptyForm = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  phoneNumber: "",
  address: "",
  userId: "",
};

function getList(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getError(err) {
  const data = err?.response?.data;

  if (err?.response?.status === 401) {
    return "Giriş icazəsi yoxdur. Yenidən daxil ol.";
  }

  if (err?.response?.status === 403) {
    return "Bu əməliyyat üçün icazən yoxdur.";
  }

  return (
    data?.message ||
    data?.title ||
    err?.message ||
    "Əməliyyat zamanı xəta baş verdi."
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("az-AZ");
}

function toDateInput(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadPatients() {
    try {
      setLoading(true);
      setError("");

      const response = await patientService.getAll();
      setPatients(getList(response));
    } catch (err) {
      console.error("Patients API error:", err);
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();

    return patients.filter((patient) => {
      const name = patient.fullName ?? "";
      const phone = patient.phoneNumber ?? "";
      const address = patient.address ?? "";
      const gender = String(patient.gender ?? "");

      const matchesSearch =
        !term ||
        name.toLowerCase().includes(term) ||
        phone.toLowerCase().includes(term) ||
        address.toLowerCase().includes(term) ||
        String(patient.id ?? "").includes(term);

      const matchesGender =
        genderFilter === "all" ||
        gender.toLowerCase() === genderFilter.toLowerCase();

      return matchesSearch && matchesGender;
    });
  }, [patients, search, genderFilter]);

  function openCreateModal() {
    setEditingPatient(null);
    setForm({ ...emptyForm });
    setNotice("");
    setError("");
    setModalOpen(true);
  }

  function openEditModal(patient) {
    setEditingPatient(patient);
    setForm({
      fullName: patient.fullName ?? "",
      dateOfBirth: toDateInput(patient.dateOfBirth),
      gender: patient.gender ?? "",
      phoneNumber: patient.phoneNumber ?? "",
      address: patient.address ?? "",
      userId: patient.userId ?? "",
    });
    setNotice("");
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingPatient(null);
    setForm({ ...emptyForm });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.fullName.trim()) {
      setError("Pasiyentin adını daxil et.");
      return;
    }

    if (!form.dateOfBirth) {
      setError("Doğum tarixini seç.");
      return;
    }

    if (new Date(form.dateOfBirth) > new Date()) {
      setError("Doğum tarixi gələcək tarix ola bilməz.");
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender.trim(),
      phoneNumber: form.phoneNumber.trim(),
      address: form.address.trim(),
      userId: form.userId.trim() || null,
    };

    try {
      setSaving(true);

      if (editingPatient) {
        await patientService.update(editingPatient.id, {
          ...payload,
          id: editingPatient.id,
        });
        setNotice("Pasiyent məlumatları yeniləndi.");
      } else {
        await patientService.create(payload);
        setNotice("Yeni pasiyent əlavə edildi.");
      }

      setModalOpen(false);
      setEditingPatient(null);
      setForm({ ...emptyForm });

      await loadPatients();
    } catch (err) {
      console.error("Patient save error:", err);
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(patient) {
    const confirmed = window.confirm(
      `"${patient.fullName}" adlı pasiyenti silmək istəyirsən?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await patientService.delete(patient.id);
      setPatients((previous) =>
        previous.filter((item) => item.id !== patient.id)
      );
      setNotice("Pasiyent silindi.");
    } catch (err) {
      console.error("Patient delete error:", err);
      setError(getError(err));
    }
  }

  return (
    <div className="patients-page">
      <div className="patients-heading">
        <div>
          <span className="patients-eyebrow">İDARƏETMƏ PANELİ</span>
          <h1>Pasiyentlər</h1>
          <p>Pasiyent məlumatlarını idarə et və yenilə.</p>
        </div>

        <button
          type="button"
          className="patient-primary-button"
          onClick={openCreateModal}
        >
          <span>＋</span> Yeni pasiyent
        </button>
      </div>

      <div className="patients-stats">
        <div className="patient-stat-card">
          <div className="patient-stat-icon patient-icon-blue">♙</div>
          <div>
            <span>Bütün pasiyentlər</span>
            <strong>{patients.length}</strong>
          </div>
        </div>

        <div className="patient-stat-card">
          <div className="patient-stat-icon patient-icon-purple">⌕</div>
          <div>
            <span>Axtarış nəticəsi</span>
            <strong>{filteredPatients.length}</strong>
          </div>
        </div>
      </div>

      <div className="patients-table-card">
        <div className="patients-toolbar">
          <div>
            <h2>Pasiyent siyahısı</h2>
            <p>Pasiyentlərin məlumatları</p>
          </div>

          <div className="patients-filters">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ad, telefon, ünvan və ya ID..."
              aria-label="Pasiyent axtar"
            />

            <select
              value={genderFilter}
              onChange={(event) => setGenderFilter(event.target.value)}
              aria-label="Cinsə görə filtr"
            >
              <option value="all">Bütün cinslər</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Kişi">Kişi</option>
              <option value="Qadın">Qadın</option>
            </select>
          </div>
        </div>

        {notice && (
          <div className="patient-notice" role="status">
            {notice}
          </div>
        )}

        {error && !modalOpen && (
          <div className="patient-error" role="alert">
            {error}
            <button type="button" onClick={loadPatients}>
              Yenidən yoxla
            </button>
          </div>
        )}

        {loading ? (
          <div className="patients-state">Pasiyentlər yüklənir...</div>
        ) : error && patients.length === 0 ? (
          <div className="patients-state patients-state-error">
            {error}
            <button type="button" onClick={loadPatients}>
              Yenidən cəhd et
            </button>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="patients-state">
            <span className="patients-empty-icon">♙</span>
            <strong>Pasiyent tapılmadı</strong>
            <p>Axtarış şərtlərini dəyiş və ya yeni pasiyent əlavə et.</p>
          </div>
        ) : (
          <div className="patients-table-wrap">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pasiyent</th>
                  <th>Doğum tarixi</th>
                  <th>Cins</th>
                  <th>Telefon</th>
                  <th>Ünvan</th>
                  <th>Əməliyyatlar</th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <span className="patient-id">#{patient.id}</span>
                    </td>
                    <td>
                      <div className="patient-name-cell">
                        <div className="patient-avatar">
                          {(patient.fullName ?? "P")
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <strong>{patient.fullName || "Adsız pasiyent"}</strong>
                      </div>
                    </td>
                    <td>{formatDate(patient.dateOfBirth)}</td>
                    <td>
                      <span className="patient-gender">
                        {patient.gender || "-"}
                      </span>
                    </td>
                    <td>{patient.phoneNumber || "-"}</td>
                    <td className="patient-address">
                      {patient.address || "-"}
                    </td>
                    <td>
                      <div className="patient-actions">
                        <button
                          type="button"
                          className="patient-edit-button"
                          onClick={() => openEditModal(patient)}
                        >
                          Redaktə
                        </button>
                        <button
                          type="button"
                          className="patient-delete-button"
                          onClick={() => handleDelete(patient)}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="patients-table-footer">
          Göstərilir: <strong>{filteredPatients.length}</strong> /{" "}
          <strong>{patients.length}</strong> pasiyent
        </div>
      </div>

      {modalOpen && (
        <div
          className="patient-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="patient-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="patient-modal-title"
          >
            <div className="patient-modal-header">
              <div>
                <span className="patients-eyebrow">
                  PASİYENT MƏLUMATLARI
                </span>
                <h2 id="patient-modal-title">
                  {editingPatient
                    ? "Pasiyenti redaktə et"
                    : "Yeni pasiyent"}
                </h2>
                <p>Pasiyentin məlumatlarını aşağıda daxil et.</p>
              </div>

              <button
                type="button"
                className="patient-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Pəncərəni bağla"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="patient-error patient-modal-error" role="alert">
                {error}
              </div>
            )}

            <form className="patient-form" onSubmit={handleSubmit}>
              <label>
                Ad və soyad <span>*</span>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Məsələn, Əli Məmmədov"
                  required
                  maxLength={200}
                />
              </label>

              <div className="patient-form-row">
                <label>
                  Doğum tarixi <span>*</span>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    max={toDateInput(new Date())}
                    required
                  />
                </label>

                <label>
                  Cins
                  <input
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    placeholder="Modelə uyğun cins dəyəri"
                  />
                </label>
              </div>

              <label>
                Telefon nömrəsi
                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="+994 XX XXX XX XX"
                  maxLength={30}
                />
              </label>

              <label>
                Ünvan
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Pasiyentin ünvanı"
                  maxLength={500}
                />
              </label>

              <label>
                User ID <span className="patient-optional">(istəyə bağlı)</span>
                <input
                  name="userId"
                  value={form.userId}
                  onChange={handleChange}
                  placeholder="İstifadəçi ID-si"
                />
                <small>
                  Redaktə zamanı mövcud User ID-ni boşaltmamaq üçün olduğu
                  kimi saxla.
                </small>
              </label>

              <div className="patient-form-actions">
                <button
                  type="button"
                  className="patient-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Ləğv et
                </button>

                <button
                  type="submit"
                  className="patient-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Yadda saxlanılır..."
                    : editingPatient
                      ? "Dəyişiklikləri saxla"
                      : "Pasiyent əlavə et"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}