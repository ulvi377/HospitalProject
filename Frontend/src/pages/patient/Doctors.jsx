import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Stethoscope,
  UserRound,
  CalendarDays,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import doctorService from "../../services/doctorService";

export default function Doctors() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = searchParams.get("search") || "";
  const specialty = searchParams.get("specialty") || "";

  useEffect(() => {
    let active = true;

    async function loadDoctors() {
      try {
        setLoading(true);
        setError("");

        const response = await doctorService.getAll();
        const data = response?.data ?? response;

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.$values)
              ? data.$values
              : [];

        if (active) setDoctors(list);
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.message ||
              "Həkim siyahısını yükləmək mümkün olmadı."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDoctors();

    return () => {
      active = false;
    };
  }, []);

  const specialties = useMemo(() => {
    return [
      ...new Set(
        doctors
          .map((doctor) => doctor.specialty?.name || doctor.specialty)
          .filter((value) => typeof value === "string" && value.trim())
      ),
    ].sort((a, b) => a.localeCompare(b, "az"));
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("az");

    return doctors.filter((doctor) => {
      const doctorSpecialty =
        doctor.specialty?.name || doctor.specialty || "";

      const matchesSearch =
        !term ||
        `${doctor.fullName || ""} ${doctorSpecialty} ${
          doctor.description || ""
        }`
          .toLocaleLowerCase("az")
          .includes(term);

      const matchesSpecialty =
        !specialty || doctorSpecialty === specialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, search, specialty]);

  function updateQuery(key, value) {
    const next = new URLSearchParams(searchParams);

    if (value.trim()) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setSearchParams(next, { replace: true });
  }

  function getInitials(name) {
    return (name || "H")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div style={{ maxWidth: 1250, margin: "0 auto", color: "#172b4d" }}>
      <style>{`
        .patient-doctor-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .patient-doctor-card {
          min-width: 0;
          background: #fff;
          border: 1px solid #e8edf5;
          border-radius: 17px;
          padding: 22px;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .patient-doctor-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px #243f6810;
        }
        .patient-doctor-action {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          border: 0;
          border-radius: 10px;
          background: #1769e0;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .patient-doctor-action:hover { background: #1254b8; }
        .patient-doctor-filter {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          height: 45px;
          padding: 0 13px;
          border: 1px solid #e0e7f1;
          border-radius: 10px;
          outline: none;
          color: #243957;
          background: #fff;
          font-size: 13px;
        }
        .patient-doctor-filter:focus {
          border-color: #1769e0;
          box-shadow: 0 0 0 3px #1769e015;
        }
        @media (max-width: 1050px) {
          .patient-doctor-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 600px) {
          .patient-doctor-grid { grid-template-columns: 1fr; }
          .patient-doctor-card { padding: 18px; }
        }
      `}</style>

      <div style={{ marginBottom: 25 }}>
        <p
          style={{
            color: "#1769e0",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.5,
            margin: "0 0 8px",
          }}
        >
          HƏKİM HEYƏTİ
        </p>

        <h1 style={{ fontSize: 28, margin: 0, fontWeight: 800 }}>
          Həkimlər
        </h1>

        <p style={{ color: "#8491a7", fontSize: 14, marginTop: 9 }}>
          İxtisasına uyğun həkimi tap və qəbul üçün müraciət et.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(190px, 240px)",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <div style={{ position: "relative" }}>
          <Search
            size={18}
            color="#8b9ab0"
            style={{
              position: "absolute",
              left: 14,
              top: 13,
              pointerEvents: "none",
            }}
          />

          <input
            className="patient-doctor-filter"
            style={{ paddingLeft: 42 }}
            placeholder="Həkim adı və ya ixtisas axtar..."
            value={search}
            onChange={(event) => updateQuery("search", event.target.value)}
          />
        </div>

        <select
          className="patient-doctor-filter"
          value={specialty}
          onChange={(event) => updateQuery("specialty", event.target.value)}
        >
          <option value="">Bütün ixtisaslar</option>
          {specialties.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 13, color: "#71819b" }}>
          {loading ? "Həkimlər yüklənir..." : `${filteredDoctors.length} həkim`}
        </span>

        <button
          onClick={() => window.location.reload()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 12px",
            border: "1px solid #e1e8f2",
            borderRadius: 9,
            background: "#fff",
            color: "#526783",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={15} />
          Yenilə
        </button>
      </div>

      {loading ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8edf5",
            borderRadius: 16,
            padding: 35,
            textAlign: "center",
            color: "#8491a7",
          }}
        >
          Həkimlər yüklənir...
        </div>
      ) : error ? (
        <div
          style={{
            padding: 20,
            borderRadius: 14,
            background: "#fff1f2",
            color: "#be3545",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <AlertCircle size={20} />
          {error}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8edf5",
            borderRadius: 16,
            padding: "45px 20px",
            textAlign: "center",
          }}
        >
          <Stethoscope size={36} color="#9aabc3" />
          <h3 style={{ margin: "14px 0 7px" }}>Həkim tapılmadı</h3>
          <p style={{ color: "#8491a7", fontSize: 13 }}>
            Axtarış sözünü və ya ixtisas filtrini dəyiş.
          </p>
        </div>
      ) : (
        <div className="patient-doctor-grid">
          {filteredDoctors.map((doctor) => {
            const name = doctor.fullName || doctor.name || "Həkim";
            const doctorSpecialty =
              doctor.specialty?.name || doctor.specialty || "İxtisas göstərilməyib";

            return (
              <article className="patient-doctor-card" key={doctor.id}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 13,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      flexShrink: 0,
                      borderRadius: 16,
                      background: "linear-gradient(135deg, #eaf2ff, #dce9ff)",
                      color: "#1769e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    {getInitials(name)}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h3
                      style={{
                        margin: "0 0 7px",
                        fontSize: 16,
                        fontWeight: 800,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {name}
                    </h3>

                    <span
                      style={{
                        display: "inline-block",
                        color: "#1769e0",
                        background: "#edf4ff",
                        borderRadius: 7,
                        padding: "5px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {doctorSpecialty}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#8491a7",
                    fontSize: 12,
                    marginBottom: 20,
                  }}
                >
                  <UserRound size={15} />
                  Avropa Hospital həkimi
                </div>

                <button
                  className="patient-doctor-action"
                  onClick={() =>
                    navigate(
                      `/patient/book-appointment?doctorId=${encodeURIComponent(
                        doctor.id
                      )}`
                    )
                  }
                >
                  <CalendarDays size={17} />
                  Qəbul təyin et
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
