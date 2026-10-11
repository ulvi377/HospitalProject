import { useEffect, useState } from "react";
import { FileText, Pill, CalendarDays, UserRound, RefreshCw } from "lucide-react";
import patientService from "../../services/patientService";
import prescriptionService from "../../services/prescriptionService";

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const profileResponse = await patientService.getAll();
        const profileData = profileResponse?.data ?? profileResponse;
        const profile = Array.isArray(profileData)
          ? profileData[0]
          : profileData?.items?.[0] || profileData;

        if (!profile?.id) {
          if (active) setPrescriptions([]);
          return;
        }

        const response = await prescriptionService.getByPatient(profile.id);
        const data = response?.data ?? response;

        if (active) {
          setPrescriptions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.message ||
              "Reseptləri yükləmək mümkün olmadı."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const formatDate = (value) => {
    if (!value) return "Tarix göstərilməyib";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Tarix göstərilməyib"
      : date.toLocaleDateString("az-AZ", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", color: "#172b4d" }}>
      <style>{`
        .prescription-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        @media(max-width:700px) {
          .prescription-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, marginBottom: 25 }}>
        <div>
          <p style={{ color: "#1769e0", fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>MÜALİCƏ MƏLUMATLARI</p>
          <h1 style={{ fontSize: 28, margin: "8px 0", fontWeight: 800 }}>Reseptlərim</h1>
          <p style={{ color: "#8491a7", fontSize: 14 }}>Həkimin yazdığı dərman və istifadə qaydaları.</p>
        </div>

        <button onClick={() => window.location.reload()} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 12px", border: "1px solid #e1e8f2", borderRadius: 9, background: "#fff", color: "#526783", cursor: "pointer" }}>
          <RefreshCw size={15} /> Yenilə
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, background: "#fff", border: "1px solid #e8edf5", borderRadius: 14, padding: "17px 21px" }}>
          <div style={{ width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", background: "#eaf2ff", color: "#1769e0", borderRadius: 12 }}>
            <Pill size={21} />
          </div>
          <div>
            <span style={{ display: "block", color: "#8491a7", fontSize: 12 }}>Ümumi reseptlər</span>
            <strong style={{ display: "block", fontSize: 23, marginTop: 3 }}>{prescriptions.length}</strong>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 30, background: "#fff", borderRadius: 15, color: "#8491a7" }}>Reseptlər yüklənir...</div>
      ) : error ? (
        <div style={{ padding: 18, borderRadius: 12, background: "#fff1f2", color: "#be3545" }}>{error}</div>
      ) : prescriptions.length === 0 ? (
        <div style={{ padding: "45px 20px", textAlign: "center", background: "#fff", border: "1px solid #e8edf5", borderRadius: 16 }}>
          <FileText size={38} color="#9aabc3" />
          <h3 style={{ margin: "14px 0 7px" }}>Hələ resept yoxdur</h3>
          <p style={{ color: "#8491a7", fontSize: 13 }}>Həkimin resept yazdıqda məlumatlar burada görünəcək.</p>
        </div>
      ) : (
        <div className="prescription-grid">
          {prescriptions.map((item) => (
            <article key={item.id} style={{ padding: 22, background: "#fff", border: "1px solid #e8edf5", borderRadius: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 13, marginBottom: 18 }}>
                <div style={{ width: 45, height: 45, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 13, background: "#eaf2ff", color: "#1769e0" }}>
                  <Pill size={22} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: 17, margin: "2px 0 6px", overflowWrap: "anywhere" }}>{item.medicationName || "Dərman adı göstərilməyib"}</h3>
                  <span style={{ color: "#1769e0", fontSize: 12, fontWeight: 700 }}>{item.dosage || "Doza göstərilməyib"}</span>
                </div>
              </div>

              <div style={{ padding: 14, background: "#f7f9fc", borderRadius: 11, marginBottom: 15 }}>
                <span style={{ display: "block", color: "#8491a7", fontSize: 11, marginBottom: 6 }}>İstifadə qaydası</span>
                <p style={{ margin: 0, color: "#344b6b", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {item.instructions || "İstifadə qaydası qeyd edilməyib."}
                </p>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, color: "#8491a7", fontSize: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <UserRound size={15} /> {item.doctor?.fullName || "Həkim"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CalendarDays size={15} /> {formatDate(item.prescriptionDate)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
