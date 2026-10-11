
import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import {
  UserRound,
  Mail,
  Phone,
  Stethoscope,
  ShieldCheck,
  Save,
  RefreshCw,
  MapPin,
  BriefcaseMedical,
  Camera,
  CheckCircle2,
  AlertCircle,
  Upload,
  ImagePlus,
  X,
} from "lucide-react";

const css = `
.doctor-profile {
  width:100%; min-width:0; padding:8px 4px 30px;
  color:#192640; font-family:Inter,"Segoe UI",sans-serif;
}
.doctor-profile * { box-sizing:border-box; }
.doctor-profile .heading {
  display:flex; align-items:center; justify-content:space-between;
  gap:15px; flex-wrap:wrap; margin-bottom:25px;
}
.doctor-profile .eyebrow {
  color:#5877e9; font-size:11px; font-weight:800;
  letter-spacing:1.6px; margin-bottom:8px;
}
.doctor-profile h1 {
  margin:0; font-size:clamp(25px,3vw,32px);
  letter-spacing:-1px; font-weight:800;
}
.doctor-profile .subtitle {
  margin:8px 0 0; color:#8994a8; font-size:13px;
}
.doctor-profile .refresh {
  display:flex; align-items:center; gap:8px;
  padding:11px 15px; background:white; color:#34435e;
  border:1px solid #e3e9f2; border-radius:11px;
  font-size:12px; font-weight:700; cursor:pointer;
}
.doctor-profile .layout {
  display:grid; grid-template-columns:minmax(240px,.8fr) minmax(0,1.7fr);
  gap:20px; align-items:start;
}
.doctor-profile .card {
  background:white; border:1px solid #e7ecf4;
  border-radius:17px; overflow:hidden;
  box-shadow:0 5px 22px #1e315006;
}
.doctor-profile .identity-banner {
  height:105px;
  background:linear-gradient(120deg,#263d78,#5979e9 70%,#9aafff);
  position:relative;
}
.doctor-profile .identity {
  padding:0 23px 24px; text-align:center;
}
.doctor-profile .avatar {
  width:92px; height:92px; margin:-46px auto 15px;
  position:relative; display:flex; align-items:center;
  justify-content:center; border-radius:25px;
  border:5px solid white; background:#edf1ff;
  color:#5675e5; font-size:30px; font-weight:800;
  overflow:hidden;
}
.doctor-profile .avatar img {
  width:100%; height:100%; object-fit:cover;
}
.doctor-profile .identity h2 {
  margin:0; color:#1c2b46; font-size:19px; font-weight:800;
  overflow-wrap:anywhere;
}
.doctor-profile .specialty {
  color:#7e8ba3; font-size:12px; margin-top:7px;
}
.doctor-profile .verified {
  display:inline-flex; align-items:center; gap:6px;
  margin-top:14px; padding:7px 11px;
  border-radius:20px; background:#e9f8f0;
  color:#188253; font-size:10px; font-weight:800;
}
.doctor-profile .divider {
  height:1px; background:#edf0f6; margin:0 22px;
}
.doctor-profile .quick-info {
  padding:19px 22px 22px; display:grid; gap:17px;
}
.doctor-profile .quick-row {
  display:flex; align-items:flex-start; gap:11px;
  color:#75829a; font-size:12px; min-width:0;
}
.doctor-profile .quick-icon {
  width:34px; height:34px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  border-radius:10px; background:#f0f3ff; color:#5978e7;
}
.doctor-profile .quick-row strong {
  display:block; color:#33425c; font-size:12px;
  margin:1px 0 5px; overflow-wrap:anywhere;
}
.doctor-profile .quick-row span {
  display:block; color:#909bad; overflow-wrap:anywhere;
}
.doctor-profile .form-card { padding:24px; }
.doctor-profile .section-head {
  display:flex; align-items:center; gap:12px;
  margin-bottom:23px;
}
.doctor-profile .section-icon {
  width:42px; height:42px; display:flex;
  align-items:center; justify-content:center;
  background:#edf1ff; color:#5575e5; border-radius:13px;
}
.doctor-profile .section-head h2 {
  margin:0; color:#1c2b46; font-size:16px; font-weight:800;
}
.doctor-profile .section-head p {
  margin:5px 0 0; color:#909bad; font-size:11px;
}
.doctor-profile .form-grid {
  display:grid; grid-template-columns:repeat(2,minmax(0,1fr));
  gap:19px 16px;
}
.doctor-profile .field { min-width:0; }
.doctor-profile .field.full { grid-column:1/-1; }
.doctor-profile .field label {
  display:block; margin-bottom:8px;
  color:#52617a; font-size:11px; font-weight:800;
}
.doctor-profile .input-wrap {
  display:flex; align-items:center; gap:10px;
  min-width:0; padding:0 12px;
  border:1px solid #e3e9f2; background:#fbfcff;
  border-radius:10px; transition:.2s;
}
.doctor-profile .input-wrap:focus-within {
  border-color:#7189ed; background:white;
  box-shadow:0 0 0 3px #5877e915;
}
.doctor-profile .input-wrap svg {
  flex-shrink:0; color:#95a1b5;
}
.doctor-profile .input-wrap input,
.doctor-profile .input-wrap textarea {
  width:100%; min-width:0; padding:12px 0;
  border:0; outline:0; background:transparent;
  color:#34435e; font:inherit; font-size:12px;
}
.doctor-profile .input-wrap textarea {
  min-height:90px; resize:vertical;
}
.doctor-profile .input-wrap input:disabled {
  color:#8c97aa; cursor:not-allowed;
}
.doctor-profile .input-wrap:has(input:disabled) {
  background:#f3f5f9;
}
.doctor-profile .actions {
  display:flex; justify-content:flex-end;
  gap:10px; flex-wrap:wrap; margin-top:24px;
  padding-top:20px; border-top:1px solid #edf0f6;
}
.doctor-profile .btn {
  display:flex; align-items:center; justify-content:center;
  gap:8px; padding:12px 17px; border-radius:10px;
  font-size:12px; font-weight:800; cursor:pointer;
  transition:.2s;
}
.doctor-profile .btn-secondary {
  background:white; color:#53617a; border:1px solid #e0e6f0;
}
.doctor-profile .btn-primary {
  color:white; background:#5575e5; border:1px solid #5575e5;
  box-shadow:0 5px 12px #5575e526;
}
.doctor-profile .btn-primary:hover { background:#4263d5; }
.doctor-profile .btn:disabled,
.doctor-profile .refresh:disabled {
  opacity:.6; cursor:not-allowed;
}
.doctor-profile .message {
  display:flex; align-items:flex-start; gap:9px;
  padding:12px 14px; border-radius:10px;
  margin-bottom:18px; font-size:12px; line-height:1.6;
  overflow-wrap:anywhere;
}
.doctor-profile .message.success {
  background:#edfaf3; color:#168252; border:1px solid #d2f0df;
}
.doctor-profile .message.error {
  background:#fff3f3; color:#bd4d57; border:1px solid #f3d9db;
}
.doctor-profile .hint {
  margin-top:18px; padding:14px 15px; border-radius:11px;
  background:#f5f7ff; border:1px solid #e4eaff;
  color:#7280a0; font-size:11px; line-height:1.7;
}
.doctor-profile .loading {
  min-height:250px; display:flex; justify-content:center;
  align-items:center; flex-direction:column; gap:12px;
  color:#8793a7; font-size:13px;
}
.doctor-profile .spin { animation:profile-spin .8s linear infinite; }
@keyframes profile-spin { to { transform:rotate(360deg); } }

.doctor-profile .photo-upload {
  margin:0 18px 22px;
  padding:16px;
  background:#f8faff;
  border:1px solid #e4eaff;
  border-radius:14px;
  text-align:left;
}
.doctor-profile .photo-title {
  display:flex; align-items:center; gap:8px;
  color:#34435e; font-size:12px; font-weight:800;
  margin-bottom:7px;
}
.doctor-profile .photo-description {
  margin:0 0 13px;
  color:#8994a8; font-size:11px; line-height:1.6;
}
.doctor-profile .file-input { display:none; }
.doctor-profile .photo-buttons {
  display:flex; flex-wrap:wrap; gap:8px;
}
.doctor-profile .photo-button {
  display:inline-flex; align-items:center; justify-content:center;
  gap:7px; padding:10px 12px; border-radius:9px;
  font-size:11px; font-weight:800; cursor:pointer;
  border:1px solid #e0e6f0; background:white; color:#52617a;
}
.doctor-profile .photo-button.primary {
  color:white; background:#5575e5; border-color:#5575e5;
}
.doctor-profile .photo-button:disabled {
  opacity:.55; cursor:not-allowed;
}
.doctor-profile .photo-preview {
  width:100%; height:130px; object-fit:cover;
  border-radius:10px; margin:0 0 12px;
  border:1px solid #e4eaff;
}
.doctor-profile .photo-file-name {
  color:#7280a0; font-size:10px;
  margin:0 0 12px; overflow-wrap:anywhere;
}
@media(max-width:850px) {
  .doctor-profile .layout { grid-template-columns:1fr; }
  .doctor-profile .identity { padding-bottom:20px; }
}
@media(max-width:520px) {
  .doctor-profile .form-card { padding:17px; }
  .doctor-profile .form-grid { grid-template-columns:1fr; }
  .doctor-profile .field.full { grid-column:auto; }
  .doctor-profile .photo-upload { margin:0 12px 18px; }
}
`;

