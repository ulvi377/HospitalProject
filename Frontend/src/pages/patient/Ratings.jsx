import { useEffect, useMemo, useState } from "react";
import {
  Star,
  MessageSquare,
  CalendarDays,
  UserRound,
  Send,
  Clock,
  CheckCircle2,
  Heart,
  ArrowRight,
  X,
  LoaderCircle,
  AlertCircle,
  Stethoscope,
  Sparkles,
  History,
} from "lucide-react";
import api from "../../services/api";
import appointmentService from "../../services/appointmentService";

const styles = `
.patient-ratings {
  min-height: 100vh;
  padding: 30px;
  background: #f5f7fb;
  color: #17233c;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.patient-ratings * { box-sizing: border-box; }

.ratings-container {
  width: 100%;
  max-width: 1250px;
  margin: 0 auto;
}

.ratings-hero {
  position: relative;
  overflow: hidden;
  padding: 34px;
  border-radius: 24px;
  color: white;
  background: linear-gradient(120deg, #10264c 0%, #174b83 58%, #187b9b 100%);
  box-shadow: 0 15px 35px rgba(22, 54, 98, .12);
}

.ratings-hero::after {
  content: "";
  position: absolute;
  width: 260px;
  height: 260px;
  right: -70px;
  top: -105px;
  border-radius: 50%;
  border: 35px solid rgba(255,255,255,.07);
  pointer-events: none;
}

.ratings-hero-content {
  position: relative;
  z-index: 1;
  max-width: 690px;
}

.ratings-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 30px;
  background: rgba(255,255,255,.1);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .4px;
}

.ratings-hero h1 {
  margin: 18px 0 10px;
  font-size: clamp(27px, 3vw, 36px);
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -.8px;
}

.ratings-hero p {
  max-width: 560px;
  margin: 0;
  color: #dbe8f8;
  font-size: 14px;
  line-height: 1.8;
}

.ratings-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin: 24px 0 30px;
}

.rating-stat {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 22px;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 18px;
  box-shadow: 0 5px 18px rgba(31, 54, 88, .035);
}

.rating-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 15px;
  background: #eaf3ff;
  color: #2670ca;
}

.rating-stat-icon.gold { background: #fff5dc; color: #d99a12; }
.rating-stat-icon.green { background: #e6f8f0; color: #14956b; }

.rating-stat-label {
  margin-bottom: 5px;
  color: #7a879c;
  font-size: 12px;
  font-weight: 600;
}

.rating-stat-value {
  color: #182743;
  font-size: 25px;
  font-weight: 800;
  line-height: 1.2;
}

.rating-stat-value small {
  color: #8b96a8;
  font-size: 12px;
  font-weight: 600;
}

.ratings-section {
  margin-top: 28px;
}

.ratings-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.ratings-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: #192944;
  font-size: 20px;
  font-weight: 800;
}

.ratings-section-title svg { color: #2670ca; }

.ratings-section-subtitle {
  margin: 6px 0 0;
  color: #8290a5;
  font-size: 13px;
}

.ratings-count {
  flex-shrink: 0;
  padding: 7px 12px;
  border-radius: 20px;
  background: #eaf2ff;
  color: #2868b7;
  font-size: 12px;
  font-weight: 700;
}

.ratings-appointments {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.rating-appointment-card {
  padding: 22px;
  background: #fff;
  border: 1px solid #e7edf5;
  border-radius: 18px;
  transition: transform .2s ease, box-shadow .2s ease;
}

.rating-appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(24, 50, 86, .07);
}

.rating-doctor-row {
  display: flex;
  align-items: center;
  gap: 13px;
}

.rating-doctor-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  color: #2368b9;
  background: linear-gradient(135deg, #e9f3ff, #d9eaff);
}

.rating-doctor-info { min-width: 0; flex: 1; }

.rating-doctor-name {
  margin: 0 0 5px;
  color: #1a2943;
  font-size: 15px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.rating-doctor-specialty {
  color: #8190a5;
  font-size: 12px;
}

.rating-appointment-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 19px 0;
  padding: 13px 0;
  border-top: 1px solid #eff2f7;
  border-bottom: 1px solid #eff2f7;
}

.rating-detail {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #697991;
  font-size: 12px;
}

.rating-detail svg { color: #4381c7; }

.rating-appointment-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.rating-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #16865f;
  font-size: 12px;
  font-weight: 700;
}

.rating-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 15px;
  border: 0;
  border-radius: 11px;
  background: #216bc1;
  color: white;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background .2s ease, transform .2s ease;
}

.rating-button:hover { background: #15549d; transform: translateY(-1px); }
.rating-button:disabled { opacity: .55; cursor: not-allowed; transform: none; }
.rating-button.secondary { color: #2765ad; background: #edf5ff; }
.rating-button.secondary:hover { background: #dfeeff; }
.rating-button.full { width: 100%; padding: 13px; font-size: 13px; }

.ratings-history {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.rating-history-card {
  padding: 21px 23px;
  background: white;
  border: 1px solid #e7edf5;
  border-radius: 17px;
}

.rating-history-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.rating-history-doctor {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.rating-history-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 43px;
  height: 43px;
  border-radius: 13px;
  background: #eaf3ff;
  color: #286cbd;
}

.rating-history-doctor h3 {
  margin: 0 0 5px;
  color: #1b2b45;
  font-size: 14px;
  font-weight: 800;
}

.rating-history-date {
  color: #8995a8;
  font-size: 11px;
}

.rating-stars {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #e6a51b;
}

.rating-history-comment {
  margin: 17px 0 0;
  padding: 14px 16px;
  border-radius: 12px;
  background: #f7f9fc;
  color: #596980;
  font-size: 13px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.rating-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 42px 22px;
  border: 1px dashed #d6dfec;
  border-radius: 18px;
  background: white;
  text-align: center;
}

.rating-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  margin-bottom: 15px;
  border-radius: 18px;
  background: #edf5ff;
  color: #3475bf;
}

.rating-empty h3 {
  margin: 0 0 8px;
  color: #23324b;
  font-size: 16px;
  font-weight: 800;
}

.rating-empty p {
  max-width: 390px;
  margin: 0;
  color: #8793a6;
  font-size: 13px;
  line-height: 1.8;
}

.rating-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 20px;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
}

.rating-alert.error { background: #fff0f0; color: #b83232; }
.rating-alert.success { background: #eaf9f1; color: #147a50; }

.rating-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 180px;
  color: #738198;
  font-size: 13px;
}

.rating-spin { animation: ratingSpin 1s linear infinite; }
@keyframes ratingSpin { to { transform: rotate(360deg); } }

.rating-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(12, 25, 46, .6);
  backdrop-filter: blur(5px);
}

.rating-modal {
  width: 100%;
  max-width: 490px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 27px;
  border-radius: 22px;
  background: white;
  box-shadow: 0 25px 80px rgba(0,0,0,.22);
  animation: ratingModalIn .2s ease;
}

@keyframes ratingModalIn {
  from { opacity: 0; transform: translateY(10px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.rating-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.rating-modal-header h2 {
  margin: 0 0 7px;
  color: #1b2b45;
  font-size: 22px;
  font-weight: 800;
}

.rating-modal-header p {
  margin: 0;
  color: #8390a4;
  font-size: 12px;
  line-height: 1.7;
}

.rating-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  flex-shrink: 0;
  border: 0;
  border-radius: 10px;
  background: #f0f3f8;
  color: #53627a;
  cursor: pointer;
}

.rating-modal-doctor {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 22px 0;
  padding: 14px;
  border-radius: 14px;
  background: #f6f9fd;
}

.rating-modal-doctor strong {
  display: block;
  margin-bottom: 4px;
  color: #23324a;
  font-size: 13px;
}

.rating-modal-doctor span {
  color: #8290a4;
  font-size: 11px;
}

.rating-select-label {
  display: block;
  margin: 20px 0 12px;
  color: #34445d;
  font-size: 13px;
  font-weight: 800;
}

.rating-star-picker {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 7px 0 3px;
}

.rating-star-button {
  padding: 3px;
  border: 0;
  background: transparent;
  color: #d8dfeb;
  cursor: pointer;
  transition: transform .15s ease, color .15s ease;
}

.rating-star-button:hover { transform: scale(1.15); }
.rating-star-button.active { color: #f0b429; }

.rating-star-caption {
  min-height: 20px;
  margin: 8px 0 0;
  color: #8a96a8;
  font-size: 12px;
  text-align: center;
}

.rating-textarea {
  width: 100%;
  min-height: 115px;
  resize: vertical;
  padding: 13px 14px;
  border: 1px solid #dfe6f0;
  border-radius: 12px;
  outline: none;
  color: #25344c;
  background: #fbfcfe;
  font: inherit;
  font-size: 13px;
  line-height: 1.7;
  transition: border-color .2s, box-shadow .2s;
}

.rating-textarea:focus {
  border-color: #4087d4;
  box-shadow: 0 0 0 3px rgba(64,135,212,.12);
}

.rating-textarea::placeholder { color: #a4afbf; }

.rating-modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.rating-modal-actions .rating-button { flex: 1; }

@media (max-width: 900px) {
  .patient-ratings { padding: 22px; }
  .ratings-appointments { grid-template-columns: 1fr; }
  .ratings-stats { gap: 12px; }
  .rating-stat { padding: 17px; }
}

@media (max-width: 600px) {
  .patient-ratings { padding: 14px; }
  .ratings-hero { padding: 25px 21px; border-radius: 19px; }
  .ratings-hero h1 { font-size: 27px; }
  .ratings-stats { grid-template-columns: 1fr; gap: 10px; margin: 17px 0 25px; }
  .rating-stat { padding: 15px 17px; }
  .rating-stat-icon { width: 43px; height: 43px; }
  .rating-stat-value { font-size: 22px; }
  .ratings-section-title { font-size: 17px; }
  .rating-appointment-card { padding: 17px; }
  .rating-appointment-footer { align-items: flex-start; flex-direction: column; }
  .rating-appointment-footer .rating-button { width: 100%; }
  .rating-history-card { padding: 17px; }
  .rating-history-top { flex-direction: column; }
  .rating-modal { padding: 21px; }
  .rating-star-picker { gap: 5px; }
  .rating-star-button svg { width: 33px; height: 33px; }
}
`;


