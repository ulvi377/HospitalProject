
import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  AlertCircle,
  Inbox,
  CheckCheck,
  Circle,
} from "lucide-react";

import notificationService from "../../services/notificationService";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await notificationService.getAll();

      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.notifications)
          ? response.notifications
          : Array.isArray(response?.$values)
            ? response.$values
            : Array.isArray(response?.notifications?.$values)
              ? response.notifications.$values
              : [];

      setNotifications(data);
    } catch (err) {
      console.error("Bildirişlər yüklənmədi:", err);

      setError(
        err.response?.status === 401
          ? "Sessiya bitib və ya daxil olmaq üçün icazən yoxdur. Yenidən daxil ol."
          : err.response?.status === 404
            ? "Pasiyent profili və ya bildiriş endpoint-i tapılmadı."
            : "Bildirişləri yükləmək mümkün olmadı. Bir daha yoxla."
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      setMarkingId(id);

      await notificationService.markAsRead(id);

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (err) {
      console.error("Bildiriş oxunmuş kimi qeyd edilmədi:", err);
      setError("Bildirişi oxunmuş kimi qeyd etmək mümkün olmadı.");
    } finally {
      setMarkingId(null);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      setMarkingAll(true);
      setError("");

      await notificationService.markAllAsRead();

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );
    } catch (err) {
      console.error("Bildirişlər yenilənmədi:", err);
      setError("Bildirişləri oxunmuş kimi qeyd etmək mümkün olmadı.");
    } finally {
      setMarkingAll(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Tarix göstərilməyib";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Tarix göstərilməyib";
    }

    return parsed.toLocaleString("az-AZ", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationStyle = (item) => {
    const type = String(item.type || "info").toLowerCase();
    const text = `${item.title || ""} ${item.message || ""}`.toLowerCase();

    if (
      type === "danger" ||
      type === "error" ||
      type === "warning" ||
      text.includes("ləğv") ||
      text.includes("legv")
    ) {
      return { type: "danger", Icon: XCircle, category: "danger" };
    }

    if (
      type === "success" ||
      text.includes("təsdiql") ||
      text.includes("tesdiql") ||
      text.includes("tamamlandı") ||
      text.includes("tamamlandi")
    ) {
      return { type: "success", Icon: CheckCircle2, category: "success" };
    }

    if (
      type === "pending" ||
      text.includes("gözləyir") ||
      text.includes("gozleyir")
    ) {
      return { type: "pending", Icon: Clock, category: "pending" };
    }

    return { type: "info", Icon: Bell, category: "info" };
  };

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
        ? notifications.filter((item) => !item.isRead)
        : notifications.filter(
            (item) => getNotificationStyle(item).category === filter
          );

  return (
    <div className="notifications-page">
      <style>{`
        .notifications-page {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 28px 30px 40px;
          box-sizing: border-box;
          color: #172033;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 26px;
        }

        .notifications-title {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .notifications-icon {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          color: #2563eb;
          background: #eff6ff;
          flex-shrink: 0;
        }

        .notifications-header h1 {
          margin: 0 0 7px;
          font-size: 28px;
          font-weight: 750;
          letter-spacing: -0.6px;
        }

        .notifications-header p {
          margin: 0;
          color: #718096;
          font-size: 14px;
        }

        .notifications-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .notifications-count {
          padding: 10px 15px;
          border: 1px solid #dbeafe;
          border-radius: 12px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .notifications-read-all {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 13px;
          border: 1px solid #dbeafe;
          border-radius: 10px;
          background: white;
          color: #2563eb;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .notifications-read-all:hover {
          background: #eff6ff;
        }

        .notifications-read-all:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .notifications-filters {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .notifications-filter {
          padding: 10px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: white;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .notifications-filter:hover {
          border-color: #93c5fd;
          color: #2563eb;
        }

        .notifications-filter.active {
          background: #2563eb;
          border-color: #2563eb;
          color: white;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 17px;
          padding: 21px 22px;
          border: 1px solid #e8edf5;
          border-radius: 15px;
          background: white;
          box-shadow: 0 4px 15px rgba(15, 23, 42, 0.025);
          transition: border-color 0.2s, transform 0.2s;
        }

        .notification-item:hover {
          border-color: #bfdbfe;
          transform: translateY(-1px);
        }

        .notification-item.unread {
          border-color: #bfdbfe;
          background: #fafdff;
        }

        .notification-status-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          flex-shrink: 0;
        }

        .notification-status-icon.success {
          background: #dcfce7;
          color: #15803d;
        }

        .notification-status-icon.pending {
          background: #fef3c7;
          color: #b45309;
        }

        .notification-status-icon.danger {
          background: #fee2e2;
          color: #b91c1c;
        }

        .notification-status-icon.info {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 7px;
        }

        .notification-heading {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .notification-top h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
        }

        .notification-unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2563eb;
          flex-shrink: 0;
        }

        .notification-description {
          margin: 0 0 13px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
        }

        .notification-meta {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
          color: #94a3b8;
          font-size: 12px;
        }

        .notification-doctor {
          color: #475569;
          font-weight: 600;
        }

        .notification-divider {
          color: #cbd5e1;
        }

        .notification-read-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 9px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .notification-read-button:hover {
          color: #2563eb;
          border-color: #bfdbfe;
        }

        .notification-read-button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .notification-read-label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #16a34a;
          font-size: 11px;
          white-space: nowrap;
        }

        .notifications-empty {
          padding: 60px 20px;
          text-align: center;
          border: 1px dashed #cbd5e1;
          border-radius: 16px;
          background: #f8fafc;
        }

        .notifications-empty-icon {
          width: 65px;
          height: 65px;
          margin: 0 auto 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          background: #eff6ff;
          color: #3b82f6;
        }

        .notifications-empty h3 {
          margin: 0 0 8px;
          color: #334155;
          font-size: 17px;
        }

        .notifications-empty p {
          margin: 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .notifications-retry {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 15px;
          padding: 10px 15px;
          border: 0;
          border-radius: 9px;
          background: #2563eb;
          color: white;
          cursor: pointer;
          font-weight: 600;
        }

        .notifications-loading {
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          color: #64748b;
        }

        .notifications-spinner {
          animation: notificationsSpin 1s linear infinite;
          color: #2563eb;
        }

        .notifications-error {
          padding: 18px;
          border: 1px solid #fecaca;
          border-radius: 12px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 14px;
        }

        @keyframes notificationsSpin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 700px) {
          .notifications-page {
            padding: 20px 14px 30px;
          }

          .notifications-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .notifications-header h1 {
            font-size: 24px;
          }

          .notifications-header-actions {
            width: 100%;
          }

          .notification-item {
            padding: 16px;
            gap: 12px;
          }

          .notification-status-icon {
            width: 39px;
            height: 39px;
          }

          .notification-top {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>

      <div className="notifications-header">
        <div className="notifications-title">
          <div className="notifications-icon">
            <Bell size={27} />
          </div>

          <div>
            <h1>Bildirişlər</h1>
            <p>Qəbul və görüşlərinlə bağlı məlumatlar.</p>
          </div>
        </div>

        <div className="notifications-header-actions">
          <div className="notifications-count">
            {unreadCount} oxunmamış
          </div>

          <button
            type="button"
            className="notifications-read-all"
            onClick={markAllAsRead}
            disabled={markingAll || unreadCount === 0 || loading}
          >
            <CheckCheck size={16} />
            {markingAll ? "Yenilənir..." : "Hamısını oxunmuş et"}
          </button>
        </div>
      </div>

      <div className="notifications-filters">
        {[
          { value: "all", label: "Hamısı" },
          { value: "unread", label: "Oxunmamış" },
          { value: "success", label: "Təsdiqlənmiş" },
          { value: "pending", label: "Gözləyən" },
          { value: "danger", label: "Ləğv edilən" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            className={
              filter === item.value
                ? "notifications-filter active"
                : "notifications-filter"
            }
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="notifications-error" style={{ marginBottom: 18 }}>
          <AlertCircle size={18} style={{ verticalAlign: "middle" }} />{" "}
          {error}
          <br />
          <button
            type="button"
            className="notifications-retry"
            onClick={loadNotifications}
          >
            <RefreshCw size={16} />
            Yenidən yoxla
          </button>
        </div>
      )}

      {loading ? (
        <div className="notifications-loading">
          <RefreshCw size={30} className="notifications-spinner" />
          <span>Bildirişlər yüklənir...</span>
        </div>
      ) : !error && filteredNotifications.length === 0 ? (
        <div className="notifications-empty">
          <div className="notifications-empty-icon">
            <Inbox size={30} />
          </div>
          <h3>Bildiriş yoxdur</h3>
          <p>
            {filter === "unread"
              ? "Oxunmamış bildirişiniz yoxdur."
              : "Bu bölmədə göstəriləcək bildiriş tapılmadı."}
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((item) => {
            const { type, Icon } = getNotificationStyle(item);

            return (
              <div
                className={`notification-item ${!item.isRead ? "unread" : ""}`}
                key={item.id}
              >
                <div className={`notification-status-icon ${type}`}>
                  <Icon size={22} />
                </div>

                <div className="notification-content">
                  <div className="notification-top">
                    <div className="notification-heading">
                      {!item.isRead && (
                        <span className="notification-unread-dot" />
                      )}
                      <h3>{item.title || "Yeni bildiriş"}</h3>
                    </div>

                    {item.isRead ? (
                      <span className="notification-read-label">
                        <CheckCircle2 size={14} />
                        Oxunub
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="notification-read-button"
                        disabled={markingId === item.id}
                        onClick={() => markAsRead(item.id)}
                      >
                        {markingId === item.id ? (
                          <RefreshCw size={13} />
                        ) : (
                          <Circle size={13} />
                        )}
                        Oxunmuş et
                      </button>
                    )}
                  </div>

                  <p className="notification-description">
                    {item.message || "Bildiriş məlumatı mövcud deyil."}
                  </p>

                  <div className="notification-meta">
                    <CalendarDays size={14} />
                    <span>{formatDate(item.createdAt)}</span>
                    {item.appointmentId != null && (
                      <>
                        <span className="notification-divider">•</span>
                        <span>Qəbul №{item.appointmentId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
