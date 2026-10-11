
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  Stethoscope,
  CalendarDays,
  MapPin,
  BriefcaseMedical,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";

const css = `
.doctor-details {
  width:100%; padding:8px 4px 30px; color:#1b2942;
  font-family:Inter,"Segoe UI",sans-serif;
}
.doctor-details * { box-sizing:border-box; }
.doctor-details .top {
  display:flex; align-items:center; justify-content:space-between;
  flex-wrap:wrap; gap:14px; margin-bottom:24px;
}
.doctor-details .back {
  display:flex; align-items:center; gap:8px;
  border:1px solid #e2e8f2; background:#fff;
  border-radius:10px; padding:10px 14px;
  color:#52617b; font-size:12px; font-weight:700; cursor:pointer;
}
.doctor-details .eyebrow {
  color:#607ce7; font-size:11px; letter-spacing:1.5px;
  font-weight:800; margin-bottom:7px;
}
.doctor-details h1 {
  font-size:clamp(24px,3vw,31px); letter-spacing:-.8px;
  margin:0; font-weight:800;
}
.doctor-details .subtitle {
  color:#8b97aa; font-size:13px; margin:8px 0 0;
}
.doctor-details .panel {
  background:#fff; border:1px solid #e6ebf3;
  border-radius:17px; overflow:hidden;
  box-shadow:0 5px 22px #1b2c4706;
}
.doctor-details .banner {
  height:155px;
  background:linear-gradient(115deg,#253b72,#5274e5 70%,#a3b5ff);
  position:relative;
}
.doctor-details .banner:after {
  content:""; position:absolute; width:210px; height:210px;
  right:7%; top:-100px; border:1px solid #ffffff32;
  border-radius:50%; box-shadow:0 0 0 30px #ffffff0c,0 0 0 60px #ffffff09;
}
.doctor-details .profile {
  display:grid; grid-template-columns:140px minmax(0,1fr);
  gap:23px; align-items:end; padding:0 28px 25px;
}
.doctor-details .avatar {
  width:130px; height:130px; margin-top:-58px;
  z-index:1; position:relative; border:6px solid white;
  border-radius:25px; background:#eef2ff; color:#5877e8;
  display:flex; align-items:center; justify-content:center;
  font-size:38px; font-weight:800; overflow:hidden;
}
.doctor-details .avatar img {
  width:100%; height:100%; object-fit:cover;
}
.doctor-details .profile-info { padding:14px 0 4px; min-width:0; }
.doctor-details .profile-info h2 {
  margin:0; font-size:24px; font-weight:800;
  overflow-wrap:anywhere;
}
.doctor-details .specialty {
  color:#7887a0; margin-top:8px; font-size:13px;
}
.doctor-details .verified {
  display:inline-flex; align-items:center; gap:6px;
  margin-top:12px; padding:7px 10px; border-radius:20px;
  background:#e9f8f0; color:#168252; font-size:10px; font-weight:800;
}
.doctor-details .content {
  padding:0 28px 28px;
  display:grid; grid-template-columns:minmax(0,1.5fr) minmax(220px,1fr);
  gap:20px;
}
.doctor-details .section {
  border:1px solid #e8edf5; border-radius:13px; padding:20px;
  min-width:0;
}
.doctor-details .section h3 {
  margin:0 0 18px; font-size:14px; font-weight:800;
  display:flex; align-items:center; gap:9px;
}
.doctor-details .section h3 svg { color:#5a78e5; }
.doctor-details .info-grid {
  display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px;
}
.doctor-details .info-item {
  display:flex; gap:11px; align-items:flex-start; min-width:0;
}
.doctor-details .info-icon {
  display:flex; align-items:center; justify-content:center;
  width:36px; height:36px; flex-shrink:0;
  border-radius:10px; background:#f0f3ff; color:#5978e7;
}
.doctor-details .info-item label {
  display:block; font-size:10px; color:#929db0; margin:2px 0 6px;
}
.doctor-details .info-item strong {
  display:block; font-size:12px; color:#36445e;
  overflow-wrap:anywhere; line-height:1.6;
}
.doctor-details .about {
  color:#78869b; font-size:12px; line-height:1.9;
  white-space:pre-wrap; overflow-wrap:anywhere;
}
.doctor-details .note {
  display:flex; gap:10px; align-items:flex-start;
  margin-top:15px; border-radius:11px; padding:13px;
  background:#f4f6ff; color:#6f7ea0; font-size:11px; line-height:1.7;
}
.doctor-details .state {
  min-height:280px; display:flex; align-items:center;
  justify-content:center; flex-direction:column; gap:12px;
  color:#8491a6; font-size:13px; text-align:center; padding:25px;
}
.doctor-details .retry {
  padding:10px 15px; border:0; border-radius:9px;
  background:#5575e5; color:white; cursor:pointer; font-weight:700;
}
.doctor-details .spin { animation:doctor-details-spin .8s linear infinite; }
@keyframes doctor-details-spin { to { transform:rotate(360deg); } }
@media(max-width:760px) {
  .doctor-details .profile { grid-template-columns:100px minmax(0,1fr); gap:15px; padding:0 18px 20px; }
  .doctor-details .avatar { width:100px; height:100px; margin-top:-42px; border-radius:20px; }
  .doctor-details .profile-info h2 { font-size:20px; }
  .doctor-details .content { padding:0 18px 20px; grid-template-columns:1fr; }
}
@media(max-width:480px) {
  .doctor-details .info-grid { grid-template-columns:1fr; }
  .doctor-details .profile { grid-template-columns:1fr; }
  .doctor-details .profile-info { padding-top:0; }
  .doctor-details .banner { height:125px; }
}
`;

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((x) => x[0] || "").join("").toUpperCase();