const getList = (response) => {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.ratings)) return data.ratings;
  if (Array.isArray(data?.Ratings)) return data.Ratings;

  return [];
};


const getDoctorName = (appointment) => {
  const doctor =
    appointment?.doctor ??
    appointment?.Doctor ??
    appointment?.doctorDto ??
    {};

  const user = doctor?.user ?? doctor?.User ?? {};

  return (
    doctor?.fullName ??
    doctor?.FullName ??
    doctor?.name ??
    doctor?.Name ??
    user?.fullName ??
    user?.FullName ??
    appointment?.doctorName ??
    appointment?.DoctorName ??
    "Həkim"
  );
};

const getSpecialty = (appointment) => {
  const doctor =
    appointment?.doctor ??
    appointment?.Doctor ??
    {};

  const specialty =
    doctor?.specialty ??
    doctor?.Specialty ??
    doctor?.specialtyName ??
    doctor?.SpecialtyName ??
    doctor?.speciality ??
    doctor?.Speciality;

  if (typeof specialty === "string") return specialty;

  return (
    specialty?.name ??
    specialty?.Name ??
    appointment?.specialtyName ??
    appointment?.SpecialtyName ??
    "İxtisas qeyd edilməyib"
  );
};

const getAppointmentId = (appointment) =>
  appointment?.id ??
  appointment?.Id ??
  appointment?.appointmentId ??
  appointment?.AppointmentId;