const getInitials = (name) => {
  if (!name) return "DR";

  return name
    .trim()
    .split(/\\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

function getTokenEmail() {
  const token = localStorage.getItem("token");

  if (!token) return "";

  try {
    const base64 = token
      .split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((char) =>
            "%" + char.charCodeAt(0).toString(16).padStart(2, "0")
          )
          .join("")
      )
    );

    return (
      payload.email ||
      payload["email"] ||
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ] ||
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ] ||
      ""
    );
  } catch {
    return "";
  }
}

export default function Profile() {
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");

  const [profile, setProfile] = useState({
    id: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    specialtyName: "",
    specialtyId: "",
    address: "",
    imageUrl: "",
    experience: "",
    about: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setMessage(null);

      try {
        const response = await api.get("/Doctors");

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.$values || [];

        const savedEmail =
          localStorage.getItem("email") || getTokenEmail();

        const selected =
          data.find(
            (doctor) =>
              savedEmail &&
              doctor.email?.toLowerCase() === savedEmail.toLowerCase()
          ) ||
          (data.length === 1 ? data[0] : null);

        if (!selected) {
          throw new Error(
            "Həkim profili tapılmadı. JWT email claim-ini və /Doctors cavabını yoxlayın."
          );
        }

        if (!active) return;

        setProfile({
          id: selected.id ?? "",
          fullName: selected.fullName ?? "",
          email: selected.email ?? "",
          phoneNumber: selected.phoneNumber ?? "",
          specialtyName:
            selected.specialty?.name ?? selected.specialtyName ?? "",
          specialtyId:
            selected.specialtyId ?? selected.specialty?.id ?? "",
          address: selected.address ?? "",
          imageUrl: selected.imageUrl ?? "",
          experience: selected.experience ?? "",
          about: selected.about ?? selected.description ?? "",
        });
      } catch (err) {
        if (active) {
          setMessage({
            type: "error",
            text:
              err.response?.data?.message ||
              err.message ||
              "Profil məlumatlarını yükləmək mümkün olmadı.",
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  function handleImageSelect(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage(null);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Yalnız JPG, PNG və WEBP formatları dəstəklənir.",
      });

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Şəklin ölçüsü maksimum 5 MB ola bilər.",
      });

      event.target.value = "";
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const localPreview = URL.createObjectURL(file);

    previewUrlRef.current = localPreview;

    setSelectedImage(file);
    setPreviewUrl(localPreview);
  }

  function clearSelectedImage() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setSelectedImage(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleImageUpload() {
    if (!selectedImage) {
      setMessage({
        type: "error",
        text: "Əvvəlcə profil şəkli seç.",
      });
      return;
    }

    if (!profile.id) {
      setMessage({
        type: "error",
        text: "Həkim ID-si tapılmadı.",
      });
      return;
    }

    setUploadingImage(true);
    setMessage(null);

    try {
      const formData = new FormData();

      formData.append("file", selectedImage);

      const response = await api.post(
        `/Doctors/${profile.id}/image`,
        formData
      );

      const imageUrl = response.data?.imageUrl;

      if (!imageUrl) {
        throw new Error("Server şəkil URL-si qaytarmadı.");
      }

      setProfile((previous) => ({
        ...previous,
        imageUrl,
      }));

      clearSelectedImage();

      setMessage({
        type: "success",
        text: "Profil şəkli Cloudinary-yə yükləndi və yadda saxlandı.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          (err.response?.status === 401
            ? "Sessiya bitib. Yenidən giriş et."
            : err.response?.status === 403
            ? "Bu profil şəklini dəyişməyə icazən yoxdur. Həkim hesabının backend-dəki Doctor.Email və ya ApplicationUserId ilə uyğunluğunu yoxlayın."
            : err.response?.status === 404
            ? "Həkim tapılmadı. Profil ID-sini yoxlayın."
            : err.message || "Şəkil yüklənmədi."),
      });
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (!profile.id) {
        throw new Error("Həkim ID-si tapılmadı.");
      }

      const payload = {
        id: Number(profile.id),
        fullName: profile.fullName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        specialtyId: Number(profile.specialtyId),
        address: profile.address,
        experience: profile.experience,
        about: profile.about,
        imageUrl: profile.imageUrl,
        isActive: true,
      };

      await api.put(`/Doctors/${profile.id}`, payload);

      setMessage({
        type: "success",
        text: "Profil məlumatları uğurla yeniləndi.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          (err.response?.status === 401
            ? "Sessiya bitib. Yenidən giriş et."
            : err.response?.status === 403
            ? "Profil məlumatlarını dəyişmək üçün backend-də həkimə uyğun PUT endpoint-i lazımdır. Şəkil yükləmə ayrıca işləyə bilər."
            : err.response?.status === 400
            ? "Məlumatlar qəbul edilmədi. İxtisas ID-sini və göndərilən sahələri yoxlayın."
            : err.message || "Profil yenilənmədi."),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="doctor-profile">
      <style>{css}</style>

      <header className="heading">
        <div>
          <div className="eyebrow">DOCTOR WORKSPACE</div>
          <h1>Profilim</h1>
          <p className="subtitle">
            Şəxsi məlumatlarınıza baxın və profilinizi idarə edin.
          </p>
        </div>

        <button
          type="button"
          className="refresh"
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={loading || uploadingImage || saving}
        >
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          Yenilə
        </button>
      </header>

      {message && (
        <div className={`message ${message.type}`}>
          {message.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="card loading">
          <RefreshCw size={25} className="spin" />
          Profil məlumatları yüklənir...
        </div>
      ) : (
        <div className="layout">
          <aside className="card">
            <div className="identity-banner" />

            <div className="identity">
              <div className="avatar">
                {previewUrl || profile.imageUrl ? (
                  <img
                    src={previewUrl || profile.imageUrl}
                    alt={profile.fullName || "Həkim"}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  getInitials(profile.fullName)
                )}
              </div>

              <h2>{profile.fullName || "Həkim profili"}</h2>

              <div className="specialty">
                {profile.specialtyName || "İxtisas qeyd edilməyib"}
              </div>

              <div className="verified">
                <ShieldCheck size={14} />
                Həkim hesabı
              </div>
            </div>

            <div className="photo-upload">
              <div className="photo-title">
                <Camera size={17} />
                Profil şəkli
              </div>

              <p className="photo-description">
                JPG, PNG və ya WEBP formatı. Maksimum 5 MB.
              </p>

              {previewUrl && (
                <>
                  <img
                    className="photo-preview"
                    src={previewUrl}
                    alt="Yeni profil şəkli"
                  />

                  <p className="photo-file-name">
                    {selectedImage?.name}
                  </p>
                </>
              )}

              <input
                ref={fileInputRef}
                id="doctor-profile-image"
                className="file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
              />

              <div className="photo-buttons">
                <button
                  type="button"
                  className="photo-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  <ImagePlus size={15} />
                  Şəkil seç
                </button>

                {selectedImage && (
                  <button
                    type="button"
                    className="photo-button primary"
                    onClick={handleImageUpload}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <RefreshCw size={15} className="spin" />
                    ) : (
                      <Upload size={15} />
                    )}
                    {uploadingImage ? "Yüklənir..." : "Şəkli yüklə"}
                  </button>
                )}

                {selectedImage && !uploadingImage && (
                  <button
                    type="button"
                    className="photo-button"
                    onClick={clearSelectedImage}
                  >
                    <X size={15} />
                    Ləğv et
                  </button>
                )}
              </div>
            </div>

            <div className="divider" />

            <div className="quick-info">
              <div className="quick-row">
                <div className="quick-icon"><Mail size={17} /></div>
                <div>
                  <strong>Email ünvanı</strong>
                  <span>{profile.email || "Qeyd edilməyib"}</span>
                </div>
              </div>

              <div className="quick-row">
                <div className="quick-icon"><Phone size={17} /></div>
                <div>
                  <strong>Telefon</strong>
                  <span>{profile.phoneNumber || "Qeyd edilməyib"}</span>
                </div>
              </div>

              <div className="quick-row">
                <div className="quick-icon"><Stethoscope size={17} /></div>
                <div>
                  <strong>İxtisas</strong>
                  <span>{profile.specialtyName || "Qeyd edilməyib"}</span>
                </div>
              </div>

              <div className="quick-row">
                <div className="quick-icon"><MapPin size={17} /></div>
                <div>
                  <strong>Ünvan</strong>
                  <span>{profile.address || "Qeyd edilməyib"}</span>
                </div>
              </div>
            </div>
          </aside>

          <section className="card form-card">
            <div className="section-head">
              <div className="section-icon">
                <UserRound size={21} />
              </div>
              <div>
                <h2>Şəxsi məlumatlar</h2>
                <p>Profil məlumatlarınızı nəzərdən keçirin.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="doctor-fullName">Ad və soyad</label>
                  <div className="input-wrap">
                    <UserRound size={16} />
                    <input
                      id="doctor-fullName"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      placeholder="Ad və soyad"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="doctor-email">Email</label>
                  <div className="input-wrap">
                    <Mail size={16} />
                    <input
                      id="doctor-email"
                      name="email"
                      type="email"
                      value={profile.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="doctor-phone">Telefon nömrəsi</label>
                  <div className="input-wrap">
                    <Phone size={16} />
                    <input
                      id="doctor-phone"
                      name="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={handleChange}
                      placeholder="+994 XX XXX XX XX"
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="doctor-specialty">İxtisas</label>
                  <div className="input-wrap">
                    <BriefcaseMedical size={16} />
                    <input
                      id="doctor-specialty"
                      value={profile.specialtyName}
                      disabled
                      placeholder="İxtisas"
                    />
                  </div>
                </div>

                <div className="field full">
                  <label htmlFor="doctor-address">Ünvan</label>
                  <div className="input-wrap">
                    <MapPin size={16} />
                    <input
                      id="doctor-address"
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      placeholder="İş ünvanı və ya klinika"
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="doctor-experience">İş təcrübəsi</label>
                  <div className="input-wrap">
                    <Stethoscope size={16} />
                    <input
                      id="doctor-experience"
                      name="experience"
                      value={profile.experience}
                      onChange={handleChange}
                      placeholder="Məsələn, 5 il"
                    />
                  </div>
                </div>

                <div className="field full">
                  <label htmlFor="doctor-about">Haqqımda</label>
                  <div className="input-wrap">
                    <Camera size={16} />
                    <textarea
                      id="doctor-about"
                      name="about"
                      value={profile.about}
                      onChange={handleChange}
                      placeholder="Peşəkar təcrübəniz və fəaliyyətiniz haqqında..."
                    />
                  </div>
                </div>
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRefreshKey((value) => value + 1)}
                  disabled={saving || uploadingImage}
                >
                  Ləğv et
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || uploadingImage}
                >
                  {saving ? (
                    <RefreshCw size={16} className="spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Saxlanılır..." : "Dəyişiklikləri saxla"}
                </button>
              </div>
            </form>

            <div className="hint">
              <ShieldCheck
                size={15}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: 6,
                }}
              />
              Profil şəkli ayrıca yüklənir. Ad və digər məlumatların
              saxlanması backend icazələrindən və model sahələrindən asılıdır.
            </div>
          </section>
        </div>
      )}
    </div>
  );
}