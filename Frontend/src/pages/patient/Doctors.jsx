
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Stethoscope,
  UserRound,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import doctorService from "../../services/doctorService";

function getDoctorsArray(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.Items)) return data.Items;
  if (Array.isArray(data?.doctors)) return data.doctors;
  if (Array.isArray(data?.Doctors)) return data.Doctors;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getDoctorId(doctor) {
  return (
    doctor?.id ??
    doctor?.Id ??
    doctor?.doctorId ??
    doctor?.DoctorId ??
    null
  );
}

function getDoctorName(doctor) {
  const fullName =
    doctor?.fullName ??
    doctor?.FullName ??
    doctor?.name ??
    doctor?.Name;

  if (fullName) return fullName;

  const firstName = doctor?.firstName ?? doctor?.FirstName ?? "";
  const lastName = doctor?.lastName ?? doctor?.LastName ?? "";

  return `${firstName} ${lastName}`.trim() || "Həkim";
}

function getDoctorSpecialty(doctor) {
  const value =
    doctor?.specialtyName ??
    doctor?.SpecialtyName ??
    doctor?.specializationName ??
    doctor?.SpecializationName ??
    doctor?.specialty ??
    doctor?.Specialty ??
    doctor?.specialization ??
    doctor?.Specialization;

  if (typeof value === "string") return value;

  return value?.name ?? value?.Name ?? "İxtisas göstərilməyib";
}

