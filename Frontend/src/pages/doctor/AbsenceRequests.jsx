import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  CalendarDays,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ImagePlus,
  X,
  FileImage,
  ClipboardList,
  ShieldCheck,
  AlertCircle,
  Eye,
  Stethoscope,
} from "lucide-react";

export default function AbsenceRequests() {
  const [requests, setRequests] = useState([]);
  const [absenceDate, setAbsenceDate] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const minDate = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, "0"),
    String(tomorrow.getDate()).padStart(2, "0"),
  ].join("-");

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response = await api.get("/DoctorAbsenceRequests/my");
      const data = response.data;

      setRequests(
        Array.isArray(data)
          ? data
          : data?.$values ?? data?.items ?? []
      );

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Sorğuları yükləmək mümkün olmadı."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Yalnız JPG, PNG, WEBP və GIF formatlı şəkil seç.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Şəkilin ölçüsü maksimum 5 MB ola bilər.");
      e.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setError("");
    setMessage("");
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!absenceDate || !reason.trim()) {
      setError("Tarixi və səbəbi qeyd et.");
      return;
    }

    if (absenceDate <= new Date().toLocaleDateString("en-CA")) {
      setError("Tarix sabahdan və ya daha sonrakı günlərdən biri olmalıdır.");
      return;
    }

    try {
      setSending(true);

      const formData = new FormData();

      formData.append("AbsenceDate", absenceDate);
      formData.append("Reason", reason.trim());

      if (note.trim()) {
        formData.append("Note", note.trim());
      }

      if (image) {
        formData.append("Image", image);
      }

      const response = await api.post(
        "/DoctorAbsenceRequests",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(
        response.data?.message || "Sorğu uğurla göndərildi."
      );

      setAbsenceDate("");
      setReason("");
      setNote("");
      removeImage();

      const fileInput = document.getElementById(
        "absence-image-input"
      );

      if (fileInput) {
        fileInput.value = "";
      }

      await loadRequests();
    } catch (err) {
      console.error(
        "İşə gələ bilməmə sorğusu xətası:",
        err.response?.data ?? err
      );

      setError(
        err.response?.data?.message ||
          "Sorğu göndərilərkən xəta baş verdi."
      );
    } finally {
      setSending(false);
    }
  };

  const getStatus = (status) => {
    switch (status) {
      case "Approved":
        return {
          label: "Təsdiqlənib",
          className: "approved",
          icon: <CheckCircle size={15} />,
        };

      case "Rejected":
        return {
          label: "Rədd edilib",
          className: "rejected",
          icon: <XCircle size={15} />,
        };

      default:
        return {
          label: "Gözləyir",
          className: "pending",
          icon: <Clock size={15} />,
        };
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("az-AZ", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  return (
    <div className="absence-page">
      <div className="absence-topbar">
        <div className="absence-breadcrumb">
          <span>Həkim paneli</span>
          <span className="absence-breadcrumb-separator">/</span>
          <strong>İşdə olmama sorğuları</strong>
        </div>

        <div className="absence-secure-label">
          <ShieldCheck size={15} />
          <span>Şəxsi həkim kabineti</span>
        </div>
      </div>

      <header className="absence-header">
        <div className="absence-header-content">
          <div className="absence-eyebrow">
            <Stethoscope size={14} />
            HƏKİM İDARƏETMƏSİ
          </div>

          <h1>İşə gələ bilməmə sorğuları</h1>

          <p>
            İşdə olmayacağın tarixi bildir, lazım olduqda təsdiqləyici
            şəkil əlavə et və müraciətinin vəziyyətini izlə.
          </p>
        </div>

        <button
          className="absence-refresh"
          onClick={loadRequests}
          type="button"
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "absence-spin" : ""}
          />
          Yenilə
        </button>
      </header>

      <div className="absence-stats">
        <div className="absence-stat-card">
          <div className="absence-stat-icon stat-blue">
            <ClipboardList size={21} />
          </div>
          <div className="absence-stat-info">
            <span>Ümumi sorğular</span>
            <strong>{requests.length}</strong>
            <small>Bütün müraciətlər</small>
          </div>
        </div>

        <div className="absence-stat-card">
          <div className="absence-stat-icon stat-amber">
            <Clock size={21} />
          </div>
          <div className="absence-stat-info">
            <span>Gözləyən</span>
            <strong>{pendingCount}</strong>
            <small>Admin qərarı gözlənilir</small>
          </div>
        </div>

        <div className="absence-stat-card">
          <div className="absence-stat-icon stat-green">
            <CheckCircle size={21} />
          </div>
          <div className="absence-stat-info">
            <span>Təsdiqlənən</span>
            <strong>{approvedCount}</strong>
            <small>Təsdiq edilmiş sorğular</small>
          </div>
        </div>

        <div className="absence-stat-card">
          <div className="absence-stat-icon stat-red">
            <XCircle size={21} />
          </div>
          <div className="absence-stat-info">
            <span>Rədd edilən</span>
            <strong>{rejectedCount}</strong>
            <small>Rədd olunmuş sorğular</small>
          </div>
        </div>
      </div>

      {error && (
        <div className="absence-alert error">
          <AlertCircle size={19} />
          <span>{error}</span>
          <button
            type="button"
            aria-label="Xətanı bağla"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {message && (
        <div className="absence-alert success">
          <CheckCircle size={19} />
          <span>{message}</span>
          <button
            type="button"
            aria-label="Bildirişi bağla"
            onClick={() => setMessage("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="absence-main-grid">
        <section className="absence-form-card">
          <div className="absence-card-heading">
            <div className="absence-heading-icon">
              <CalendarDays size={22} />
            </div>

            <div>
              <span className="absence-section-label">
                YENİ MÜRACİƏT
              </span>
              <h2>Sorğu yarat</h2>
              <p>Formanı doldurub adminə göndər.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="absence-form">
            <div className="absence-field">
              <label htmlFor="absence-date">
                İşdə olmayacağın tarix <span>*</span>
              </label>

              <div className="absence-input-wrap">
                <CalendarDays size={18} />
                <input
                  id="absence-date"
                  type="date"
                  value={absenceDate}
                  min={minDate}
                  onChange={(e) => setAbsenceDate(e.target.value)}
                  required
                />
              </div>

              <small>
                Yalnız sabah və ya daha sonrakı tarix seçilə bilər.
              </small>
            </div>

            <div className="absence-field">
              <label htmlFor="absence-reason">
                İşdə olmama səbəbi <span>*</span>
              </label>

              <input
                id="absence-reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Məsələn, şəxsi səbəb və ya səhhət"
                maxLength={500}
                required
              />

              <div className="absence-character-count">
                {reason.length}/500
              </div>
            </div>

            <div className="absence-field">
              <label htmlFor="absence-note">
                Əlavə qeyd
                <span className="absence-optional">İstəyə bağlı</span>
              </label>

              <textarea
                id="absence-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Admin üçün əlavə məlumat yaz..."
                rows={4}
                maxLength={2000}
              />

              <div className="absence-character-count">
                {note.length}/2000
              </div>
            </div>

            <div className="absence-field">
              <label>
                Təsdiqləyici şəkil
                <span className="absence-optional">İstəyə bağlı</span>
              </label>

              {!imagePreview ? (
                <label
                  htmlFor="absence-image-input"
                  className="absence-upload-zone"
                >
                  <div className="absence-upload-icon">
                    <ImagePlus size={25} />
                  </div>

                  <strong>Şəkil seçmək üçün kliklə</strong>

                  <span>
                    JPG, PNG, WEBP və ya GIF
                  </span>

                  <span className="absence-upload-limit">
                    Maksimum fayl ölçüsü: 5 MB
                  </span>

                  <input
                    id="absence-image-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    hidden
                  />
                </label>
              ) : (
                <div className="absence-image-preview">
                  <img
                    src={imagePreview}
                    alt="Seçilmiş şəkilin önizləməsi"
                  />

                  <div className="absence-image-overlay">
                    <div className="absence-image-file">
                      <FileImage size={17} />
                      <span>{image?.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={removeImage}
                      className="absence-remove-image"
                      aria-label="Şəkli sil"
                    >
                      <X size={17} />
                    </button>
                  </div>

                  <label
                    htmlFor="absence-image-input"
                    className="absence-change-image"
                  >
                    Başqa şəkil seç
                  </label>

                  <input
                    id="absence-image-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    hidden
                  />
                </div>
              )}

              <small>
                Şəkil seçilməsə də sorğu göndərmək mümkündür.
              </small>
            </div>

            <div className="absence-form-divider" />

            <button
              className="absence-submit"
              type="submit"
              disabled={sending}
            >
              {sending ? (
                <>
                  <span className="absence-button-spinner" />
                  Göndərilir...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Sorğunu göndər
                </>
              )}
            </button>

            <p className="absence-form-footnote">
              <ShieldCheck size={15} />
              Müraciətin admin tərəfindən nəzərdən keçiriləcək.
            </p>
          </form>
        </section>

        <aside className="absence-info-card">
          <div className="absence-info-illustration">
            <div className="absence-info-orbit orbit-one" />
            <div className="absence-info-orbit orbit-two" />

            <div className="absence-info-calendar">
              <div className="absence-calendar-top" />
              <CalendarDays size={35} />
              <span>İŞ QRAFİKİ</span>
            </div>

            <div className="absence-floating-check">
              <CheckCircle size={22} />
            </div>

            <div className="absence-floating-clock">
              <Clock size={20} />
            </div>
          </div>

          <div className="absence-info-copy">
            <span className="absence-section-label">
              NECƏ İŞLƏYİR?
            </span>
            <h3>Sadə və şəffaf müraciət prosesi</h3>
            <p>
              Sorğunu göndərdikdən sonra qərarı şəxsi kabinetindən
              izləyə bilərsən.
            </p>
          </div>

          <div className="absence-steps">
            <div className="absence-step">
              <div className="absence-step-number">01</div>
              <div>
                <strong>Sorğunu doldur</strong>
                <p>Tarixi və səbəbi düzgün qeyd et.</p>
              </div>
            </div>

            <div className="absence-step">
              <div className="absence-step-number">02</div>
              <div>
                <strong>Şəkil əlavə et</strong>
                <p>Lazım gələrsə təsdiqləyici şəkil göndər.</p>
              </div>
            </div>

            <div className="absence-step">
              <div className="absence-step-number">03</div>
              <div>
                <strong>Qərarı izlə</strong>
                <p>Admin qeydi və müraciət statusunu yoxla.</p>
              </div>
            </div>
          </div>

          <div className="absence-info-notice">
            <ShieldCheck size={19} />
            <p>
              Təsdiqlənmiş sorğu həmin tarixdəki qəbul rezervlərinə
              təsir edə bilər.
            </p>
          </div>
        </aside>
      </div>

      <section className="absence-list-card">
        <div className="absence-list-heading">
          <div className="absence-list-title">
            <div className="absence-heading-icon small-icon">
              <ClipboardList size={20} />
            </div>

            <div>
              <h2>Mənim sorğularım</h2>
              <p>Göndərdiyin müraciətlərin tarixçəsi</p>
            </div>
          </div>

          <div className="absence-list-actions">
            <span className="absence-count">
              {requests.length} sorğu
            </span>

            <button
              className="absence-refresh small-refresh"
              onClick={loadRequests}
              type="button"
              disabled={loading}
            >
              <RefreshCw
                size={15}
                className={loading ? "absence-spin" : ""}
              />
              Yenilə
            </button>
          </div>
        </div>

        {loading ? (
          <div className="absence-empty-state">
            <div className="absence-loading-spinner" />
            <strong>Sorğular yüklənir</strong>
            <p>Müraciət tarixçən hazırlanır...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="absence-empty-state">
            <div className="absence-empty-icon">
              <ClipboardList size={28} />
            </div>
            <strong>Hələ sorğu göndərilməyib</strong>
            <p>İlk müraciətini yuxarıdakı formadan yarada bilərsən.</p>
          </div>
        ) : (
          <div className="absence-table-wrap">
            <table className="absence-table">
              <thead>
                <tr>
                  <th>TARİX</th>
                  <th>SƏBƏB VƏ QEYD</th>
                  <th>ŞƏKİL</th>
                  <th>STATUS</th>
                  <th>ADMİN QEYDİ</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => {
                  const status = getStatus(request.status);

                  return (
                    <tr key={request.id}>
                      <td>
                        <div className="absence-date-cell">
                          <CalendarDays size={16} />
                          <span>{formatDate(request.absenceDate)}</span>
                        </div>
                      </td>

                      <td>
                        <strong className="absence-reason-text">
                          {request.reason}
                        </strong>

                        {request.note && (
                          <small className="absence-table-note">
                            {request.note}
                          </small>
                        )}
                      </td>

                      <td>
                        {request.imageUrl ? (
                          <a
                            className="absence-view-image"
                            href={request.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Şəkli yeni pəncərədə aç"
                          >
                            <Eye size={15} />
                            Şəkilə bax
                          </a>
                        ) : (
                          <span className="absence-no-image">Əlavə edilməyib</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`absence-status ${status.className}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </td>

                      <td>
                        <span className="absence-admin-note">
                          {request.adminNote || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style>{`
        .absence-page {
          --absence-primary: #2563eb;
          --absence-primary-dark: #1949b7;
          --absence-ink: #172033;
          --absence-muted: #7b879b;
          --absence-border: #e7ecf3;
          padding: 26px 30px 38px;
          width: 100%;
          box-sizing: border-box;
          color: var(--absence-ink);
          background: #f7f9fc;
          min-height: 100%;
          font-family: inherit;
        }

        .absence-page * {
          box-sizing: border-box;
        }

        .absence-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 26px;
        }

        .absence-breadcrumb {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          font-size: 12px;
          color: #8994a7;
        }

        .absence-breadcrumb strong {
          color: #475569;
          font-weight: 650;
        }

        .absence-breadcrumb-separator {
          color: #c2cad6;
        }

        .absence-secure-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #287b58;
          background: #eaf7ef;
          padding: 8px 11px;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 650;
          white-space: nowrap;
        }

        .absence-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 22px;
          margin-bottom: 25px;
        }

        .absence-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #326be3;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
        }

        .absence-header h1 {
          font-size: clamp(24px, 2.6vw, 32px);
          line-height: 1.2;
          letter-spacing: -0.9px;
          margin: 0 0 10px;
          color: #15223a;
          font-weight: 800;
        }

        .absence-header p {
          color: #7b879b;
          margin: 0;
          max-width: 680px;
          font-size: 13px;
          line-height: 1.8;
        }

        .absence-refresh {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #e0e8f5;
          border-radius: 10px;
          padding: 11px 15px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          color: #2859bd;
          background: #fff;
          transition: background .2s, border-color .2s, transform .2s;
        }

        .absence-refresh:hover:not(:disabled) {
          background: #eef4ff;
          border-color: #b9cef7;
          transform: translateY(-1px);
        }

        .absence-refresh:disabled {
          opacity: .6;
          cursor: wait;
        }

        .absence-spin {
          animation: absence-spin 1s linear infinite;
        }

        @keyframes absence-spin {
          to { transform: rotate(360deg); }
        }

        .absence-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 24px;
        }

        .absence-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          background: #fff;
          border: 1px solid #e9edf4;
          border-radius: 14px;
          padding: 18px;
          box-shadow: 0 4px 15px rgba(24, 43, 78, .025);
        }

        .absence-stat-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 43px;
          height: 43px;
          border-radius: 12px;
        }

        .stat-blue {
          background: #eaf1ff;
          color: #3469df;
        }

        .stat-amber {
          background: #fff5df;
          color: #bd8215;
        }

        .stat-green {
          background: #e6f7ee;
          color: #168351;
        }

        .stat-red {
          background: #fff0ef;
          color: #d34d4d;
        }

        .absence-stat-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .absence-stat-info span {
          color: #778398;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .absence-stat-info strong {
          color: #17243b;
          font-size: 25px;
          font-weight: 800;
          line-height: 1.1;
        }

        .absence-stat-info small {
          color: #a0a9b8;
          font-size: 10px;
          margin-top: 6px;
          line-height: 1.4;
        }

        .absence-alert {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 13px 15px;
          border-radius: 11px;
          margin-bottom: 18px;
          font-size: 12px;
          line-height: 1.6;
        }

        .absence-alert > span {
          flex: 1;
        }

        .absence-alert button {
          display: grid;
          place-items: center;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          padding: 3px;
        }

        .absence-alert.error {
          color: #ad3434;
          background: #fff0ef;
          border: 1px solid #ffdedb;
        }

        .absence-alert.success {
          color: #147347;
          background: #eaf8ef;
          border: 1px solid #d2f0de;
        }

        .absence-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(250px, .85fr);
          align-items: start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .absence-form-card,
        .absence-list-card,
        .absence-info-card {
          min-width: 0;
          background: #fff;
          border: 1px solid #e8edf4;
          border-radius: 16px;
          box-shadow: 0 5px 24px rgba(23, 39, 69, .035);
        }

        .absence-form-card {
          padding: 25px;
        }

        .absence-card-heading {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 21px;
          border-bottom: 1px solid #edf0f5;
          margin-bottom: 23px;
        }

        .absence-heading-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          border-radius: 13px;
          background: linear-gradient(145deg, #eaf1ff, #f0f5ff);
          color: #3269df;
        }

        .absence-section-label {
          display: block;
          color: #4773cb;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 1.4px;
          margin-bottom: 5px;
        }

        .absence-card-heading h2,
        .absence-list-heading h2 {
          font-size: 18px;
          letter-spacing: -.35px;
          margin: 0 0 5px;
          color: #1a2740;
          font-weight: 800;
        }

        .absence-card-heading p,
        .absence-list-heading p {
          color: #8792a4;
          margin: 0;
          font-size: 12px;
          line-height: 1.6;
        }

        .absence-form {
          display: grid;
          gap: 20px;
        }

        .absence-field {
          display: flex;
          flex-direction: column;
          position: relative;
          gap: 8px;
          min-width: 0;
        }

        .absence-field > label {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px;
          font-size: 12px;
          font-weight: 750;
          color: #39465c;
        }

        .absence-field > label > span:first-child:not(.absence-optional) {
          color: #e04e4e;
        }

        .absence-optional {
          margin-left: 4px;
          color: #98a2b2;
          font-size: 10px;
          font-weight: 500;
        }

        .absence-field input:not([type="file"]):not([type="checkbox"]),
        .absence-field textarea {
          display: block;
          width: 100%;
          min-width: 0;
          border: 1px solid #dfe5ee;
          border-radius: 10px;
          background: #fff;
          padding: 12px 13px;
          color: #26334a;
          font-family: inherit;
          font-size: 12px;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }

        .absence-field input:focus,
        .absence-field textarea:focus {
          border-color: #77a0f4;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, .08);
        }

        .absence-field input::placeholder,
        .absence-field textarea::placeholder {
          color: #a7b0bf;
        }

        .absence-input-wrap {
          position: relative;
        }

        .absence-input-wrap > svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #8090a8;
          pointer-events: none;
        }

        .absence-input-wrap input {
          padding-left: 40px !important;
        }

        .absence-field small {
          font-size: 10px;
          line-height: 1.6;
          color: #929daf;
        }

        .absence-field textarea {
          resize: vertical;
          min-height: 95px;
          line-height: 1.7;
        }

        .absence-character-count {
          text-align: right;
          color: #a2abba;
          font-size: 10px;
          margin-top: -3px;
        }

        .absence-upload-zone {
          display: flex;
          align-items: center;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 175px;
          padding: 20px;
          border: 1px dashed #b8c9e8;
          border-radius: 13px;
          background: linear-gradient(135deg, #f9fbff, #f5f8ff);
          cursor: pointer;
          text-align: center;
          transition: background .2s, border-color .2s, transform .2s;
        }

        .absence-upload-zone:hover {
          background: #eff5ff;
          border-color: #6893ed;
          transform: translateY(-1px);
        }

        .absence-upload-icon {
          display: grid;
          place-items: center;
          width: 47px;
          height: 47px;
          border-radius: 14px;
          background: #e5eeff;
          color: #356bdf;
          margin-bottom: 3px;
        }

        .absence-upload-zone strong {
          color: #34435d;
          font-size: 12px;
          font-weight: 750;
        }

        .absence-upload-zone > span {
          color: #8995a8;
          font-size: 10px;
        }

        .absence-upload-zone .absence-upload-limit {
          color: #a0aabc;
          font-size: 9px;
        }

        .absence-image-preview {
          position: relative;
          overflow: hidden;
          border-radius: 13px;
          border: 1px solid #e2e8f2;
          background: #f6f8fc;
        }

        .absence-image-preview > img {
          display: block;
          width: 100%;
          max-height: 270px;
          object-fit: contain;
          background: #f5f7fb;
        }

        .absence-image-overlay {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 12px;
          background: #fff;
          border-top: 1px solid #e9edf4;
        }

        .absence-image-file {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          color: #607087;
          font-size: 11px;
        }

        .absence-image-file svg {
          flex-shrink: 0;
          color: #356bdf;
        }

        .absence-image-file span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .absence-remove-image {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          border: 1px solid #f4d8d8;
          border-radius: 8px;
          color: #c84646;
          background: #fff5f5;
          cursor: pointer;
        }

        .absence-remove-image:hover {
          background: #ffe8e8;
        }

        .absence-change-image {
          display: block;
          padding: 10px 12px;
          text-align: center;
          color: #3269df !important;
          background: #fff;
          font-size: 11px !important;
          font-weight: 750 !important;
          cursor: pointer;
          border-top: 1px solid #edf0f5;
        }

        .absence-change-image:hover {
          background: #f4f7ff;
        }

        .absence-form-divider {
          height: 1px;
          background: #edf0f5;
          margin: 0;
        }

        .absence-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          min-height: 46px;
          padding: 12px 18px;
          color: #fff;
          border: 0;
          border-radius: 10px;
          background: linear-gradient(115deg, #326fe8, #2557ce);
          box-shadow: 0 6px 15px rgba(43, 97, 217, .18);
          font-family: inherit;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition: transform .2s, box-shadow .2s, opacity .2s;
        }

        .absence-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 9px 20px rgba(43, 97, 217, .24);
        }

        .absence-submit:disabled {
          opacity: .65;
          cursor: wait;
        }

        .absence-button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, .4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: absence-spin .7s linear infinite;
        }

        .absence-form-footnote {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          margin: -7px 0 0;
          color: #8a96a9;
          font-size: 10px;
          line-height: 1.6;
          text-align: center;
        }

        .absence-form-footnote svg {
          color: #47966f;
          flex-shrink: 0;
        }

        .absence-info-card {
          overflow: hidden;
          padding: 0 20px 20px;
        }

        .absence-info-illustration {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 215px;
          margin: 0 -20px 18px;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 42%, rgba(255,255,255,.98), rgba(235,242,255,.8) 44%, transparent 73%),
            linear-gradient(140deg, #eaf1ff, #f5f8ff);
        }

        .absence-info-orbit {
          position: absolute;
          width: 170px;
          height: 170px;
          border: 1px solid rgba(68, 112, 204, .12);
          border-radius: 50%;
        }

        .orbit-one {
          width: 205px;
          height: 205px;
        }

        .orbit-two {
          width: 145px;
          height: 145px;
          border-style: dashed;
        }

        .absence-info-calendar {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          flex-direction: column;
          justify-content: center;
          gap: 10px;
          width: 112px;
          height: 125px;
          border: 1px solid #e1e9f8;
          border-radius: 16px;
          color: #3c70dc;
          background: #fff;
          box-shadow: 0 15px 32px rgba(53, 89, 162, .14);
        }

        .absence-calendar-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 12px;
          border-radius: 15px 15px 0 0;
          background: linear-gradient(90deg, #326ee4, #6395f4);
        }

        .absence-info-calendar span {
          font-size: 9px;
          letter-spacing: 1px;
          font-weight: 850;
          color: #6b7b98;
        }

        .absence-floating-check,
        .absence-floating-clock {
          position: absolute;
          z-index: 2;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 8px 20px rgba(48, 73, 120, .12);
        }

        .absence-floating-check {
          width: 43px;
          height: 43px;
          top: 37px;
          right: calc(50% - 90px);
          color: #21a269;
        }

        .absence-floating-clock {
          width: 39px;
          height: 39px;
          left: calc(50% - 89px);
          bottom: 38px;
          color: #d99a26;
        }

        .absence-info-copy {
          padding-bottom: 19px;
          border-bottom: 1px solid #edf0f5;
        }

        .absence-info-copy h3 {
          margin: 7px 0 9px;
          color: #1a2942;
          font-size: 19px;
          line-height: 1.4;
          letter-spacing: -.4px;
          font-weight: 800;
        }

        .absence-info-copy > p {
          color: #7e8a9e;
          margin: 0;
          font-size: 11px;
          line-height: 1.9;
        }

        .absence-steps {
          display: grid;
          gap: 20px;
          padding: 21px 0;
        }

        .absence-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .absence-step-number {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border: 1px solid #e1e9fb;
          border-radius: 10px;
          background: #f2f6ff;
          color: #356bdf;
          font-size: 10px;
          font-weight: 850;
        }

        .absence-step strong {
          display: block;
          margin: 2px 0 5px;
          color: #35425a;
          font-size: 11px;
          font-weight: 750;
        }

        .absence-step p {
          color: #8a95a8;
          font-size: 10px;
          line-height: 1.7;
          margin: 0;
        }

        .absence-info-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 13px;
          border-radius: 11px;
          background: #f3f7ff;
          border: 1px solid #e7efff;
          color: #5171ac;
        }

        .absence-info-notice svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .absence-info-notice p {
          margin: 0;
          font-size: 10px;
          line-height: 1.8;
        }

        .absence-list-card {
          padding: 23px;
          overflow: hidden;
        }

        .absence-list-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 22px;
        }

        .absence-list-title {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .absence-heading-icon.small-icon {
          width: 41px;
          height: 41px;
          border-radius: 11px;
        }

        .absence-list-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .absence-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 30px;
          padding: 0 11px;
          border: 1px solid #e0e9fc;
          border-radius: 9px;
          background: #f0f5ff;
          color: #3264ca;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .small-refresh {
          padding: 9px 11px;
          font-size: 10px;
        }

        .absence-table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e9edf4;
          border-radius: 11px;
        }

        .absence-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
          min-width: 760px;
        }

        .absence-table th {
          background: #f8faff;
          color: #7e8ba0;
          font-size: 9px;
          letter-spacing: .6px;
          font-weight: 850;
          padding: 14px 15px;
          white-space: nowrap;
          border-bottom: 1px solid #e9edf4;
        }

        .absence-table td {
          padding: 16px 15px;
          border-bottom: 1px solid #edf0f5;
          color: #59667c;
          font-size: 11px;
          vertical-align: middle;
          line-height: 1.7;
        }

        .absence-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .absence-table tbody tr {
          transition: background .15s;
        }

        .absence-table tbody tr:hover {
          background: #fafcff;
        }

        .absence-date-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #465570;
          white-space: nowrap;
        }

        .absence-date-cell svg {
          color: #7190cf;
          flex-shrink: 0;
        }

        .absence-reason-text {
          display: block;
          color: #344158;
          font-size: 11px;
          font-weight: 750;
          overflow-wrap: anywhere;
        }

        .absence-table-note {
          display: block;
          color: #8995a7;
          font-size: 10px;
          margin-top: 5px;
          max-width: 230px;
          overflow-wrap: anywhere;
        }

        .absence-view-image {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 7px 9px;
          border-radius: 8px;
          background: #edf4ff;
          color: #3265ce;
          text-decoration: none;
          white-space: nowrap;
          font-size: 10px;
          font-weight: 750;
        }

        .absence-view-image:hover {
          background: #dfeaff;
        }

        .absence-no-image {
          color: #a1aaba;
          font-size: 10px;
          white-space: nowrap;
        }

        .absence-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 7px 9px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .absence-status.approved {
          color: #16804f;
          background: #e8f8ef;
        }

        .absence-status.rejected {
          color: #bf3f3f;
          background: #fff0ef;
        }

        .absence-status.pending {
          color: #a46e0b;
          background: #fff6df;
        }

        .absence-admin-note {
          display: block;
          min-width: 90px;
          max-width: 190px;
          overflow-wrap: anywhere;
          color: #68758b;
        }

        .absence-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 46px 20px;
          text-align: center;
        }

        .absence-empty-icon {
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          margin-bottom: 15px;
          border-radius: 17px;
          color: #7092d9;
          background: #eef4ff;
        }

        .absence-empty-state > strong {
          color: #334158;
          font-size: 13px;
          margin-bottom: 7px;
        }

        .absence-empty-state > p {
          color: #8a96a9;
          font-size: 11px;
          line-height: 1.7;
          margin: 0;
        }

        .absence-loading-spinner {
          width: 27px;
          height: 27px;
          margin-bottom: 14px;
          border: 3px solid #e4ebf8;
          border-top-color: #3971e4;
          border-radius: 50%;
          animation: absence-spin .8s linear infinite;
        }

        @media (max-width: 1200px) {
          .absence-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .absence-main-grid {
            grid-template-columns: minmax(0, 1.4fr) minmax(230px, .8fr);
          }

          .absence-page {
            padding: 22px;
          }
        }

        @media (max-width: 900px) {
          .absence-main-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .absence-info-card {
            display: grid;
            grid-template-columns: minmax(0, .8fr) minmax(0, 1fr);
            column-gap: 20px;
            align-items: start;
          }

          .absence-info-illustration {
            grid-row: span 2;
            min-height: 250px;
            margin-bottom: 0;
          }

          .absence-info-copy {
            padding-top: 18px;
          }

          .absence-steps {
            gap: 14px;
          }

          .absence-info-notice {
            grid-column: 1 / -1;
            margin-top: 18px;
          }
        }

        @media (max-width: 600px) {
          .absence-page {
            padding: 15px 12px 28px;
          }

          .absence-topbar {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 22px;
          }

          .absence-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 15px;
          }

          .absence-header h1 {
            font-size: 25px;
          }

          .absence-header p {
            font-size: 12px;
          }

          .absence-refresh {
            padding: 10px 12px;
          }

          .absence-stats {
            gap: 9px;
          }

          .absence-stat-card {
            gap: 10px;
            padding: 12px 10px;
            border-radius: 12px;
          }

          .absence-stat-icon {
            width: 35px;
            height: 35px;
            border-radius: 10px;
          }

          .absence-stat-icon svg {
            width: 18px;
            height: 18px;
          }

          .absence-stat-info span {
            font-size: 10px;
          }

          .absence-stat-info strong {
            font-size: 22px;
          }

          .absence-stat-info small {
            font-size: 9px;
          }

          .absence-form-card,
          .absence-list-card {
            padding: 16px;
            border-radius: 13px;
          }

          .absence-card-heading {
            gap: 11px;
          }

          .absence-card-heading h2,
          .absence-list-heading h2 {
            font-size: 16px;
          }

          .absence-info-card {
            display: block;
            padding: 0 16px 16px;
          }

          .absence-info-illustration {
            margin-left: -16px;
            margin-right: -16px;
          }

          .absence-info-copy {
            padding-top: 0;
          }

          .absence-info-notice {
            margin-top: 0;
          }

          .absence-list-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .absence-list-actions {
            width: 100%;
            justify-content: space-between;
          }

          .absence-form {
            gap: 18px;
          }

          .absence-upload-zone {
            min-height: 155px;
          }

          .absence-table {
            min-width: 720px;
          }
        }
      `}</style>
    </div>
  );
}