import { useEffect, useState } from "react";
import { Activity, CalendarDays, Clock, Stethoscope, FileText, RefreshCw, History, AlertCircle } from "lucide-react";
import appointmentService from "../../services/appointmentService";

export default function MedicalHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      // Backend pasiyent rolunda yalnız öz qəbul məlumatlarını qaytarmalıdır.
      const response = await appointmentService.getAll();
      const data = response?.data ?? response;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.$values)
            ? data.$values
            : [];

      setRecords(
        [...list].sort(
          (a, b) =>
            new Date(b.appointmentDate || 0) -
            new Date(a.appointmentDate || 0)
        )
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Tibbi tarixçəni yükləmək mümkün olmadı."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const formatDate = (value) => {
    if (!value) return "Tarix qeyd edilməyib";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Tarix qeyd edilməyib"
      : date.toLocaleString("az-AZ", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const getStatus = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "completed")
      return { label: "Tamamlanıb", color: "#16804a", bg: "#ecfdf3" };
    if (value === "confirmed")
      return { label: "Təsdiqlənib", color: "#1769e0", bg: "#edf4ff" };
    if (value === "cancelled")
      return { label: "Ləğv edilib", color: "#be3545", bg: "#fff1f2" };

    return { label: status || "Gözləyir", color: "#a16207", bg: "#fff8e7" };
  };

  const filteredRecords = records.filter((item) => {
    if (filter === "all") return true;
    return String(item.status || "").toLowerCase() === filter;
  });

  const completedCount = records.filter(
    (item) => String(item.status || "").toLowerCase() === "completed"
  ).length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", color: "#172b4d" }}>
      <style>{`
        .history-list { display: grid; gap: 13px; }
        .history-card {
          display: flex; align-items: flex-start; gap: 15px;
          padding: 21px; background: #fff;
          border: 1px solid #e8edf5; border-radius: 15px;
        }
        .history-filter {
          border: 1px solid #e0e7f1; background: #fff; color: #526783;
          padding: 9px 13px; border-radius: 9px; font-size: 12px;
          font-weight: 700; cursor: pointer;
        }
        .history-filter.active {
          color: #1769e0; background: #edf4ff; border-color: #cfe0ff;
        }
        @media(max-width:600px) {
          .history-card { padding: 15px; gap: 10px; }
          .history-heading { font-size: 24px !important; }
        }
      `}</style>

      <div style={{ marginBottom: 25 }}>
        <p style={{ color: "#1769e0", fontSize: 11, fontWeight: 800, letterSpacing: 1.5, marginBottom: 8 }}>
          SAĞLAMLIQ MƏLUMATLARI
        </p>
        <h1 className="history-heading" style={{ fontSize: 28, margin: 0, fontWeight: 800 }}>
          Tibbi tarixçə
        </h1>
        <p style={{ color: "#8491a7", fontSize: 14, marginTop: 9 }}>
          Qəbul tarixlərini və əvvəlki müraciətlərinin vəziyyətini izlə.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Ümumi müraciətlər", value: records.length, icon: <History size={21} />, color: "#1769e0", bg: "#edf4ff" },
          { label: "Tamamlanan qəbullar", value: completedCount, icon: <CheckIcon />, color: "#16804a", bg: "#ecfdf3" },
          { label: "Gözləyən müraciətlər", value: records.filter((item) => ["pending", "confirmed"].includes(String(item.status || "").toLowerCase())).length, icon: <Clock size={21} />, color: "#a16207", bg: "#fff8e7" },
        ].map((stat) => (
          <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 13, background: "#fff", border: "1px solid #e8edf5", borderRadius: 14, padding: 18 }}>
            <div style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, color: stat.color, background: stat.bg, flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#8491a7" }}>{stat.label}</div>
              <strong style={{ fontSize: 23, display: "block", marginTop: 3 }}>{stat.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 17 }}>
        <strong style={{ fontSize: 15, marginRight: 5 }}>Qəbul qeydləri</strong>
        <button className={`history-filter ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Hamısı</button>
        <button className={`history-filter ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}>Tamamlanan</button>
        <button className={`history-filter ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>Gözləyən</button>
        <button className="history-filter" onClick={loadHistory} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7 }}>
          <RefreshCw size={14} /> Yenilə
        </button>
      </div>

      {loading ? (
        <div style={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: 15, padding: 30, color: "#8491a7" }}>
          Tibbi məlumatlar yüklənir...
        </div>
      ) : error ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff1f2", color: "#be3545", padding: 18, borderRadius: 12 }}>
          <AlertCircle size={19} /> {error}
        </div>
      ) : filteredRecords.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: 16, padding: "45px 20px", textAlign: "center" }}>
          <FileText size={38} color="#9aabc3" />
          <h3 style={{ margin: "14px 0 7px" }}>Qeyd tapılmadı</h3>
          <p style={{ color: "#8491a7", fontSize: 13 }}>
            Seçilmiş filtr üzrə qəbul məlumatı yoxdur.
          </p>
        </div>
      ) : (
        <div className="history-list">
          {filteredRecords.map((item) => {
            const status = getStatus(item.status);

            return (
              <article className="history-card" key={item.id}>
                <div style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#edf4ff", color: "#1769e0" }}>
                  <Stethoscope size={22} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 9 }}>
                    <h3 style={{ fontSize: 15, margin: 0 }}>
                      {item.doctor?.fullName || "Həkim"}
                    </h3>
                    <span style={{ fontSize: 11, fontWeight: 750, padding: "6px 9px", borderRadius: 7, background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </div>

                  <p style={{ color: "#71819b", fontSize: 12, margin: "8px 0 12px" }}>
                    {item.doctor?.specialty?.name || item.doctor?.specialty || "İxtisas göstərilməyib"}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 7, color: "#8491a7", fontSize: 12 }}>
                    <CalendarDays size={15} />
                    {formatDate(item.appointmentDate)}
                  </div>

                  {item.notes && (
                    <div style={{ marginTop: 13, padding: 12, borderRadius: 9, background: "#f7f9fc", color: "#526783", fontSize: 12, lineHeight: 1.7 }}>
                      <strong>Qeyd:</strong> {item.notes}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p style={{ color: "#9aa6b8", fontSize: 11, marginTop: 20, lineHeight: 1.7 }}>
        Qeyd: Bu səhifə hazırda qəbul tarixçəsini göstərir. Analiz nəticələri, diaqnozlar və müayinə qeydləri ayrıca backend tibbi tarixçə endpoint-i olduqda əlavə edilə bilər.
      </p>
    </div>
  );
}

function CheckIcon() {
  return <Activity size={21} />;
}
