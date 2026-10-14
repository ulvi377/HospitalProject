
import { useEffect, useMemo, useState } from "react";
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
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import api from "../../services/api";
import doctorService from "../../services/doctorService";
import appointmentService from "../../services/appointmentService";

const BLUE = "#1769e0";

const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
  "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
];

const WEEKDAYS = ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"];

const pad = (value) => String(value).padStart(2, "0");

const localDateString = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const getData = (response) => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.$values)) return data.$values;
  return [];
};

const getSpecialty = (doctor) => {
  const specialty = doctor?.specialty;
  if (typeof specialty === "string") return specialty;
  return specialty?.name || doctor?.specialtyName || doctor?.speciality || "Həkim";
};

const getDoctorName = (doctor) =>
  doctor?.fullName ||
  doctor?.name ||
  [doctor?.firstName, doctor?.lastName].filter(Boolean).join(" ") ||
  `Həkim #${doctor?.id}`;

const getDayNumber = (value) => {
  if (typeof value === "number") return value;
  if (value == null) return -1;

  const days = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const text = String(value).toLowerCase();
  if (days[text] !== undefined) return days[text];

  const numeric = Number(value);
  return Number.isNaN(numeric) ? -1 : numeric;
};

const getTimeMinutes = (value) => {
  if (!value) return 0;

  const parts = String(value).split(":");
  return Number(parts[0] || 0) * 60 + Number(parts[1] || 0);
};

const formatTime = (minutes) =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

const getAppointmentDate = (appointment) => {
  const value = appointment?.appointmentDate;
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isCancelled = (status) =>
  String(status || "").toLowerCase() === "cancelled";

const styles = {
  page: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "28px 22px 48px",
    color: "#172b4d",
    fontFamily: "inherit",
  },
  heading: {
    fontSize: 28,
    fontWeight: 800,
    margin: "0 0 8px",
    letterSpacing: "-0.7px",
  },
  subtitle: {
    color: "#718096",
    fontSize: 14,
    lineHeight: 1.7,
    margin: "0 0 26px",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.6fr) minmax(270px, 0.9fr)",
    gap: 22,
    alignItems: "start",
  },
  card: {
    background: "#fff",
    border: "1px solid #e8edf5",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 8px 30px rgba(20, 47, 89, 0.045)",
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 750,
    margin: "0 0 18px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    color: "#344563",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    border: "1px solid #dfe6f0",
    borderRadius: 10,
    padding: "12px 13px",
    background: "#fff",
    color: "#172b4d",
    fontSize: 14,
    outlineColor: BLUE,
  },
  field: { marginBottom: 21 },
  iconBox: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: 10,
    background: "#edf4ff",
    color: BLUE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    width: "100%",
    border: 0,
    borderRadius: 11,
    padding: "14px 18px",
    color: "#fff",
    background: BLUE,
    fontSize: 14,
    fontWeight: 750,
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
  },
  secondaryButton: {
    border: "1px solid #e0e8f4",
    background: "#fff",
    color: "#344563",
    borderRadius: 9,
    padding: "7px 10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  notice: {
    padding: "12px 14px",
    borderRadius: 10,
    fontSize: 13,
    lineHeight: 1.6,
    marginBottom: 18,
  },
};

