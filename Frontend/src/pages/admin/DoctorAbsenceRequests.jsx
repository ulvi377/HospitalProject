import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Mail,
  AlertTriangle,
  CalendarX,
  Users
} from "lucide-react";

export default function DoctorAbsenceRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const params = filter === "All" ? {} : { status: filter };
      const response = await api.get("/DoctorAbsenceRequests", { params });

      setRequests(response.data);
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
  }, [filter]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("az-AZ") : "—";

  const formatDateTime = (date) =>
    date ? new Date(date).toLocaleString("az-AZ") : "—";

  const reviewRequest = async (request, status) => {
    const action = status === "Approved" ? "təsdiqləmək" : "rədd etmək";

    const confirmed = window.confirm(
      status === "Approved"
        ? `${request.doctorName} həkiminin ${formatDate(request.absenceDate)} tarixli məzuniyyətini təsdiqləmək istəyirsən? Həmin tarixdəki aktiv rezervlər avtomatik ləğv ediləcək.`
        : `${request.doctorName} həkiminin ${formatDate(request.absenceDate)} tarixli sorğusunu rədd etmək istəyirsən?`
    );

    if (!confirmed) return;

    setBusyId(request.id);
    setError("");
    setMessage(null);

    try {
      const response = await api.put(
        `/DoctorAbsenceRequests/${request.id}/review`,
        {
          status,
          adminNote: adminNotes[request.id] || ""
        }
      );

      const data = response.data;

      if (status === "Approved") {
        setMessage({
          title: "Məzuniyyət təsdiqləndi",
          text: data.message || "Məzuniyyət təsdiqləndi.",
          appointmentsCancelled: data.appointmentsCancelled ?? 0,
          patientEmailsSent: data.patientEmailsSent ?? 0,
          patientEmailsFailed: data.patientEmailsFailed ?? 0,
          doctorEmailSent: Boolean(data.doctorEmailSent),
          details: data.patientEmailErrors || []
        });
      } else {
        setMessage({
          title: "Sorğuya qərar verildi",
          text: data.message || "Sorğu rədd edildi.",
          appointmentsCancelled: 0,
          patientEmailsSent: 0,
          patientEmailsFailed: 0,
          doctorEmailSent: Boolean(data.doctorEmailSent),
          details: []
        });
      }

      await loadRequests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Sorğuya qərar verilərkən xəta baş verdi."
      );
    } finally {
      setBusyId(null);
    }
  };

  const statusInfo = (status) => {
    if (status === "Approved") {
      return {
        text: "Təsdiqlənib",
        cls: "approved",
        icon: <CheckCircle size={15} />
      };
    }

    if (status === "Rejected") {
      return {
        text: "Rədd edilib",
        cls: "rejected",
        icon: <XCircle size={15} />
      };
    }

    return {
      text: "Gözləyir",
      cls: "pending",
      icon: <Clock size={15} />
    };
  };

  const pendingCount = requests.filter(
    (r) => r.status === "Pending"
  ).length;

  const approvedCount = requests.filter(
    (r) => r.status === "Approved"
  ).length;

  return (
    <div className="admin-absence-page">
      <header className="admin-absence-header">
        <div>
          <span className="admin-absence-eyebrow">
            HOSPITAL MANAGEMENT
          </span>

          <h1>Həkimlərin məzuniyyət sorğuları</h1>

          <p>
            Məzuniyyət müraciətlərini idarə et, qərarları təsdiqlə
            və rezervlər barədə pasiyentləri məlumatlandır.
          </p>
        </div>

        <button
          className="admin-absence-refresh"
          onClick={loadRequests}
          type="button"
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "spinning" : ""} />
          Yenilə
        </button>
      </header>

      <section className="admin-absence-stats">
        <div className="admin-absence-stat">
          <div className="stat-icon blue">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Göstərilən sorğular</span>
            <strong>{requests.length}</strong>
          </div>
        </div>

        <div className="admin-absence-stat">
          <div className="stat-icon amber">
            <Clock size={21} />
          </div>
          <div>
            <span>Gözləyən sorğular</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="admin-absence-stat">
          <div className="stat-icon green">
            <CheckCircle size={21} />
          </div>
          <div>
            <span>Təsdiqlənən sorğular</span>
            <strong>{approvedCount}</strong>
          </div>
        </div>
      </section>

      <section className="admin-absence-card">
        <div className="admin-absence-toolbar">
          <div className="admin-absence-title">
            <div className="admin-absence-icon">
              <CalendarDays size={22} />
            </div>
            <div>
              <h2>Məzuniyyət müraciətləri</h2>
              <p>Sorğuları nəzərdən keçir və uyğun qərar ver.</p>
            </div>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Sorğuların statusu"
          >
            <option value="Pending">Gözləyənlər</option>
            <option value="Approved">Təsdiqlənənlər</option>
            <option value="Rejected">Rədd edilənlər</option>
            <option value="All">Hamısı</option>
          </select>
        </div>

        {error && (
          <div className="admin-absence-alert error" role="alert">
            <AlertTriangle size={19} />
            <div>
              <strong>Əməliyyat baş tutmadı</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {message && (
          <div className="admin-absence-alert notice" role="status">
            <div className="notice-icon">
              <CheckCircle size={22} />
            </div>

            <div className="notice-content">
              <strong>{message.title}</strong>
              <p>{message.text}</p>

              {message.appointmentsCancelled > 0 && (
                <div className="notice-metrics">
                  <div>
                    <CalendarX size={17} />
                    <span>
                      Ləğv edilən rezervlər:
                      <b>{message.appointmentsCancelled}</b>
                    </span>
                  </div>

                  <div>
                    <Mail size={17} />
                    <span>
                      Pasiyent email-ləri göndərildi:
                      <b>{message.patientEmailsSent}</b>
                    </span>
                  </div>

                  {message.patientEmailsFailed > 0 && (
                    <div className="notice-warning">
                      <AlertTriangle size={17} />
                      <span>
                        Göndərilməyən email-lər:
                        <b>{message.patientEmailsFailed}</b>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {message.doctorEmailSent && (
                <p className="notice-footnote">
                  <Mail size={14} />
                  Həkimə də email bildirişi göndərildi.
                </p>
              )}

              {message.patientEmailsFailed > 0 && (
                <div className="notice-email-errors">
                  {message.details.map((detail, index) => (
                    <p key={index}>{detail}</p>
                  ))}
                </div>
              )}
            </div>

            <button
              className="notice-close"
              type="button"
              onClick={() => setMessage(null)}
              aria-label="Bildirişi bağla"
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="admin-absence-empty">
            <RefreshCw size={24} className="spinning" />
            <p>Sorğular yüklənir...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="admin-absence-empty">
            <div className="empty-icon">
              <CalendarDays size={28} />
            </div>
            <strong>Sorğu tapılmadı</strong>
            <p>Seçilmiş status üzrə göstəriləcək müraciət yoxdur.</p>
          </div>
        ) : (
          <div className="admin-absence-list">
            {requests.map((request) => {
              const status = statusInfo(request.status);
              const isBusy = busyId === request.id;

              return (
                <article
                  className="admin-absence-request"
                  key={request.id}
                >
                  <div className="admin-absence-request-top">
                    <div className="admin-absence-doctor">
                      <div className="admin-absence-avatar">
                        {(request.doctorName || "H")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3>{request.doctorName || "Həkim"}</h3>
                        <p>
                          {request.doctorEmail ||
                            "E-poçt qeyd edilməyib"}
                        </p>
                      </div>
                    </div>

                    <span className={`admin-absence-status ${status.cls}`}>
                      {status.icon}
                      {status.text}
                    </span>
                  </div>

                  <div className="admin-absence-details">
                    <div>
                      <span>Məzuniyyət tarixi</span>
                      <strong>{formatDate(request.absenceDate)}</strong>
                    </div>

                    <div>
                      <span>Sorğunun göndərilmə tarixi</span>
                      <strong>{formatDateTime(request.createdAt)}</strong>
                    </div>
                  </div>

                  <div className="admin-absence-reason">
                    <span>Sorğunun səbəbi</span>
                    <p>{request.reason}</p>

                    {request.note && (
                      <>
                        <span>Həkimin əlavə qeydi</span>
                        <p>{request.note}</p>
                      </>
                    )}
                  </div>

                  {request.status === "Pending" ? (
                    <div className="admin-absence-review">
                      <label htmlFor={`admin-note-${request.id}`}>
                        Admin qeydi
                        <small> İstəyə bağlıdır</small>
                      </label>

                      <textarea
                        id={`admin-note-${request.id}`}
                        rows={2}
                        maxLength={2000}
                        value={adminNotes[request.id] || ""}
                        onChange={(e) =>
                          setAdminNotes((prev) => ({
                            ...prev,
                            [request.id]: e.target.value
                          }))
                        }
                        placeholder="Həkimə göndəriləcək əlavə qeyd..."
                      />

                      <div className="admin-absence-actions">
                        <button
                          className="admin-absence-approve"
                          disabled={isBusy}
                          onClick={() =>
                            reviewRequest(request, "Approved")
                          }
                          type="button"
                        >
                          {isBusy ? (
                            <RefreshCw size={17} className="spinning" />
                          ) : (
                            <CheckCircle size={17} />
                          )}
                          Təsdiqlə və rezervləri ləğv et
                        </button>

                        <button
                          className="admin-absence-reject"
                          disabled={isBusy}
                          onClick={() =>
                            reviewRequest(request, "Rejected")
                          }
                          type="button"
                        >
                          <XCircle size={17} />
                          Rədd et
                        </button>
                      </div>

                      <p className="admin-absence-hint">
                        <AlertTriangle size={15} />
                        Təsdiq zamanı həmin tarixdəki aktiv rezervlər
                        ləğv olunacaq və pasiyentlərə email göndəriləcək.
                      </p>
                    </div>
                  ) : (
                    <div className="admin-absence-final-note">
                      <strong>Admin qeydi:</strong>{" "}
                      {request.adminNote || "Qeyd yoxdur"}

                      {request.reviewedAt && (
                        <p>
                          Qərar tarixi: {formatDateTime(request.reviewedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <style>{`
        .admin-absence-page {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 28px;
          box-sizing: border-box;
          color: #17243b;
          background: #f7f9fc;
          min-height: 100%;
        }

        .admin-absence-page * {
          box-sizing: border-box;
        }

        .admin-absence-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 26px;
        }

        .admin-absence-eyebrow {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.8px;
          color: #3266d5;
        }

        .admin-absence-header h1 {
          margin: 9px 0;
          font-size: clamp(23px, 2.5vw, 31px);
          line-height: 1.25;
          font-weight: 800;
          letter-spacing: -.7px;
          color: #14213a;
        }

        .admin-absence-header p,
        .admin-absence-title p {
          margin: 0;
          color: #7b879b;
          font-size: 13px;
          line-height: 1.7;
        }

        .admin-absence-refresh {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          flex-shrink: 0;
          border: 1px solid #e0e8f5;
          border-radius: 11px;
          background: white;
          color: #275bc3;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 750;
          cursor: pointer;
          box-shadow: 0 3px 12px rgba(20, 33, 58, .035);
          transition: .2s ease;
        }

        .admin-absence-refresh:hover {
          background: #f0f5ff;
          border-color: #c8d8f5;
        }

        .admin-absence-refresh:disabled {
          opacity: .65;
          cursor: wait;
        }

        .admin-absence-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .admin-absence-stat {
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
          padding: 20px;
          background: #fff;
          border: 1px solid #e9edf4;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(23, 32, 51, .025);
        }

        .stat-icon {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          border-radius: 13px;
          display: grid;
          place-items: center;
        }

        .stat-icon.blue {
          color: #3266d5;
          background: #edf3ff;
        }

        .stat-icon.amber {
          color: #a76b00;
          background: #fff5d9;
        }

        .stat-icon.green {
          color: #14804a;
          background: #e8f8ef;
        }

        .admin-absence-stat span {
          display: block;
          color: #7b879b;
          font-size: 12px;
          margin-bottom: 7px;
        }

        .admin-absence-stat strong {
          color: #17243b;
          font-size: 25px;
          font-weight: 800;
        }

        .admin-absence-card {
          padding: 24px;
          background: #fff;
          border: 1px solid #e8edf4;
          border-radius: 17px;
          box-shadow: 0 6px 26px rgba(23, 32, 51, .035);
        }

        .admin-absence-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 22px;
        }

        .admin-absence-title {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .admin-absence-icon {
          display: grid;
          place-items: center;
          width: 47px;
          height: 47px;
          flex-shrink: 0;
          border-radius: 13px;
          background: #edf3ff;
          color: #3266d5;
        }

        .admin-absence-title h2 {
          margin: 0 0 5px;
          font-size: 18px;
          font-weight: 800;
          color: #17243b;
        }

        .admin-absence-toolbar select {
          min-width: 155px;
          max-width: 100%;
          padding: 11px 13px;
          border: 1px solid #dfe6ef;
          border-radius: 10px;
          background: white;
          color: #344258;
          font-size: 13px;
          outline: none;
        }

        .admin-absence-toolbar select:focus {
          border-color: #7095e7;
          box-shadow: 0 0 0 3px rgba(50, 102, 213, .09);
        }

        .admin-absence-list {
          display: grid;
          gap: 15px;
        }

        .admin-absence-request {
          min-width: 0;
          border: 1px solid #e7ecf3;
          border-radius: 14px;
          padding: 21px;
          transition: border-color .2s, box-shadow .2s;
        }

        .admin-absence-request:hover {
          border-color: #d6e0ef;
          box-shadow: 0 5px 17px rgba(23, 32, 51, .035);
        }

        .admin-absence-request-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
        }

        .admin-absence-doctor {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .admin-absence-avatar {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: linear-gradient(145deg, #edf3ff, #dfe9ff);
          color: #275bc3;
          font-weight: 850;
          font-size: 18px;
        }

        .admin-absence-doctor h3 {
          margin: 0 0 5px;
          font-size: 15px;
          font-weight: 800;
          color: #1b2941;
        }

        .admin-absence-doctor p {
          margin: 0;
          font-size: 12px;
          color: #7b879b;
          overflow-wrap: anywhere;
        }

        .admin-absence-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: 30px;
          padding: 8px 11px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .admin-absence-status.approved {
          background: #e9f8ef;
          color: #137647;
        }

        .admin-absence-status.rejected {
          background: #fff0ee;
          color: #b42318;
        }

        .admin-absence-status.pending {
          background: #fff6dc;
          color: #956700;
        }

        .admin-absence-details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin: 20px 0;
          padding: 15px;
          background: #f7f9fc;
          border: 1px solid #f0f2f6;
          border-radius: 11px;
        }

        .admin-absence-details span,
        .admin-absence-reason > span {
          display: block;
          color: #7b879b;
          font-size: 11px;
          font-weight: 650;
          margin-bottom: 7px;
        }

        .admin-absence-details strong {
          font-size: 13px;
          color: #24334b;
          overflow-wrap: anywhere;
        }

        .admin-absence-reason {
          margin-bottom: 18px;
        }

        .admin-absence-reason p {
          margin: 0 0 13px;
          font-size: 13px;
          line-height: 1.7;
          color: #344258;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .admin-absence-review {
          border-top: 1px solid #edf0f5;
          padding-top: 18px;
        }

        .admin-absence-review label {
          display: block;
          margin-bottom: 9px;
          color: #344258;
          font-size: 12px;
          font-weight: 800;
        }

        .admin-absence-review label small {
          color: #8b96a8;
          font-weight: 500;
        }

        .admin-absence-review textarea {
          display: block;
          width: 100%;
          border: 1px solid #dfe6ef;
          border-radius: 10px;
          padding: 12px 13px;
          resize: vertical;
          font: inherit;
          font-size: 13px;
          color: #24334b;
          outline: none;
          transition: .2s;
        }

        .admin-absence-review textarea:focus {
          border-color: #7095e7;
          box-shadow: 0 0 0 3px rgba(50, 102, 213, .08);
        }

        .admin-absence-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 13px;
        }

        .admin-absence-actions button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          border: 0;
          border-radius: 10px;
          padding: 12px 16px;
          color: white;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: .2s ease;
        }

        .admin-absence-actions button:disabled {
          opacity: .6;
          cursor: wait;
        }

        .admin-absence-approve {
          background: #176c47;
        }

        .admin-absence-approve:hover:not(:disabled) {
          background: #12583a;
          transform: translateY(-1px);
        }

        .admin-absence-reject {
          background: #fff;
          border: 1px solid #f0d8d6 !important;
          color: #b42318 !important;
        }

        .admin-absence-reject:hover:not(:disabled) {
          background: #fff5f4;
        }

        .admin-absence-hint {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          margin: 13px 0 0;
          color: #8791a1;
          font-size: 11px;
          line-height: 1.6;
        }

        .admin-absence-hint svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .admin-absence-final-note {
          border-top: 1px solid #edf0f5;
          padding-top: 14px;
          color: #536075;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .admin-absence-final-note p {
          margin-bottom: 0;
          color: #8791a1;
        }

        .admin-absence-alert {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px 16px;
          margin-bottom: 18px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.6;
        }

        .admin-absence-alert.error {
          color: #a52323;
          background: #fff0ee;
          border: 1px solid #f6d4d1;
        }

        .admin-absence-alert.error > svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .admin-absence-alert p {
          margin: 4px 0 0;
          overflow-wrap: anywhere;
        }

        .admin-absence-alert.notice {
          position: relative;
          color: #775000;
          background: #fff8df;
          border: 1px solid #f1d88b;
          box-shadow: 0 4px 15px rgba(166, 117, 0, .045);
          padding: 17px;
        }

        .notice-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #ffefb5;
          color: #956700;
        }

        .notice-content {
          min-width: 0;
          flex: 1;
          padding-right: 10px;
        }

        .notice-content > strong {
          display: block;
          font-size: 14px;
          color: #775000;
        }

        .notice-content > p {
          color: #86651c;
          font-size: 12px;
        }

        .notice-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 13px;
        }

        .notice-metrics > div {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 11px;
          border: 1px solid #f0dfad;
          border-radius: 9px;
          background: rgba(255,255,255,.58);
          color: #805c0d;
          font-size: 11px;
        }

        .notice-metrics svg {
          flex-shrink: 0;
        }

        .notice-metrics b {
          margin-left: 5px;
          font-size: 13px;
          color: #634400;
        }

        .notice-metrics .notice-warning {
          color: #9b3e19;
          border-color: #f3c4a5;
          background: #fff0e4;
        }

        .notice-metrics .notice-warning b {
          color: #8b3515;
        }

        .notice-footnote {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px !important;
          color: #6d6a40 !important;
        }

        .notice-email-errors {
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid #f0dfad;
        }

        .notice-email-errors p {
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        .notice-close {
          position: absolute;
          top: 9px;
          right: 11px;
          border: 0;
          background: transparent;
          color: #896b26;
          font-size: 23px;
          line-height: 1;
          cursor: pointer;
        }

        .admin-absence-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 210px;
          color: #8791a1;
          text-align: center;
        }

        .admin-absence-empty p {
          margin: 0;
          font-size: 13px;
        }

        .admin-absence-empty strong {
          color: #344258;
          font-size: 14px;
        }

        .empty-icon {
          width: 55px;
          height: 55px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          color: #3266d5;
          background: #edf3ff;
          margin-bottom: 4px;
        }

        .spinning {
          animation: absence-spin 1s linear infinite;
        }

        @keyframes absence-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 950px) {
          .admin-absence-page {
            padding: 20px;
          }

          .admin-absence-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-absence-stat:last-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 600px) {
          .admin-absence-page {
            padding: 14px;
          }

          .admin-absence-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .admin-absence-header h1 {
            font-size: 24px;
          }

          .admin-absence-stats {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .admin-absence-stat:last-child {
            grid-column: auto;
          }

          .admin-absence-stat {
            padding: 15px;
          }

          .admin-absence-card {
            padding: 15px;
          }

          .admin-absence-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .admin-absence-toolbar select {
            width: 100%;
          }

          .admin-absence-request {
            padding: 15px;
          }

          .admin-absence-request-top {
            flex-direction: column;
          }

          .admin-absence-details {
            grid-template-columns: 1fr;
          }

          .admin-absence-actions {
            flex-direction: column;
          }

          .admin-absence-actions button {
            width: 100%;
          }

          .notice-metrics {
            flex-direction: column;
          }

          .notice-metrics > div {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}