
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Stethoscope,
  FileText,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  UserRound,
} from "lucide-react";
import doctorService from "../../services/doctorService";
import appointmentService from "../../services/appointmentService";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  border: "1px solid #dfe6f0",
  borderRadius: 10,
  background: "#fff",
  color: "#172b4d",
  fontSize: 14,
  outline: "none",
};

const blue = "#1769e0";
const monthNames = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
  "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
];
const weekDays = ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"];

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
}

function localDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getSpecialty(doctor) {
  const specialty =
    doctor?.specialty ??
    doctor?.specialtyName ??
    doctor?.speciality ??
    doctor?.specialityName;

  if (typeof specialty === "string") return specialty;

  return specialty?.name || specialty?.title || "";
}

export default function BookAppointment() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    let active = true;

    async function loadDoctors() {
      try {
        const response = await doctorService.getAll();
        const data = response?.data ?? response;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.$values)
              ? data.$values
              : Array.isArray(data?.data)
                ? data.data
                : [];

        if (active) setDoctors(list);
      } catch {
        if (active) {
          setError("Həkim siyahısını yükləmək mümkün olmadı.");
        }
      } finally {
        if (active) setLoadingDoctors(false);
      }
    }

    loadDoctors();

    return () => {
      active = false;
    };
  }, []);

  const today = localDateString(new Date());
  const firstDay = viewMonth.getDay();
  const mondayOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    0
  ).getDate();

  const calendarDays = [];

  for (let i = 0; i < mondayOffset; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  function chooseDay(day) {
    if (!day) return;

    const date = new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth(),
      day
    );
    const dateString = localDateString(date);

    if (dateString < today) return;

    setSelectedDate(dateString);
    setCalendarOpen(false);
    setError("");
  }

  function changeMonth(direction) {
    setViewMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + direction,
          1
        )
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!doctorId || !selectedDate || !appointmentTime) {
      setError("Həkim, qəbul tarixini və saatını seç.");
      return;
    }

    // Tarix və saatı istifadəçinin yerli vaxtı kimi birləşdiririk.
    const localDateTime = new Date(
      `${selectedDate}T${appointmentTime}:00`
    );

    if (Number.isNaN(localDateTime.getTime())) {
      setError("Tarix və ya saat düzgün deyil.");
      return;
    }

    if (localDateTime <= new Date()) {
      setError("Qəbul üçün gələcək tarix və saat seç.");
      return;
    }

    try {
      setSubmitting(true);

      await appointmentService.create({
        doctorId: Number(doctorId),
        appointmentDate: localDateTime.toISOString(),
        notes: notes.trim(),
      });

      setSuccess("Qəbul sorğun göndərildi.");

      setTimeout(() => {
        navigate("/patient/appointments");
      }, 1200);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.title ||
          "Qəbul yaratmaq mümkün olmadı. Giriş etdiyini və məlumatları yoxla."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        color: "#172b4d",
        fontFamily: 'Inter, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ marginBottom: 26 }}>
        <p
          style={{
            color: blue,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.5,
            margin: "0 0 8px",
          }}
        >
          ONLAYN XİDMƏT
        </p>

        <h1 style={{ fontSize: 28, margin: 0, fontWeight: 800 }}>
          Qəbul təyin et
        </h1>

        <p style={{ color: "#8491a7", fontSize: 14, marginTop: 9 }}>
          Həkimini və sənə uyğun vaxtı seçərək qəbul sorğusu göndər.
        </p>
      </div>

      <div className="booking-layout">
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            border: "1px solid #e9edf5",
            borderRadius: 18,
            padding: 26,
            minWidth: 0,
          }}
        >
          <h2 style={{ fontSize: 18, margin: "0 0 24px" }}>
            Qəbul məlumatları
          </h2>

          <label className="booking-label">
            <Stethoscope size={16} />
            Həkim seç
          </label>

          <select
            value={doctorId}
            onChange={(event) => setDoctorId(event.target.value)}
            required
            style={{ ...inputStyle, marginBottom: 22 }}
          >
            <option value="">
              {loadingDoctors ? "Həkimlər yüklənir..." : "Həkim seçin"}
            </option>

            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.fullName || doctor.name || "Həkim"}
                {getSpecialty(doctor)
                  ? ` — ${getSpecialty(doctor)}`
                  : ""}
              </option>
            ))}
          </select>

          {!loadingDoctors && doctors.length === 0 && (
            <p
              style={{
                color: "#b45309",
                fontSize: 12,
                marginTop: -14,
                marginBottom: 20,
              }}
            >
              Həkim tapılmadı. Backend-in işlədiyini yoxla.
            </p>
          )}

          <label className="booking-label">
            <CalendarDays size={16} />
            Qəbul tarixi
          </label>

          <div style={{ position: "relative", marginBottom: 22 }}>
            <button
              type="button"
              onClick={() => setCalendarOpen((open) => !open)}
              className="date-display"
              aria-expanded={calendarOpen}
            >
              <span
                style={{
                  color: selectedDate ? "#172b4d" : "#8491a7",
                }}
              >
                {selectedDate
                  ? formatDate(selectedDate)
                  : "Tarix seçin (GG.AA.İİİİ)"}
              </span>

              <CalendarDays size={19} color={blue} />
            </button>

            {calendarOpen && (
              <div className="calendar-popup">
                <div className="calendar-header">
                  <button
                    type="button"
                    className="calendar-nav"
                    onClick={() => changeMonth(-1)}
                    aria-label="Əvvəlki ay"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <strong>
                    {monthNames[viewMonth.getMonth()]}{" "}
                    {viewMonth.getFullYear()}
                  </strong>

                  <button
                    type="button"
                    className="calendar-nav"
                    onClick={() => changeMonth(1)}
                    aria-label="Növbəti ay"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="calendar-grid">
                  {weekDays.map((day) => (
                    <div className="weekday" key={day}>
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((day, index) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="calendar-empty"
                        />
                      );
                    }

                    const dateString = localDateString(
                      new Date(
                        viewMonth.getFullYear(),
                        viewMonth.getMonth(),
                        day
                      )
                    );

                    const isPast = dateString < today;
                    const isSelected = dateString === selectedDate;

                    return (
                      <button
                        type="button"
                        key={dateString}
                        disabled={isPast}
                        onClick={() => chooseDay(day)}
                        className={`calendar-day ${
                          isSelected ? "selected" : ""
                        } ${isPast ? "past" : ""}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="calendar-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate("");
                      setCalendarOpen(false);
                    }}
                  >
                    Təmizlə
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      setViewMonth(
                        new Date(now.getFullYear(), now.getMonth(), 1)
                      );
                      if (today >= localDateString(now)) {
                        setSelectedDate(today);
                      }
                      setCalendarOpen(false);
                    }}
                  >
                    Bu gün
                  </button>
                </div>
              </div>
            )}
          </div>

          <label className="booking-label">
            <Clock size={16} />
            Qəbul saatı (24 saatlıq format)
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 22,
            }}
          >
            <div>
              <label className="small-label" htmlFor="booking-hour">
                Saat
              </label>

              <select
                id="booking-hour"
                value={appointmentTime.split(":")[0]}
                onChange={(event) => {
                  const minute = appointmentTime.split(":")[1] || "00";
                  setAppointmentTime(`${event.target.value}:${minute}`);
                }}
                style={inputStyle}
              >
                {Array.from({ length: 24 }, (_, hour) => (
                  <option key={hour} value={pad(hour)}>
                    {pad(hour)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="small-label" htmlFor="booking-minute">
                Dəqiqə
              </label>

              <select
                id="booking-minute"
                value={appointmentTime.split(":")[1]}
                onChange={(event) => {
                  const hour = appointmentTime.split(":")[0] || "09";
                  setAppointmentTime(`${hour}:${event.target.value}`);
                }}
                style={inputStyle}
              >
                {Array.from({ length: 60 }, (_, minute) => (
                  <option key={minute} value={pad(minute)}>
                    {pad(minute)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="selected-time">
            <Clock size={18} />
            <span>
              Seçilmiş vaxt:{" "}
              <strong>
                {selectedDate ? formatDate(selectedDate) : "Tarix seçilməyib"}{" "}
                — {appointmentTime}
              </strong>
            </span>
          </div>

          <label className="booking-label" style={{ marginTop: 22 }}>
            <FileText size={16} />
            Qeyd (istəyə bağlı)
          </label>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Şikayətini və ya əlavə məlumatı qeyd et..."
            rows={4}
            style={{
              ...inputStyle,
              resize: "vertical",
              marginBottom: 22,
              fontFamily: "inherit",
            }}
          />

          {error && (
            <div className="booking-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="booking-message success">
              <CheckCircle size={18} />
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || loadingDoctors || doctors.length === 0}
            className="submit-button"
          >
            {submitting ? "Göndərilir..." : "Qəbul sorğusu göndər"}
          </button>
        </form>

        <div className="booking-info">
          <div className="info-icon">
            <CalendarDays size={25} />
          </div>

          <h3>Qəbul prosesi</h3>

          <p>
            Həkimi və vaxtı seç. Sorğunu göndərdikdən sonra qəbulunun
            vəziyyətini “Qəbullarım” bölməsindən izləyə bilərsən.
          </p>

          <div className="info-bottom">
            <Clock size={19} />
            <span>Tarixi və 24 saatlıq vaxtı diqqətlə seç.</span>
          </div>

          <div className="info-bottom">
            <UserRound size={19} />
            <span>Qəbul sorğun həkimə göndəriləcək.</span>
          </div>
        </div>
      </div>

      <style>{`
        .booking-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(230px, .8fr);
          gap: 22px;
          align-items: start;
        }

        .booking-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 9px;
        }

        .booking-label svg {
          color: ${blue};
        }

        .small-label {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 7px;
        }

        .date-display {
          width: 100%;
          min-height: 48px;
          border: 1px solid #dfe6f0;
          border-radius: 10px;
          background: #fff;
          padding: 13px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          cursor: pointer;
          text-align: left;
          font-size: 14px;
        }

        .date-display:hover {
          border-color: ${blue};
        }

        .calendar-popup {
          position: absolute;
          top: calc(100% + 7px);
          left: 0;
          width: min(100%, 340px);
          z-index: 20;
          padding: 15px;
          border: 1px solid #e1e8f2;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 14px 38px rgba(23,43,77,.15);
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 13px;
        }

        .calendar-header strong {
          font-size: 14px;
        }

        .calendar-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 8px;
          background: #f1f5fb;
          color: #344b6b;
          cursor: pointer;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 4px;
        }

        .weekday {
          text-align: center;
          padding: 7px 0;
          color: #8491a7;
          font-size: 11px;
          font-weight: 700;
        }

        .calendar-day,
        .calendar-empty {
          min-width: 0;
          aspect-ratio: 1;
        }

        .calendar-day {
          border: 0;
          border-radius: 8px;
          background: #fff;
          color: #172b4d;
          cursor: pointer;
          font-size: 13px;
        }

        .calendar-day:hover:not(:disabled) {
          background: #eaf2ff;
          color: ${blue};
        }

        .calendar-day.selected {
          background: ${blue};
          color: #fff;
          font-weight: 800;
        }

        .calendar-day.past {
          color: #c1c9d5;
          cursor: not-allowed;
        }

        .calendar-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #edf1f7;
        }

        .calendar-footer button {
          border: 0;
          background: transparent;
          color: ${blue};
          font-size: 12px;
          cursor: pointer;
          padding: 5px;
        }

        .selected-time {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px;
          border-radius: 10px;
          background: #f0f6ff;
          color: #344b6b;
          font-size: 12px;
        }

        .selected-time svg {
          flex-shrink: 0;
          color: ${blue};
        }

        .selected-time strong {
          color: #172b4d;
        }

        .booking-info {
          background: linear-gradient(145deg, #123a79, #1769e0);
          color: #fff;
          border-radius: 18px;
          padding: 24px;
        }

        .info-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #ffffff24;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .booking-info h3 {
          font-size: 19px;
          margin: 0 0 12px;
        }

        .booking-info p {
          color: #e1ebff;
          font-size: 13px;
          line-height: 1.8;
          margin: 0;
        }

        .info-bottom {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #ffffff30;
          font-size: 12px;
          line-height: 1.6;
        }

        .info-bottom svg {
          flex-shrink: 0;
        }

        .booking-message {
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 10px;
          padding: 13px;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .booking-message.error {
          background: #fff1f2;
          color: #be3545;
        }

        .booking-message.success {
          background: #ecfdf3;
          color: #16804a;
        }

        .submit-button {
          width: 100%;
          padding: 14px;
          border: 0;
          border-radius: 11px;
          background: ${blue};
          color: #fff;
          font-size: 14px;
          font-weight: 750;
          cursor: pointer;
        }

        .submit-button:disabled {
          background: #91a9ce;
          cursor: not-allowed;
        }

        @media(max-width: 700px) {
          .booking-layout {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
