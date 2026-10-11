
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Save,
  LoaderCircle,
  CheckCircle,
  AlertCircle,
  VenusAndMars,
} from "lucide-react";
import patientService from "../../services/patientService";
import api from "../../services/api";

export default function Profile() {
  const [patient, setPatient] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    address: "",
  });

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      // patientService.getAll() artiq response.data qaytarir.
      const response = await patientService.getAll();

      const data = Array.isArray(response)
        ? response[0]
        : response;

      if (!data) {
        setPatient(null);
        setError(
          "Profil məlumatları tapılmadı. Bu hesab üçün pasiyent profili yaradılmalıdır."
        );
        return;
      }

      setPatient(data);

      setForm({
        fullName: data.fullName || "",
        dateOfBirth: data.dateOfBirth
          ? data.dateOfBirth.substring(0, 10)
          : "",
        gender: data.gender || "",
        phoneNumber: data.phoneNumber || "",
        address: data.address || "",
      });

      // Backend Patient cavabında email qaytarmır.
      // E-poçtu token-dən oxumağa çalışırıq.
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const payload = token.split(".")[1];
          const decoded = JSON.parse(
            atob(
              payload
                .replace(/-/g, "+")
                .replace(/_/g, "/")
            )
          );

          setEmail(
            decoded.email ||
              decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
              ""
          );
        }
      } catch {
        setEmail("");
      }
    } catch (err) {
      console.error("Profil yüklənmə xətası:", err);

      setError(
        err.response?.status === 401
          ? "Sessiya bitib. Hesabına yenidən daxil ol."
          : err.response?.data?.message ||
              "Profil məlumatlarını yükləmək mümkün olmadı."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullName = form.fullName.trim();

    if (!fullName) {
      setError("Ad və soyad boş ola bilməz.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const profileData = {
        fullName,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || "",
        phoneNumber: form.phoneNumber.trim(),
        address: form.address.trim(),
      };

      if (patient?.id) {
        // Mövcud profili yenilə.
        await patientService.update(patient.id, {
          id: patient.id,
          ...profileData,
        });

        setMessage("Profil məlumatları uğurla yeniləndi.");
      } else {
        // Profil tapılmayıbsa, backend-də yarat.
        // UserId göndərilmir; backend onu JWT-dən götürür.
        const created = await patientService.create(profileData);

        setPatient(created);

        setMessage("Pasiyent profili yaradıldı.");
      }

      await loadProfile();
    } catch (err) {
      console.error("Profil yadda saxlanılarkən xəta:", err);

      setError(
        err.response?.data?.message ||
          (err.response?.status === 401
            ? "Sessiya bitib. Yenidən daxil ol."
            : err.response?.status === 403
              ? "Bu əməliyyat üçün icazən yoxdur."
              : "Profil yadda saxlanılmadı. Backend xətasını yoxla.")
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <LoaderCircle size={32} className="profile-spinner" />
        <p>Profil yüklənir...</p>

        <style>{`
          .profile-loading {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #64748b;
            gap: 12px;
          }

          .profile-spinner {
            animation: profileSpin 1s linear infinite;
            color: #2563eb;
          }

          @keyframes profileSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <style>{`
        .profile-page {
          width: 100%;
          max-width: 1150px;
          margin: 0 auto;
          padding: 28px 30px 40px;
          color: #172033;
          box-sizing: border-box;
        }

        .profile-header {
          margin-bottom: 26px;
        }

        .profile-header h1 {
          margin: 0 0 8px;
          font-size: 28px;
          font-weight: 750;
          letter-spacing: -0.7px;
          color: #172033;
        }

        .profile-header p {
          margin: 0;
          color: #718096;
          font-size: 14px;
        }

        .profile-card {
          background: #fff;
          border: 1px solid #e8edf5;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 5px 24px rgba(20, 40, 80, 0.045);
        }

        .profile-banner {
          min-height: 155px;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          gap: 22px;
          background: linear-gradient(120deg, #102b54, #1d4ed8);
          color: white;
          box-sizing: border-box;
        }

        .profile-avatar {
          width: 82px;
          height: 82px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .profile-banner h2 {
          margin: 0 0 7px;
          font-size: 22px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .profile-banner p {
          margin: 0;
          color: #dbeafe;
          font-size: 14px;
        }

        .profile-form {
          padding: 30px 32px 32px;
        }

        .profile-section-title {
          margin: 0 0 22px;
          font-size: 17px;
          font-weight: 700;
          color: #1e293b;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .profile-field {
          min-width: 0;
        }

        .profile-field label {
          display: block;
          margin-bottom: 9px;
          font-size: 13px;
          font-weight: 650;
          color: #475569;
        }

        .profile-input-wrap {
          position: relative;
        }

        .profile-field-icon {
          position: absolute;
          top: 50%;
          left: 14px;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .profile-field input,
        .profile-field select {
          display: block;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          padding: 12px 14px 12px 43px;
          border: 1px solid #dce3ed;
          border-radius: 10px;
          background: #fff;
          color: #1e293b;
          font: inherit;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .profile-field input,
        .profile-field select {
          height: 46px;
        }

        .profile-field input:focus,
        .profile-field select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.11);
        }

        .profile-field input::placeholder {
          color: #a0aec0;
        }

        .profile-field input[readonly] {
          background: #f8fafc;
          color: #64748b;
        }

        .profile-message {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 22px;
          padding: 13px 15px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
        }

        .profile-success {
          color: #166534;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .profile-error {
          color: #b91c1c;
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .profile-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid #edf1f6;
        }

        .profile-save {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 45px;
          padding: 0 22px;
          border: none;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          font-size: 14px;
          font-weight: 650;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }

        .profile-save:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .profile-save:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 700px) {
          .profile-page {
            padding: 20px 14px 30px;
          }

          .profile-banner {
            padding: 24px 20px;
            gap: 15px;
          }

          .profile-avatar {
            width: 65px;
            height: 65px;
            border-radius: 17px;
          }

          .profile-banner h2 {
            font-size: 18px;
          }

          .profile-form {
            padding: 24px 20px;
          }

          .profile-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .profile-header h1 {
            font-size: 24px;
          }

          .profile-actions {
            justify-content: stretch;
          }

          .profile-save {
            width: 100%;
          }
        }
      `}</style>

      <div className="profile-header">
        <h1>Şəxsi profil</h1>
        <p>Şəxsi məlumatlarına bax və lazım olduqda yenilə.</p>
      </div>

      <div className="profile-card">
        <div className="profile-banner">
          <div className="profile-avatar">
            <UserRound size={42} />
          </div>

          <div>
            <h2>{form.fullName || "Pasiyent"}</h2>
            <p>Pasiyent profili</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <h3 className="profile-section-title">Şəxsi məlumatlar</h3>

          <div className="profile-grid">
            <div className="profile-field">
              <label htmlFor="fullName">Ad və soyad</label>
              <div className="profile-input-wrap">
                <UserRound className="profile-field-icon" size={18} />
                <input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Ad və soyadını daxil et"
                  required
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="dateOfBirth">Doğum tarixi</label>
              <div className="profile-input-wrap">
                <CalendarDays className="profile-field-icon" size={18} />
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="gender">Cinsiyyət</label>
              <div className="profile-input-wrap">
                <VenusAndMars className="profile-field-icon" size={18} />
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">Seçilməyib</option>
                  <option value="Male">Kişi</option>
                  <option value="Female">Qadın</option>
                  <option value="Other">Digər</option>
                </select>
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="phoneNumber">Telefon nömrəsi</label>
              <div className="profile-input-wrap">
                <Phone className="profile-field-icon" size={18} />
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="+994 XX XXX XX XX"
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="email">E-poçt</label>
              <div className="profile-input-wrap">
                <Mail className="profile-field-icon" size={18} />
                <input
                  id="email"
                  name="email"
                  value={email}
                  readOnly
                  placeholder="E-poçt məlumatı mövcud deyil"
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="address">Ünvan</label>
              <div className="profile-input-wrap">
                <MapPin className="profile-field-icon" size={18} />
                <input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Yaşadığın ünvan"
                />
              </div>
            </div>
          </div>

          {message && (
            <div className="profile-message profile-success">
              <CheckCircle size={18} />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="profile-message profile-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="profile-actions">
            <button
              type="submit"
              className="profile-save"
              disabled={saving}
            >
              {saving ? (
                <LoaderCircle size={18} className="profile-spinner" />
              ) : (
                <Save size={18} />
              )}
              {saving
                ? "Yadda saxlanılır..."
                : patient
                  ? "Dəyişiklikləri yadda saxla"
                  : "Profili yarat və yadda saxla"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
