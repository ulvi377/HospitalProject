import { useEffect, useMemo, useState } from "react";
import specialtyService from "../../services/specialtyService";
import "./Specialties.css";

const emptyForm = {
  name: "",
  description: "",
};

function Specialties() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadSpecialties = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await specialtyService.getAll();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.$values)
        ? data.$values
        : Array.isArray(data?.items)
        ? data.items
        : [];

      setSpecialties(list);
    } catch (err) {
      console.error("İxtisasları yükləmək mümkün olmadı:", err);
      setError("İxtisasları yükləmək mümkün olmadı. Backend bağlantısını yoxla.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecialties();
  }, []);

  const filteredSpecialties = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return specialties;

    return specialties.filter((item) => {
      const name = (item.name ?? "").toLowerCase();
      const description = (item.description ?? "").toLowerCase();

      return name.includes(term) || description.includes(term);
    });
  }, [specialties, search]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (specialty) => {
    setEditingId(specialty.id);
    setForm({
      name: specialty.name ?? "",
      description: specialty.description ?? "",
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("İxtisasın adını daxil et.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      };

      if (editingId !== null) {
        await specialtyService.update(editingId, payload);
      } else {
        await specialtyService.create(payload);
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadSpecialties();
    } catch (err) {
      console.error("İxtisası yadda saxlamaq mümkün olmadı:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Əməliyyat uğursuz oldu. Backend modelini və icazələri yoxla."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (specialty) => {
    const confirmed = window.confirm(
      `"${specialty.name}" ixtisasını silmək istədiyinə əminsən?`
    );

    if (!confirmed) return;

    try {
      setError("");
      await specialtyService.delete(specialty.id);
      await loadSpecialties();
    } catch (err) {
      console.error("İxtisası silmək mümkün olmadı:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "İxtisas silinmədi. Bu ixtisasa bağlı həkimlər ola bilər."
      );
    }
  };

  return (
    <div className="specialties-page">
      <div className="specialties-header">
        <div>
          <span className="specialties-eyebrow">İDARƏETMƏ</span>
          <h1>İxtisaslar</h1>
          <p>Hospitalda mövcud olan tibbi ixtisasları idarə et.</p>
        </div>

        <button
          className="specialties-primary-btn"
          onClick={openCreateModal}
          type="button"
        >
          <span>+</span> Yeni ixtisas
        </button>
      </div>

      <div className="specialties-stats">
        <div className="specialties-stat-card">
          <div className="specialties-stat-icon">✚</div>
          <div>
            <p>Ümumi ixtisaslar</p>
            <h2>{specialties.length}</h2>
          </div>
        </div>

        <div className="specialties-stat-card">
          <div className="specialties-stat-icon specialties-search-icon">
            ⌕
          </div>
          <div>
            <p>Axtarış nəticəsi</p>
            <h2>{filteredSpecialties.length}</h2>
          </div>
        </div>
      </div>

      {error && !showModal && (
        <div className="specialties-alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      <section className="specialties-panel">
        <div className="specialties-panel-header">
          <div>
            <h2>İxtisas siyahısı</h2>
            <p>Bütün tibbi ixtisaslara burada baxa bilərsən.</p>
          </div>

          <div className="specialties-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="İxtisas axtar..."
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
        </div>

        {loading ? (
          <div className="specialties-state">
            <div className="specialties-spinner"></div>
            <p>İxtisaslar yüklənir...</p>
          </div>
        ) : filteredSpecialties.length === 0 ? (
          <div className="specialties-state">
            <div className="specialties-empty-icon">✚</div>
            <h3>
              {search ? "Nəticə tapılmadı" : "Hələ ixtisas yoxdur"}
            </h3>
            <p>
              {search
                ? "Başqa adla axtarış etməyə çalış."
                : "Yeni ixtisas əlavə edərək başlaya bilərsən."}
            </p>
          </div>
        ) : (
          <div className="specialties-table-wrapper">
            <table className="specialties-table">
              <thead>
                <tr>
                  <th>İXTİSAS</th>
                  <th>TƏSVİR</th>
                  <th>ID</th>
                  <th className="specialties-actions-heading">ƏMƏLİYYATLAR</th>
                </tr>
              </thead>

              <tbody>
                {filteredSpecialties.map((specialty) => (
                  <tr key={specialty.id}>
                    <td>
                      <div className="specialty-name-cell">
                        <div className="specialty-avatar">
                          {(specialty.name || "İ").charAt(0).toUpperCase()}
                        </div>
                        <span>{specialty.name || "Adsız ixtisas"}</span>
                      </div>
                    </td>

                    <td className="specialty-description">
                      {specialty.description || "Təsvir əlavə edilməyib"}
                    </td>

                    <td>
                      <span className="specialty-id">
                        #{specialty.id}
                      </span>
                    </td>

                    <td>
                      <div className="specialty-actions">
                        <button
                          type="button"
                          className="specialty-edit-btn"
                          onClick={() => openEditModal(specialty)}
                        >
                          Redaktə
                        </button>

                        <button
                          type="button"
                          className="specialty-delete-btn"
                          onClick={() => handleDelete(specialty)}
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

        {!loading && filteredSpecialties.length > 0 && (
          <div className="specialties-table-footer">
            Göstərilir: <strong>{filteredSpecialties.length}</strong> ixtisas
          </div>
        )}
      </section>

      {showModal && (
        <div
          className="specialties-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="specialties-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="specialties-modal-title"
          >
            <div className="specialties-modal-header">
              <div>
                <span className="specialties-eyebrow">İXTİSASLAR</span>
                <h2 id="specialties-modal-title">
                  {editingId !== null
                    ? "İxtisası redaktə et"
                    : "Yeni ixtisas əlavə et"}
                </h2>
              </div>

              <button
                type="button"
                className="specialties-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Bağla"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && <div className="specialties-alert">{error}</div>}

              <div className="specialties-form-group">
                <label htmlFor="specialty-name">İxtisasın adı *</label>
                <input
                  id="specialty-name"
                  name="name"
                  type="text"
                  placeholder="Məsələn: Kardiologiya"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="specialties-form-group">
                <label htmlFor="specialty-description">Təsvir</label>
                <textarea
                  id="specialty-description"
                  name="description"
                  placeholder="İxtisas haqqında qısa məlumat..."
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                />
              </div>

              <div className="specialties-modal-actions">
                <button
                  type="button"
                  className="specialties-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Ləğv et
                </button>

                <button
                  type="submit"
                  className="specialties-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Yadda saxlanılır..."
                    : editingId !== null
                    ? "Dəyişiklikləri saxla"
                    : "İxtisası əlavə et"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Specialties;