const getAppointmentStatus = (appointment) =>
  String(
    appointment?.status ??
      appointment?.Status ??
      appointment?.appointmentStatus ??
      appointment?.AppointmentStatus ??
      ""
  ).toLowerCase();

const isCompleted = (appointment) => {
  const status = getAppointmentStatus(appointment);
  return (
    status.includes("completed") ||
    status.includes("tamam") ||
    status.includes("bitib") ||
    status.includes("baş tutub") ||
    status.includes("bas tutub")
  );
};

const getDateValue = (appointment) =>
  appointment?.appointmentDate ??
  appointment?.AppointmentDate ??
  appointment?.date ??
  appointment?.Date ??
  appointment?.startTime ??
  appointment?.StartTime;

const formatDate = (value) => {
  if (!value) return "Tarix qeyd edilməyib";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Tarix qeyd edilməyib";

  return date.toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getRatingDoctorName = (rating) => {
  const doctor = rating?.doctor ?? rating?.Doctor ?? {};
  const user = doctor?.user ?? doctor?.User ?? {};

  return (
    doctor?.fullName ??
    doctor?.FullName ??
    doctor?.name ??
    doctor?.Name ??
    user?.fullName ??
    user?.FullName ??
    rating?.doctorName ??
    rating?.DoctorName ??
    "Həkim"
  );
};

const getRatingSpecialty = (rating) => {
  const doctor = rating?.doctor ?? rating?.Doctor ?? {};
  const specialty = doctor?.specialty ?? doctor?.Specialty;

  if (typeof specialty === "string") return specialty;

  return (
    specialty?.name ??
    specialty?.Name ??
    rating?.specialtyName ??
    rating?.SpecialtyName ??
    "İxtisas qeyd edilməyib"
  );
};

const getRatingValue = (rating) =>
  Number(rating?.rating ?? rating?.Rating ?? 0);

const getRatingComment = (rating) =>
  rating?.comment ?? rating?.Comment ?? "";

const getRatingDate = (rating) =>
  rating?.createdAt ?? rating?.CreatedAt ?? rating?.date ?? rating?.Date;

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.response?.data?.title ??
  error?.response?.data ??
  error?.message ??
  "Əməliyyat zamanı xəta baş verdi.";

const ratingLabels = [
  "",
  "Çox pis",
  "Pis",
  "Normal",
  "Yaxşı",
  "Əla",
];

export default function Ratings() {
  const [appointments, setAppointments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [appointmentsResult, ratingsResult] = await Promise.allSettled([
        appointmentService.getAll(),
        api.get("/DoctorRatings/my-patient"),
      ]);

      if (appointmentsResult.status === "fulfilled") {
        setAppointments(getList(appointmentsResult.value));
      } else {
        setAppointments([]);
        setError(
          "Görüşləri yükləmək mümkün olmadı. Giriş etdiyini və API bağlantısını yoxla."
        );
      }

      if (ratingsResult.status === "fulfilled") {
        setRatings(getList(ratingsResult.value));
      } else {
        setRatings([]);
        setError((previous) =>
          previous
            ? previous + " Rəylər üçün backend endpoint-i də yoxlanmalıdır."
            : "Rəyləri yükləmək mümkün olmadı. Backend-də /api/DoctorRatings/my-patient endpoint-i olmalıdır."
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const ratedAppointmentIds = useMemo(
    () =>
      new Set(
        ratings
          .map(
            (rating) =>
              rating?.appointmentId ??
              rating?.AppointmentId ??
              rating?.appointment?.id ??
              rating?.Appointment?.Id
          )
          .filter((id) => id !== undefined && id !== null)
          .map(String)
      ),
    [ratings]
  );

  const reviewableAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const id = getAppointmentId(appointment);
        return (
          id !== undefined &&
          id !== null &&
          isCompleted(appointment) &&
          !ratedAppointmentIds.has(String(id))
        );
      }),
    [appointments, ratedAppointmentIds]
  );

  const averageRating = useMemo(() => {
    if (!ratings.length) return "0.0";

    const total = ratings.reduce(
      (sum, rating) => sum + getRatingValue(rating),
      0
    );

    return (total / ratings.length).toFixed(1);
  }, [ratings]);

  const openRatingModal = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedRating(5);
    setComment("");
    setError("");
    setSuccess("");
  };

  const closeRatingModal = () => {
    if (submitting) return;

    setSelectedAppointment(null);
    setComment("");
    setSelectedRating(5);
  };

  const submitRating = async (event) => {
    event.preventDefault();

    if (!selectedAppointment) return;

    if (selectedRating < 1 || selectedRating > 5) {
      setError("Zəhmət olmasa 1-dən 5-ə qədər ulduz seç.");
      return;
    }

    if (comment.trim().length < 3) {
      setError("Rəy ən azı 3 simvoldan ibarət olmalıdır.");
      return;
    }

    if (comment.trim().length > 1000) {
      setError("Rəy 1000 simvoldan uzun ola bilməz.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/DoctorRatings", {
        appointmentId: getAppointmentId(selectedAppointment),
        rating: selectedRating,
        comment: comment.trim(),
      });

      setSuccess("Rəyin uğurla göndərildi. Təşəkkür edirik!");
      setSelectedAppointment(null);
      setComment("");
      await loadData();
      setSuccess("Rəyin uğurla göndərildi. Təşəkkür edirik!");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="patient-ratings">
      <style>{styles}</style>

      <div className="ratings-container">
        <section className="ratings-hero">
          <div className="ratings-hero-content">
            <span className="ratings-eyebrow">
              <Sparkles size={14} />
              PASİYENT RƏYLƏRİ
            </span>

            <h1>Həkiminizi qiymətləndirin</h1>

            <p>
              Müalicə təcrübənizi bizimlə bölüşün. Rəyləriniz xidmət
              keyfiyyətinin yüksəldilməsinə və digər pasiyentlərin düzgün
              seçim etməsinə kömək edir.
            </p>
          </div>
        </section>

        <section className="ratings-stats">
          <div className="rating-stat">
            <div className="rating-stat-icon gold">
              <Star size={23} fill="currentColor" />
            </div>
            <div>
              <div className="rating-stat-label">Orta qiymətləndirməm</div>
              <div className="rating-stat-value">
                {averageRating} <small>/ 5</small>
              </div>
            </div>
          </div>

          <div className="rating-stat">
            <div className="rating-stat-icon">
              <MessageSquare size={23} />
            </div>
            <div>
              <div className="rating-stat-label">Göndərdiyim rəylər</div>
              <div className="rating-stat-value">{ratings.length}</div>
            </div>
          </div>

          <div className="rating-stat">
            <div className="rating-stat-icon green">
              <CheckCircle2 size={23} />
            </div>
            <div>
              <div className="rating-stat-label">Rəy gözləyən görüşlər</div>
              <div className="rating-stat-value">
                {reviewableAppointments.length}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rating-alert error">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rating-alert success">
            <CheckCircle2 size={19} />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="rating-loading">
            <LoaderCircle className="rating-spin" size={22} />
            Məlumatlar yüklənir...
          </div>
        ) : (
          <>
            <section className="ratings-section">
              <div className="ratings-section-heading">
                <div>
                  <h2 className="ratings-section-title">
                    <Stethoscope size={21} />
                    Həkimlərə rəy bildir
                  </h2>
                  <p className="ratings-section-subtitle">
                    Tamamlanmış görüşlərindən birini seçərək qiymətləndir.
                  </p>
                </div>

                <span className="ratings-count">
                  {reviewableAppointments.length} görüş
                </span>
              </div>

              {reviewableAppointments.length > 0 ? (
                <div className="ratings-appointments">
                  {reviewableAppointments.map((appointment, index) => {
                    const id = getAppointmentId(appointment);

                    return (
                      <article
                        className="rating-appointment-card"
                        key={id ?? index}
                      >
                        <div className="rating-doctor-row">
                          <div className="rating-doctor-avatar">
                            <UserRound size={25} />
                          </div>

                          <div className="rating-doctor-info">
                            <h3 className="rating-doctor-name">
                              {getDoctorName(appointment)}
                            </h3>
                            <div className="rating-doctor-specialty">
                              {getSpecialty(appointment)}
                            </div>
                          </div>
                        </div>

                        <div className="rating-appointment-details">
                          <span className="rating-detail">
                            <CalendarDays size={15} />
                            {formatDate(getDateValue(appointment))}
                          </span>

                          <span className="rating-detail">
                            <CheckCircle2 size={15} />
                            Görüş tamamlanıb
                          </span>
                        </div>

                        <div className="rating-appointment-footer">
                          <span className="rating-status">
                            <Heart size={15} />
                            Rəyin bizim üçün önəmlidir
                          </span>

                          <button
                            type="button"
                            className="rating-button"
                            onClick={() => openRatingModal(appointment)}
                          >
                            <Star size={15} />
                            Qiymətləndir
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rating-empty">
                  <div className="rating-empty-icon">
                    <CalendarDays size={27} />
                  </div>
                  <h3>Qiymətləndiriləcək görüş yoxdur</h3>
                  <p>
                    Həkimlə tamamlanmış görüşün olduqda burada görünəcək.
                    Artıq rəy bildirdiyin görüşlər təkrar göstərilmir.
                  </p>
                </div>
              )}
            </section>

            <section className="ratings-section">
              <div className="ratings-section-heading">
                <div>
                  <h2 className="ratings-section-title">
                    <History size={21} />
                    Rəy tarixçəm
                  </h2>
                  <p className="ratings-section-subtitle">
                    Əvvəl göndərdiyin qiymətləndirmələr.
                  </p>
                </div>

                <span className="ratings-count">
                  {ratings.length} rəy
                </span>
              </div>

              {ratings.length > 0 ? (
                <div className="ratings-history">
                  {ratings.map((rating, index) => {
                    const value = getRatingValue(rating);
                    const commentText = getRatingComment(rating);

                    return (
                      <article
                        className="rating-history-card"
                        key={rating?.id ?? rating?.Id ?? index}
                      >
                        <div className="rating-history-top">
                          <div className="rating-history-doctor">
                            <div className="rating-history-avatar">
                              <UserRound size={22} />
                            </div>

                            <div>
                              <h3>{getRatingDoctorName(rating)}</h3>
                              <div className="rating-history-date">
                                {getRatingSpecialty(rating)} ·{" "}
                                {formatDate(getRatingDate(rating))}
                              </div>
                            </div>
                          </div>

                          <div
                            className="rating-stars"
                            aria-label={`${value} / 5 ulduz`}
                          >
                            {Array.from({ length: 5 }, (_, starIndex) => (
                              <Star
                                key={starIndex}
                                size={17}
                                fill={starIndex < value ? "currentColor" : "none"}
                                strokeWidth={1.8}
                              />
                            ))}
                          </div>
                        </div>

                        {commentText && (
                          <p className="rating-history-comment">
                            “{commentText}”
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rating-empty">
                  <div className="rating-empty-icon">
                    <MessageSquare size={27} />
                  </div>
                  <h3>Hələ rəy göndərməmisən</h3>
                  <p>
                    İlk rəyini tamamlanmış görüşlərindən birini
                    qiymətləndirərək göndərə bilərsən.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {selectedAppointment && (
        <div
          className="rating-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRatingModal();
          }}
        >
          <div
            className="rating-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rating-modal-title"
          >
            <div className="rating-modal-header">
              <div>
                <h2 id="rating-modal-title">Həkimi qiymətləndir</h2>
                <p>
                  Təcrübəni səmimi şəkildə bizimlə bölüş.
                </p>
              </div>

              <button
                type="button"
                className="rating-close"
                onClick={closeRatingModal}
                disabled={submitting}
                aria-label="Bağla"
              >
                <X size={19} />
              </button>
            </div>

            <div className="rating-modal-doctor">
              <div className="rating-doctor-avatar">
                <UserRound size={25} />
              </div>
              <div>
                <strong>{getDoctorName(selectedAppointment)}</strong>
                <span>{getSpecialty(selectedAppointment)}</span>
              </div>
            </div>

            <form onSubmit={submitRating}>
              <label className="rating-select-label">
                Ümumi qiymətləndirmən
              </label>

              <div className="rating-star-picker">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={`rating-star-button ${
                      value <= selectedRating ? "active" : ""
                    }`}
                    onClick={() => setSelectedRating(value)}
                    aria-label={`${value} ulduz`}
                    title={`${value} ulduz`}
                  >
                    <Star
                      size={39}
                      fill={
                        value <= selectedRating ? "currentColor" : "none"
                      }
                      strokeWidth={1.8}
                    />
                  </button>
                ))}
              </div>

              <p className="rating-star-caption">
                {ratingLabels[selectedRating]}
              </p>

              <label
                htmlFor="rating-comment"
                className="rating-select-label"
              >
                Rəyin
              </label>

              <textarea
                id="rating-comment"
                className="rating-textarea"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Həkimin münasibəti, müayinə və ümumi təcrübən haqqında yaz..."
                minLength={3}
                maxLength={1000}
                required
              />

              <div
                style={{
                  marginTop: 7,
                  color: "#96a1b1",
                  fontSize: 11,
                  textAlign: "right",
                }}
              >
                {comment.length}/1000
              </div>

              {error && (
                <div className="rating-alert error" style={{ marginTop: 14, marginBottom: 0 }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="rating-modal-actions">
                <button
                  type="button"
                  className="rating-button secondary"
                  onClick={closeRatingModal}
                  disabled={submitting}
                >
                  Ləğv et
                </button>

                <button
                  type="submit"
                  className="rating-button"
                  disabled={submitting || comment.trim().length < 3}
                >
                  {submitting ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="rating-spin"
                      />
                      Göndərilir...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Rəyi göndər
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