export default function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDoctor() {
    setLoading(true);
    setError("");

    try {
      if (!id) {
        throw new Error("Həkim ID-si URL-də göstərilməyib.");
      }

      const response = await api.get(`/Doctors/${id}`);
      const data = response.data;

      setDoctor(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Həkim məlumatları yüklənmədi. Həkim ID-sini və API bağlantısını yoxlayın."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDoctor();
  }, [id]);

  return (
    <div className="doctor-details">
      <style>{css}</style>

      <div className="top">
        <div>
          <div className="eyebrow">DOCTOR WORKSPACE</div>
          <h1>Həkim məlumatları</h1>
          <p className="subtitle">Həkim profilinin ətraflı məlumatları.</p>
        </div>

        <button className="back" onClick={() => navigate(-1)} type="button">
          <ArrowLeft size={16} />
          Geri qayıt
        </button>
      </div>

      <div className="panel">
        {loading ? (
          <div className="state">
            <RefreshCw className="spin" size={26} />
            Həkim məlumatları yüklənir...
          </div>
        ) : error ? (
          <div className="state">
            <AlertCircle size={32} color="#d45b67" />
            <strong>Məlumat yüklənmədi</strong>
            <span>{error}</span>
            <button className="retry" onClick={loadDoctor} type="button">
              Yenidən cəhd et
            </button>
          </div>
        ) : doctor ? (
          <>
            <div className="banner" />

            <div className="profile">
              <div className="avatar">
                {doctor.imageUrl ? (
                  <img
                    src={doctor.imageUrl}
                    alt={doctor.fullName || "Həkim"}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  initials(doctor.fullName)
                )}
              </div>

              <div className="profile-info">
                <h2>{doctor.fullName || "Ad qeyd edilməyib"}</h2>
                <div className="specialty">
                  {doctor.specialty?.name || doctor.specialtyName || "İxtisas qeyd edilməyib"}
                </div>
                <div className="verified">
                  <ShieldCheck size={14} />
                  Həkim profili
                </div>
              </div>
            </div>

            <div className="content">
              <section className="section">
                <h3>
                  <UserRound size={18} />
                  Əlaqə məlumatları
                </h3>

                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-icon"><Mail size={17} /></div>
                    <div>
                      <label>Email ünvanı</label>
                      <strong>{doctor.email || "Qeyd edilməyib"}</strong>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon"><Phone size={17} /></div>
                    <div>
                      <label>Telefon nömrəsi</label>
                      <strong>{doctor.phoneNumber || "Qeyd edilməyib"}</strong>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon"><Stethoscope size={17} /></div>
                    <div>
                      <label>İxtisas</label>
                      <strong>{doctor.specialty?.name || doctor.specialtyName || "Qeyd edilməyib"}</strong>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon"><BriefcaseMedical size={17} /></div>
                    <div>
                      <label>Həkim ID-si</label>
                      <strong>{doctor.id ?? "—"}</strong>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon"><MapPin size={17} /></div>
                    <div>
                      <label>Ünvan</label>
                      <strong>{doctor.address || "Qeyd edilməyib"}</strong>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon"><CalendarDays size={17} /></div>
                    <div>
                      <label>İş təcrübəsi</label>
                      <strong>{doctor.experience || "Qeyd edilməyib"}</strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className="section">
                <h3>
                  <ClipboardList size={18} />
                  Haqqında
                </h3>

                <p className="about">
                  {doctor.about ||
                    doctor.description ||
                    "Bu həkim haqqında əlavə məlumat daxil edilməyib."}
                </p>

                <div className="note">
                  <ShieldCheck size={17} />
                  <span>
                    Burada API-dən qaytarılan həkim məlumatları göstərilir.
                    Mövcud olmayan sahələr üçün məlumat uydurulmur.
                  </span>
                </div>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
