import { useEffect, useMemo, useState } from "react";
import painAreaService from "../../services/painAreaService";
import "./PainAreas.css";

const emptyForm = {
  name: "",
  description: "",
};

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getErrorMessage(error) {
  const data = error.response?.data;

  if (typeof data === "string") return data;
  if (data?.message) return data.message;

  if (data?.errors) {
    return Object.values(data.errors).flat().join(" ");
  }

  if (data?.title) return data.title;

  if (error.response?.status === 400) {
    return "Göndərilən məlumatlar yanlışdır. Sahələri yoxla.";
  }

  return "Əməliyyat alınmadı. Backend bağlantısını yoxla.";
}

export default function PainAreas() {
  const [painAreas, setPainAreas] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function loadPainAreas() {
    setLoading(true);
    setError("");

    try {
      const data = await painAreaService.getAll();
      setPainAreas(normalizeList(data));
    } catch (err) {
      console.error("Pain Areas yükləmə xətası:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPainAreas();
  }, []);

  const filteredPainAreas = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return painAreas;

    return painAreas.filter((item) => {
      const name = String(item.name ?? item.Name ?? "").toLowerCase();
      const description = String(
        item.description ?? item.Description ?? ""
      ).toLowerCase();

      return (
        name.includes(query) ||
        description.includes(query) ||
        String(item.id ?? item.Id ?? "").includes(query)
      );
    });
  }, [painAreas, search]);

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditModal(item) {
    setEditingId(item.id ?? item.Id);
    setForm({
      name: item.name ?? item.Name ?? "",
      description: item.description ?? item.Description ?? "",
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();

    if (!name) {
      setError("Ağrı nahiyəsinin adını daxil et.");
      return;
    }

    const payload = {
      name,
      description: form.description.trim(),
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await painAreaService.update(editingId, payload);
        setSuccess("Ağrı nahiyəsi uğurla yeniləndi.");
      } else {
        await painAreaService.create(payload);
        setSuccess("Yeni ağrı nahiyəsi əlavə edildi.");
      }

      setModalOpen(false);
      setForm(emptyForm);
      await loadPainAreas();
    } catch (err) {
      console.error(
        "Pain Area əməliyyat xətası:",
        err.response?.data ?? err
      );
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const id = item.id ?? item.Id;
    const name = item.name ?? item.Name ?? "Bu ağrı nahiyəsi";

    if (!window.confirm(`"${name}" məlumatını silmək istəyirsən?`)) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await painAreaService.delete(id);

      setPainAreas((previous) =>
        previous.filter((area) => (area.id ?? area.Id) !== id)
      );

      setSuccess("Ağrı nahiyəsi silindi.");
    } catch (err) {
      console.error("Pain Area silmə xətası:", err);
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="pa-page">
      <header className="pa-header">
        <div>
          <span className="pa-eyebrow">İDARƏETMƏ PANELİ</span>
          <h1>Ağrı nahiyələri</h1>
          <p>Xəstələrin ağrı nahiyələri siyahısını idarə et.</p>
        </div>

        <button
          type="button"
          className="pa-primary-btn"
          onClick={openCreateModal}
        >
          <span>＋</span> Yeni nahiyə
        </button>
      </header>

      {error && !modalOpen && (
        <div className="pa-alert pa-alert-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="pa-alert pa-alert-success">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")}>
            ×
          </button>
        </div>
      )}

      <div className="pa-stats">
        <div className="pa-stat-card">
          <div className="pa-stat-icon pa-icon-blue">♧</div>
          <div>
            <span>Ümumi nahiyələr</span>
            <strong>{painAreas.length}</strong>
          </div>
        </div>

        <div className="pa-stat-card">
          <div className="pa-stat-icon pa-icon-purple">⌕</div>
          <div>
            <span>Axtarış nəticələri</span>
            <strong>{filteredPainAreas.length}</strong>
          </div>
        </div>
      </div>

      <section className="pa-panel">
        <div className="pa-panel-heading">
          <div>
            <h2>Nahiyələrin siyahısı</h2>
            <p>Əlavə et, axtar, redaktə et və ya sil.</p>
          </div>

          <button
            type="button"
            className="pa-refresh-btn"
            onClick={loadPainAreas}
            disabled={loading}
          >
            ↻ Yenilə
          </button>
        </div>

        <div className="pa-toolbar">
          <div className="pa-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Ad və ya təsvir üzrə axtar..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button type="button" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="pa-empty">
            <div className="pa-loader" />
            <p>Ağrı nahiyələri yüklənir...</p>
          </div>
        ) : filteredPainAreas.length === 0 ? (
          <div className="pa-empty">
            <div className="pa-empty-icon">⌕</div>
            <h3>
              {search ? "Nəticə tapılmadı" : "Hələ nahiyə əlavə edilməyib"}
            </h3>
            <p>
              {search
                ? "Başqa axtarış sözü daxil et."
                : "Başlamaq üçün yeni ağrı nahiyəsi əlavə et."}
            </p>

            {!search && (
              <button
                type="button"
                className="pa-primary-btn"
                onClick={openCreateModal}
              >
                ＋ Nahiyə əlavə et
              </button>
            )}
          </div>
        ) : (
          <div className="pa-table-wrapper">
            <table className="pa-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAHİYƏNİN ADI</th>
                  <th>TƏSVİR</th>
                  <th className="pa-action-heading">ƏMƏLİYYAT</th>
                </tr>
              </thead>

              <tbody>
                {filteredPainAreas.map((item) => {
                  const id = item.id ?? item.Id;
                  const name = item.name ?? item.Name ?? "Adsız nahiyə";
                  const description =
                    item.description ?? item.Description ?? "";

                  return (
                    <tr key={id}>
                      <td>
                        <span className="pa-id">#{id}</span>
                      </td>

                      <td>
                        <div className="pa-name-cell">
                          <div className="pa-name-icon">✚</div>
                          <strong>{name}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="pa-description">
                          {description || "Təsvir daxil edilməyib"}
                        </span>
                      </td>

                      <td>
                        <div className="pa-row-actions">
                          <button
                            type="button"
                            className="pa-edit-btn"
                            onClick={() => openEditModal(item)}
                          >
                            Redaktə
                          </button>

                          <button
                            type="button"
                            className="pa-delete-btn"
                            onClick={() => handleDelete(item)}
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

        <footer className="pa-panel-footer">
          Cəmi {filteredPainAreas.length} qeyd göstərilir
        </footer>
      </section>

      {modalOpen && (
        <div
          className="pa-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="pa-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pa-modal-title"
          >
            <div className="pa-modal-header">
              <div>
                <span className="pa-eyebrow">
                  {editingId !== null ? "MƏLUMATLARI DƏYİŞ" : "YENİ QEYD"}
                </span>

                <h2 id="pa-modal-title">
                  {editingId !== null
                    ? "Nahiyəni redaktə et"
                    : "Yeni ağrı nahiyəsi"}
                </h2>
              </div>

              <button
                type="button"
                className="pa-close-btn"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                ×
              </button>
            </div>

            {error && (
              <div className="pa-alert pa-alert-error">{error}</div>
            )}

            <form className="pa-form" onSubmit={handleSubmit}>
              <label>
                Nahiyənin adı <span>*</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Məsələn: Baş ağrısı"
                  maxLength={100}
                  required
                  autoFocus
                />
              </label>

              <label>
                Təsvir
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Nahiyə haqqında qısa məlumat..."
                  rows={4}
                  maxLength={500}
                />
              </label>

              <div className="pa-form-note">
                <span>*</span> İşarələnmiş sahə mütləq doldurulmalıdır.
              </div>

              <div className="pa-modal-actions">
                <button
                  type="button"
                  className="pa-cancel-btn"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Ləğv et
                </button>

                <button
                  type="submit"
                  className="pa-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Yadda saxlanılır..."
                    : editingId !== null
                      ? "Dəyişiklikləri saxla"
                      : "Nahiyə yarat"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}