function getDoctorImage(doctor) {
  const image =
    doctor?.imageUrl ??
    doctor?.ImageUrl ??
    doctor?.profileImageUrl ??
    doctor?.ProfileImageUrl ??
    doctor?.photoUrl ??
    doctor?.PhotoUrl ??
    doctor?.profilePhotoUrl ??
    doctor?.ProfilePhotoUrl ??
    doctor?.image ??
    doctor?.Image ??
    doctor?.profileImage ??
    doctor?.ProfileImage ??
    doctor?.photo ??
    doctor?.Photo ??
    doctor?.pictureUrl ??
    doctor?.PictureUrl ??
    null;

  if (typeof image !== "string" || !image.trim()) {
    return null;
  }

  const trimmedImage = image.trim();

  // Cloudinary və digər tam HTTP/HTTPS şəkil linkləri
  if (/^https?:\/\//i.test(trimmedImage)) {
    return trimmedImage;
  }

  // Backend-dən nisbi şəkil yolu gəlirsə, API ünvanına birləşdir
  if (trimmedImage.startsWith("/")) {
    return `http://localhost:5030${trimmedImage}`;
  }

  return trimmedImage;
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

function DoctorAvatar({ doctor, name }) {
  const image = getDoctorImage(doctor);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  return (
    <div className="patient-doctor-avatar">
      {image && !imageFailed ? (
        <img
          src={image}
          alt={name}
          loading="lazy"
          onError={() => {
            console.error("Həkim şəkli yüklənmədi:", {
              doctor: name,
              imageUrl: image,
            });
            setImageFailed(true);
          }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

export default function Doctors() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = searchParams.get("search") || "";
  const specialty = searchParams.get("specialty") || "";

  async function loadDoctors() {
    try {
      setLoading(true);
      setError("");

      const response = await doctorService.getAll();
      const list = getDoctorsArray(response);

      console.log("Həkimlər API məlumatı:", list);

      setDoctors(list);
    } catch (err) {
      console.error("Həkim siyahısı xətası:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.title ||
          "Həkim siyahısını yükləmək mümkün olmadı."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function fetchDoctors() {
      try {
        setLoading(true);
        setError("");

        const response = await doctorService.getAll();
        const list = getDoctorsArray(response);

        console.log("Həkimlər API məlumatı:", list);

        if (active) {
          setDoctors(list);
        }
      } catch (err) {
        console.error("Həkim siyahısı xətası:", err);

        if (active) {
          setError(
            err?.response?.data?.message ||
              err?.response?.data?.title ||
              "Həkim siyahısını yükləmək mümkün olmadı."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchDoctors();

    return () => {
      active = false;
    };
  }, []);

  const specialties = useMemo(() => {
    return [
      ...new Set(
        doctors
          .map(getDoctorSpecialty)
          .filter(
            (value) =>
              value && value !== "İxtisas göstərilməyib"
          )
      ),
    ].sort((a, b) => a.localeCompare(b, "az"));
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const normalize = (value) =>
      String(value ?? "")
        .toLocaleLowerCase("az")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const term = normalize(search);
    const selectedSpecialty = normalize(specialty);

    return doctors.filter((doctor) => {
      const name = getDoctorName(doctor);
      const doctorSpecialty = getDoctorSpecialty(doctor);

      const description =
        doctor?.description ??
        doctor?.Description ??
        doctor?.biography ??
        doctor?.Biography ??
        "";

      const searchText = normalize(
        `${name} ${doctorSpecialty} ${description}`
      );

      const matchesSearch =
        !term ||
        term.split(/\s+/).every((word) => searchText.includes(word));

      const matchesSpecialty =
        !selectedSpecialty ||
        normalize(doctorSpecialty) === selectedSpecialty;

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

  function openDoctorProfile(doctor) {
    const id = getDoctorId(doctor);

    if (id === null || id === undefined || id === "") {
      setError("Bu həkimin profil ID-si mövcud deyil.");
      return;
    }

    navigate(`/doctors/${encodeURIComponent(id)}`);
  }

  function bookAppointment(doctor) {
    const id = getDoctorId(doctor);

    if (id === null || id === undefined || id === "") {
      setError("Bu həkimin ID-si mövcud deyil.");
      return;
    }

    navigate(
      `/patient/book-appointment?doctorId=${encodeURIComponent(id)}`
    );
  }

  return (
    <div
      style={{
        maxWidth: 1250,
        margin: "0 auto",
        color: "#172b4d",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
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

        .patient-doctor-actions {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 10px;
          margin-top: auto;
        }

        .patient-doctor-action {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          min-width: 0;
          min-height: 44px;
          padding: 10px 8px;
          border: 0;
          border-radius: 10px;
          background: #1769e0;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background .2s ease;
        }

        .patient-doctor-action:hover:not(:disabled) {
          background: #1254b8;
        }

        .patient-doctor-action:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .patient-doctor-profile {
          background: #edf4ff;
          color: #1769e0;
          border: 1px solid #d7e6ff;
        }

        .patient-doctor-profile:hover:not(:disabled) {
          background: #dceaff;
        }

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

        .patient-doctor-avatar {
          width: 58px;
          height: 58px;
          flex-shrink: 0;
          border-radius: 16px;
          background: linear-gradient(135deg, #eaf2ff, #dce9ff);
          color: #1769e0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-size: 18px;
          font-weight: 800;
        }

        .patient-doctor-avatar img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
        }

        @media (max-width: 1050px) {
          .patient-doctor-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .patient-doctor-grid {
            grid-template-columns: 1fr;
          }

          .patient-doctor-card {
            padding: 18px;
          }

          .patient-doctor-actions {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 360px) {
          .patient-doctor-actions {
            grid-template-columns: 1fr;
          }
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

        <p
          style={{
            color: "#8491a7",
            fontSize: 14,
            marginTop: 9,
          }}
        >
          Həkimləri araşdır, profillərinə bax və qəbul üçün müraciət et.
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
        <div style={{ position: "relative", minWidth: 0 }}>
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
            aria-label="Həkim adı və ya ixtisas üzrə axtarış"
            value={search}
            onChange={(event) =>
              updateQuery("search", event.target.value)
            }
          />
        </div>

        <select
          className="patient-doctor-filter"
          aria-label="İxtisas seç"
          value={specialty}
          onChange={(event) =>
            updateQuery("specialty", event.target.value)
          }
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
          type="button"
          onClick={loadDoctors}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 12px",
            border: "1px solid #e1e8f2",
            borderRadius: 9,
            background: "#fff",
            color: "#526783",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          <RefreshCw size={15} />
          Yenilə
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: 15,
            marginBottom: 18,
            borderRadius: 12,
            background: "#fff1f2",
            color: "#be3545",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

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
      ) : error && doctors.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8edf5",
            borderRadius: 16,
            padding: 35,
            textAlign: "center",
          }}
        >
          <AlertCircle size={35} color="#be3545" />

          <p style={{ color: "#8491a7", fontSize: 13 }}>
            Həkim siyahısını yükləmək mümkün olmadı.
          </p>

          <button
            type="button"
            onClick={loadDoctors}
            className="patient-doctor-action"
            style={{ maxWidth: 180, margin: "18px auto 0" }}
          >
            <RefreshCw size={16} />
            Yenidən yoxla
          </button>
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

          <h3 style={{ margin: "14px 0 7px" }}>
            Həkim tapılmadı
          </h3>

          <p style={{ color: "#8491a7", fontSize: 13 }}>
            Axtarış sözünü və ya ixtisas filtrini dəyiş.
          </p>

          {(search || specialty) && (
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="patient-doctor-action"
              style={{ maxWidth: 200, margin: "18px auto 0" }}
            >
              Filtrləri təmizlə
            </button>
          )}
        </div>
      ) : (
        <div className="patient-doctor-grid">
          {filteredDoctors.map((doctor, index) => {
            const id = getDoctorId(doctor);
            const name = getDoctorName(doctor);
            const doctorSpecialty = getDoctorSpecialty(doctor);

            return (
              <article
                className="patient-doctor-card"
                key={id ?? `${name}-${index}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 13,
                    marginBottom: 18,
                  }}
                >
                  <DoctorAvatar doctor={doctor} name={name} />

                  <div style={{ minWidth: 0, flex: 1 }}>
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

                <div className="patient-doctor-actions">
                  <button
                    type="button"
                    className="patient-doctor-action patient-doctor-profile"
                    onClick={() => openDoctorProfile(doctor)}
                    disabled={id === null || id === ""}
                  >
                    <UserRound size={16} />
                    Profilə bax
                    <ArrowRight size={14} />
                  </button>

                  <button
                    type="button"
                    className="patient-doctor-action"
                    onClick={() => bookAppointment(doctor)}
                    disabled={id === null || id === ""}
                  >
                    <CalendarDays size={16} />
                    Qəbul təyin et
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