export default function BookAppointment() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [selectedDate, setSelectedDate] = useState(localDateString(new Date()));
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");

  const [monthDate, setMonthDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  });

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const todayString = localDateString(new Date());

  const selectedDoctor = doctors.find(
    (doctor) => String(doctor.id) === String(doctorId)
  );

  useEffect(() => {
    let active = true;

    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await doctorService.getAll();
        const list = getData(response);

        if (!active) return;

        setDoctors(list);

        if (list.length === 1) {
          setDoctorId(String(list[0].id));
        }
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.message ||
              "Həkimlərin siyahısını yükləmək mümkün olmadı."
          );
        }
      } finally {
        if (active) setLoadingDoctors(false);
      }
    };

    loadDoctors();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadDoctorData = async () => {
      setSchedules([]);
      setAppointments([]);
      setSelectedTime("");
      setSuccess("");

      if (!doctorId) return;

      try {
        setLoadingSlots(true);
        setError("");

        const [scheduleResponse, appointmentResponse] = await Promise.all([
          api.get(`/DoctorSchedules/doctor/${doctorId}`),
          appointmentService.getAll({ doctorId: Number(doctorId) }),
        ]);

        if (!active) return;

        const doctorSchedules = getData(scheduleResponse).filter(
          (schedule) =>
            schedule.isAvailable !== false &&
            schedule.IsAvailable !== false
        );

        const allAppointments = getData(appointmentResponse);

        setSchedules(doctorSchedules);
        setAppointments(
          allAppointments.filter(
            (appointment) =>
              Number(appointment.doctorId) === Number(doctorId) &&
              !isCancelled(appointment.status)
          )
        );
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.message ||
              "Həkimin iş qrafikini və dolu saatları yükləmək mümkün olmadı. Giriş etdiyinizi yoxlayın."
          );
        }
      } finally {
        if (active) setLoadingSlots(false);
      }
    };

    loadDoctorData();

    return () => {
      active = false;
    };
  }, [doctorId]);

  const selectedDateObject = useMemo(() => {
    if (!selectedDate) return null;
    const [year, month, day] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [selectedDate]);

  const daySchedules = useMemo(() => {
    if (!selectedDateObject) return [];

    const dayNumber = selectedDateObject.getDay();

    return schedules.filter(
      (schedule) =>
        getDayNumber(schedule.dayOfWeek ?? schedule.DayOfWeek) === dayNumber
    );
  }, [schedules, selectedDateObject]);

  const bookedTimes = useMemo(() => {
    if (!selectedDate) return new Set();

    const times = new Set();

    appointments.forEach((appointment) => {
      const date = getAppointmentDate(appointment);
      if (!date) return;

      if (localDateString(date) === selectedDate) {
        times.add(`${pad(date.getHours())}:${pad(date.getMinutes())}`);
      }
    });

    return times;
  }, [appointments, selectedDate]);

  const availableSlots = useMemo(() => {
    if (!selectedDateObject || daySchedules.length === 0) return [];

    const slots = [];

    daySchedules.forEach((schedule) => {
      const start = getTimeMinutes(
        schedule.startTime ?? schedule.StartTime
      );
      const end = getTimeMinutes(
        schedule.endTime ?? schedule.EndTime
      );

      for (let minutes = start; minutes + 30 <= end; minutes += 30) {
        const time = formatTime(minutes);
        const [hour, minute] = time.split(":").map(Number);

        const slotDate = new Date(selectedDateObject);
        slotDate.setHours(hour, minute, 0, 0);

        if (slotDate.getTime() <= Date.now()) continue;
        if (bookedTimes.has(time)) continue;

        slots.push(time);
      }
    });

    return [...new Set(slots)].sort();
  }, [daySchedules, selectedDateObject, bookedTimes]);

  const calendarCells = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Təqvim bazar ertəsindən başlayır.
    const offset = (firstDay.getDay() + 6) % 7;
    const cells = [];

    for (let i = 0; i < offset; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }

    return cells;
  }, [monthDate]);

  const changeMonth = (amount) => {
    setMonthDate((current) => {
      const next = new Date(
        current.getFullYear(),
        current.getMonth() + amount,
        1
      );

      const currentMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );

      return next < currentMonth ? currentMonth : next;
    });
  };

  const handleDateSelect = (date) => {
    const dateString = localDateString(date);

    if (dateString < todayString) return;

    setSelectedDate(dateString);
    setSelectedTime("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!doctorId) {
      setError("Zəhmət olmasa, həkim seçin.");
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError("Zəhmət olmasa, qəbul tarixini və saatını seçin.");
      return;
    }

    if (!availableSlots.includes(selectedTime)) {
      setError("Seçilmiş saat artıq əlçatan deyil. Başqa saat seçin.");
      return;
    }

    const appointmentDate = `${selectedDate}T${selectedTime}:00`;

    try {
      setSubmitting(true);

      await appointmentService.create({
        doctorId: Number(doctorId),
        appointmentDate,
        notes: notes.trim(),
      });

      setSuccess(
        "Rezerv sorğunuz uğurla yaradıldı. Həkimin təsdiqini gözləyin."
      );

      setSelectedTime("");
      setNotes("");

      // Yeni rezervin dolu saatlar siyahısına düşməsi üçün məlumatları yenilə.
      const response = await appointmentService.getAll({
        doctorId: Number(doctorId),
      });

      setAppointments(
        getData(response).filter(
          (appointment) =>
            Number(appointment.doctorId) === Number(doctorId) &&
            !isCancelled(appointment.status)
        )
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Rezervasiya zamanı xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: BLUE,
            background: "#edf4ff",
            padding: "7px 12px",
            borderRadius: 30,
            fontSize: 12,
            fontWeight: 750,
            marginBottom: 14,
          }}
        >
          <CalendarDays size={15} />
          ONLAYN QƏBUL
        </div>

        <h1 style={styles.heading}>Qəbul üçün rezervasiya</h1>

        <p style={styles.subtitle}>
          Həkiminizi, uyğun günü və boş saatı seçərək qəbul sorğusu yaradın.
        </p>
      </div>

      <style>{`
        .booking-calendar-day {
          min-height: 39px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #344563;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }
        .booking-calendar-day:hover:not(:disabled) {
          background: #edf4ff;
          color: ${BLUE};
        }
        .booking-calendar-day:disabled {
          color: #c6ceda;
          cursor: not-allowed;
        }
        .booking-calendar-day.selected {
          background: ${BLUE};
          color: white;
          box-shadow: 0 4px 10px rgba(23, 105, 224, 0.23);
        }
        .booking-slot {
          padding: 10px 6px;
          border: 1px solid #dfe7f2;
          border-radius: 9px;
          background: #fff;
          color: #344563;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .booking-slot:hover {
          border-color: ${BLUE};
          color: ${BLUE};
          background: #f5f9ff;
        }
        .booking-slot.selected {
          background: ${BLUE};
          border-color: ${BLUE};
          color: white;
        }
        @media (max-width: 760px) {
          .booking-layout {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          .booking-card {
            padding: 18px !important;
          }
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div
          className="booking-layout"
          style={styles.layout}
        >
          <div
            className="booking-card"
            style={styles.card}
          >
            <h2 style={styles.sectionTitle}>
              <span style={styles.iconBox}>
                <Stethoscope size={19} />
              </span>
              Qəbul məlumatları
            </h2>

            {error && (
              <div
                role="alert"
                style={{
                  ...styles.notice,
                  background: "#fff1f0",
                  color: "#b42318",
                  border: "1px solid #ffd6d2",
                }}
              >
                <div style={{ display: "flex", gap: 9 }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div
                role="status"
                style={{
                  ...styles.notice,
                  background: "#ecfdf3",
                  color: "#067647",
                  border: "1px solid #abefc6",
                }}
              >
                <div style={{ display: "flex", gap: 9 }}>
                  <CheckCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{success}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/patient/appointments")}
                  style={{
                    marginTop: 10,
                    border: 0,
                    background: "transparent",
                    color: "#067647",
                    padding: 0,
                    fontWeight: 750,
                    cursor: "pointer",
                  }}
                >
                  Qəbullarıma keç →
                </button>
              </div>
            )}

            <div style={styles.field}>
              <label htmlFor="booking-doctor" style={styles.label}>
                Həkim seçin
              </label>

              <select
                id="booking-doctor"
                value={doctorId}
                onChange={(event) => {
                  setDoctorId(event.target.value);
                  setSelectedTime("");
                  setError("");
                  setSuccess("");
                }}
                style={styles.input}
                disabled={loadingDoctors}
                required
              >
                <option value="">
                  {loadingDoctors ? "Həkimlər yüklənir..." : "Həkim seçin"}
                </option>

                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {getDoctorName(doctor)} — {getSpecialty(doctor)}
                  </option>
                ))}
              </select>

              {!loadingDoctors && doctors.length === 0 && (
                <p style={{ color: "#b42318", fontSize: 12, marginBottom: 0 }}>
                  Hazırda həkim siyahısı boşdur.
                </p>
              )}
            </div>

            {selectedDoctor && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  padding: 14,
                  borderRadius: 12,
                  background: "#f6f9fe",
                  border: "1px solid #e7eef9",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 45,
                    height: 45,
                    flexShrink: 0,
                    borderRadius: 12,
                    background: "#e4eeff",
                    color: BLUE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserRound size={23} />
                </div>

                <div>
                  <div style={{ fontSize: 14, fontWeight: 750 }}>
                    {getDoctorName(selectedDoctor)}
                  </div>
                  <div style={{ fontSize: 12, color: "#718096", marginTop: 4 }}>
                    {getSpecialty(selectedDoctor)}
                  </div>
                </div>
              </div>
            )}

            <div style={styles.field}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <label style={{ ...styles.label, margin: 0 }}>
                  Qəbul tarixi
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <button
                    type="button"
                    aria-label="Əvvəlki ay"
                    onClick={() => changeMonth(-1)}
                    disabled={
                      monthDate.getFullYear() === new Date().getFullYear() &&
                      monthDate.getMonth() === new Date().getMonth()
                    }
                    style={{
                      ...styles.secondaryButton,
                      opacity:
                        monthDate.getFullYear() === new Date().getFullYear() &&
                        monthDate.getMonth() === new Date().getMonth()
                          ? 0.4
                          : 1,
                    }}
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <span
                    style={{
                      minWidth: 112,
                      textAlign: "center",
                      fontSize: 13,
                      fontWeight: 750,
                    }}
                  >
                    {MONTHS[monthDate.getMonth()]} {monthDate.getFullYear()}
                  </span>

                  <button
                    type="button"
                    aria-label="Növbəti ay"
                    onClick={() => changeMonth(1)}
                    style={styles.secondaryButton}
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gap: 4,
                }}
              >
                {WEEKDAYS.map((day, index) => (
                  <div
                    key={`${day}-${index}`}
                    style={{
                      textAlign: "center",
                      padding: "7px 0",
                      color: "#8a96a8",
                      fontSize: 11,
                      fontWeight: 750,
                    }}
                  >
                    {day}
                  </div>
                ))}

                {calendarCells.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} />;
                  }

                  const dateString = localDateString(date);
                  const disabled = dateString < todayString;
                  const selected = dateString === selectedDate;

                  return (
                    <button
                      key={dateString}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleDateSelect(date)}
                      className={`booking-calendar-day ${
                        selected ? "selected" : ""
                      }`}
                      aria-pressed={selected}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <Clock size={15} />
                  Boş qəbul saatları
                </span>
              </label>

              {!doctorId ? (
                <div style={{ ...styles.notice, background: "#f6f8fb", color: "#718096" }}>
                  Saatları görmək üçün əvvəlcə həkim seçin.
                </div>
              ) : loadingSlots ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: 16,
                    color: "#718096",
                    fontSize: 13,
                  }}
                >
                  <LoaderCircle size={17} />
                  İş qrafiki və boş saatlar yüklənir...
                </div>
              ) : daySchedules.length === 0 ? (
                <div
                  style={{
                    ...styles.notice,
                    background: "#fff8eb",
                    color: "#975a16",
                    border: "1px solid #fce7c2",
                    marginBottom: 0,
                  }}
                >
                  Bu gün həkimin iş qrafiki yoxdur. Başqa tarix seçin.
                </div>
              ) : availableSlots.length === 0 ? (
                <div
                  style={{
                    ...styles.notice,
                    background: "#f6f8fb",
                    color: "#718096",
                    marginBottom: 0,
                  }}
                >
                  Bu gün üçün boş saat qalmayıb. Başqa tarix seçin.
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))",
                      gap: 9,
                    }}
                  >
                    {availableSlots.map((time) => (
                      <button
                        type="button"
                        key={time}
                        className={`booking-slot ${
                          selectedTime === time ? "selected" : ""
                        }`}
                        aria-pressed={selectedTime === time}
                        onClick={() => {
                          setSelectedTime(time);
                          setError("");
                          setSuccess("");
                        }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  <p style={{ fontSize: 11, color: "#8a96a8", margin: "10px 0 0" }}>
                    Yalnız gələcəkdə olan və rezerv edilməmiş saatlar göstərilir.
                  </p>
                </>
              )}
            </div>

            <div style={styles.field}>
              <label htmlFor="booking-notes" style={styles.label}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <FileText size={15} />
                  Əlavə qeyd (istəyə bağlı)
                </span>
              </label>

              <textarea
                id="booking-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Şikayətiniz və ya həkimə bildirmək istədiyiniz məlumat..."
                rows={4}
                maxLength={1000}
                style={{
                  ...styles.input,
                  resize: "vertical",
                  lineHeight: 1.6,
                }}
              />
            </div>

            <button
              type="submit"
              disabled={
                submitting ||
                loadingDoctors ||
                loadingSlots ||
                !doctorId ||
                !selectedTime
              }
              style={{
                ...styles.primaryButton,
                opacity:
                  submitting ||
                  loadingDoctors ||
                  loadingSlots ||
                  !doctorId ||
                  !selectedTime
                    ? 0.65
                    : 1,
                cursor:
                  submitting ||
                  loadingDoctors ||
                  loadingSlots ||
                  !doctorId ||
                  !selectedTime
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {submitting ? (
                <>
                  <LoaderCircle size={18} />
                  Sorğu göndərilir...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Qəbul üçün rezerv et
                </>
              )}
            </button>
          </div>

          <div style={{ display: "grid", gap: 18 }}>
            <div
              className="booking-card"
              style={{
                ...styles.card,
                background: "linear-gradient(145deg, #1769e0, #124da8)",
                color: "#fff",
                border: 0,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -30,
                  top: -40,
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                }}
              />

              <div style={{ position: "relative" }}>
                <div
                  style={{
                    display: "inline-flex",
                    padding: 11,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.14)",
                    marginBottom: 20,
                  }}
                >
                  <CalendarDays size={23} />
                </div>

                <h2 style={{ fontSize: 20, margin: "0 0 9px", fontWeight: 800 }}>
                  Rezervasiyanız
                </h2>

                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.8)",
                    margin: "0 0 23px",
                  }}
                >
                  Seçiminizi yoxlayın və qəbul sorğunuzu göndərin.
                </p>

                <div
                  style={{
                    padding: 15,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.13)",
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginBottom: 7 }}>
                    HƏKİM
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 750 }}>
                    {selectedDoctor ? getDoctorName(selectedDoctor) : "Hələ seçilməyib"}
                  </div>
                  {selectedDoctor && (
                    <div style={{ fontSize: 12, marginTop: 5, color: "rgba(255,255,255,0.8)" }}>
                      {getSpecialty(selectedDoctor)}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: 15,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.13)",
                    borderRadius: 12,
                  }}
                >
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginBottom: 7 }}>
                    TARİX VƏ SAAT
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 750 }}>
                    {selectedDateObject
                      ? `${selectedDateObject.getDate()} ${MONTHS[selectedDateObject.getMonth()]} ${selectedDateObject.getFullYear()}`
                      : "Tarix seçilməyib"}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 5, color: "rgba(255,255,255,0.85)" }}>
                    {selectedTime || "Saat seçilməyib"}
                  </div>
                </div>
              </div>
            </div>

            <div className="booking-card" style={styles.card}>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 18px" }}>
                Rezervasiya qaydaları
              </h3>

              {[
                {
                  title: "Boş saat seçin",
                  description: "Yalnız həkimin iş qrafikinə uyğun saatlar mövcuddur.",
                },
                {
                  title: "Sorğunuz təsdiqlənəcək",
                  description: "Sorğu yaradıldıqdan sonra statusu Pending olacaq.",
                },
                {
                  title: "Bildirişləri izləyin",
                  description: "Həkim təsdiqlədikdə və ya ləğv etdikdə bildiriş alacaqsınız.",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 11,
                    marginBottom: index === 2 ? 0 : 19,
                  }}
                >
                  <div
                    style={{
                      width: 27,
                      height: 27,
                      flexShrink: 0,
                      borderRadius: "50%",
                      background: "#edf4ff",
                      color: BLUE,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 750, marginBottom: 5 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12, lineHeight: 1.65, color: "#718096" }}>
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
