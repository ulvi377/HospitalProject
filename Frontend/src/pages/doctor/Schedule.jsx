
import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  CalendarDays,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Timer,
  Info,
} from "lucide-react";

const css = `
.doctor-schedule {
  width:100%; min-width:0; padding:8px 4px 28px;
  color:#17243b; font-family:Inter,"Segoe UI",sans-serif;
}
.doctor-schedule * { box-sizing:border-box; }
.doctor-schedule .heading {
  display:flex; justify-content:space-between; align-items:center;
  flex-wrap:wrap; gap:16px; margin-bottom:25px;
}
.doctor-schedule .eyebrow {
  color:#5375e7; font-size:11px; font-weight:800;
  letter-spacing:1.7px; margin-bottom:8px;
}
.doctor-schedule h1 {
  margin:0; font-size:clamp(25px,3vw,32px);
  font-weight:800; letter-spacing:-1px; color:#15223b;
}
.doctor-schedule .subtitle {
  margin:8px 0 0; color:#8994a8; font-size:13px;
}
.doctor-schedule .refresh {
  display:flex; align-items:center; gap:9px;
  padding:11px 15px; border:1px solid #e4eaf3;
  background:#fff; color:#34435e; border-radius:12px;
  font-size:13px; font-weight:700; cursor:pointer;
}
.doctor-schedule .refresh:disabled { opacity:.6; cursor:wait; }
.doctor-schedule .refresh:hover { background:#f4f7ff; }
.doctor-schedule .stats {
  display:grid; grid-template-columns:repeat(3,minmax(0,1fr));
  gap:15px; margin-bottom:22px;
}
.doctor-schedule .stat {
  padding:19px; border:1px solid #e8edf5;
  border-radius:16px; background:#fff;
  box-shadow:0 5px 20px #1d315005;
}
.doctor-schedule .stat-top {
  display:flex; align-items:center; justify-content:space-between;
  gap:10px; margin-bottom:15px;
}
.doctor-schedule .stat-label { color:#8490a5; font-size:12px; }
.doctor-schedule .stat-icon {
  display:flex; align-items:center; justify-content:center;
  width:40px; height:40px; border-radius:13px;
}
.doctor-schedule .blue { color:#5375e7; background:#edf1ff; }
.doctor-schedule .green { color:#1c9a67; background:#e7f8ef; }
.doctor-schedule .orange { color:#d9952e; background:#fff3e3; }
.doctor-schedule .stat-value {
  color:#1a2944; font-size:28px; font-weight:800;
}
.doctor-schedule .stat-note {
  margin-top:6px; color:#9aa3b3; font-size:11px;
}
.doctor-schedule .panel {
  background:#fff; border:1px solid #e8edf5;
  border-radius:17px; overflow:hidden;
  box-shadow:0 5px 20px #1d315005; margin-bottom:20px;
}
.doctor-schedule .panel-heading {
  padding:21px; border-bottom:1px solid #edf0f6;
}
.doctor-schedule .panel-heading h2 {
  margin:0; font-size:16px; font-weight:800; color:#1b2943;
}
.doctor-schedule .panel-heading p {
  margin:7px 0 0; font-size:12px; color:#8994a8;
}
.doctor-schedule .schedule-list {
  display:flex; flex-direction:column;
}
.doctor-schedule .day-row {
  display:grid; grid-template-columns:minmax(140px,1fr) 2fr auto;
  align-items:center; gap:18px; padding:18px 21px;
  border-bottom:1px solid #f0f2f7;
}
.doctor-schedule .day-row:last-child { border-bottom:0; }
.doctor-schedule .day-info {
  display:flex; align-items:center; gap:12px;
}
.doctor-schedule .day-icon {
  display:flex; align-items:center; justify-content:center;
  width:42px; height:42px; flex-shrink:0;
  color:#5375e7; background:#edf1ff; border-radius:13px;
}
.doctor-schedule .day-name {
  font-size:13px; font-weight:800; color:#263550;
}
.doctor-schedule .day-small {
  margin-top:5px; font-size:11px; color:#929db0;
}
.doctor-schedule .time-range {
  display:flex; align-items:center; flex-wrap:wrap; gap:10px;
}
.doctor-schedule .time-box {
  display:flex; align-items:center; gap:7px;
  padding:9px 12px; background:#f7f9fd;
  border:1px solid #edf0f6; border-radius:10px;
  color:#43516a; font-size:12px; font-weight:700;
}
.doctor-schedule .time-box svg { color:#7f91b5; }
.doctor-schedule .time-separator { color:#a6afbe; font-size:12px; }
.doctor-schedule .badge {
  display:inline-flex; align-items:center; justify-content:center;
  gap:6px; padding:7px 10px; border-radius:20px;
  font-size:10px; font-weight:800; white-space:nowrap;
}
.doctor-schedule .badge.available { background:#e6f8ef; color:#178354; }
.doctor-schedule .badge.unavailable { background:#f0f2f6; color:#78849a; }
.doctor-schedule .empty,
.doctor-schedule .loading {
  min-height:210px; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:12px;
  text-align:center; padding:25px; color:#8994a8; font-size:13px;
}
.doctor-schedule .empty-icon {
  width:54px; height:54px; display:flex; align-items:center;
  justify-content:center; border-radius:16px;
  background:#eff2ff; color:#5375e7;
}
.doctor-schedule .error {
  padding:15px; margin:18px; border-radius:11px;
  border:1px solid #f0d0d2; background:#fff7f7;
  color:#bd4851; font-size:13px;
}
.doctor-schedule .notice {
  display:flex; align-items:flex-start; gap:12px;
  padding:16px 18px; border-radius:13px;
  background:#f2f6ff; border:1px solid #e0e8ff;
  color:#64769c; font-size:12px; line-height:1.7;
}
.doctor-schedule .notice svg { flex-shrink:0; margin-top:2px; color:#5375e7; }
.doctor-schedule .spin { animation:schedule-spin .8s linear infinite; }
@keyframes schedule-spin { to { transform:rotate(360deg); } }
@media(max-width:850px) {
  .doctor-schedule .stats { grid-template-columns:1fr; gap:10px; }
  .doctor-schedule .day-row { grid-template-columns:1fr; gap:12px; }
  .doctor-schedule .badge { justify-self:start; }
}
@media(max-width:520px) {
  .doctor-schedule .panel-heading { padding:16px; }
  .doctor-schedule .day-row { padding:16px; }
  .doctor-schedule .time-range { gap:7px; }
  .doctor-schedule .time-box { padding:8px; }
}
`;

const DAYS = [
  { value: 0, name: "Bazar", short: "Baz." },
  { value: 1, name: "Bazar ertəsi", short: "B.e." },
  { value: 2, name: "Çərşənbə axşamı", short: "Ç.a." },
  { value: 3, name: "Çərşənbə", short: "Çər." },
  { value: 4, name: "Cümə axşamı", short: "C.a." },
  { value: 5, name: "Cümə", short: "Cüm." },
  { value: 6, name: "Şənbə", short: "Şən." },
];

function formatTime(value) {
  if (!value) return "--:--";

  if (typeof value === "string") {
    const match = value.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      return `${match[1].padStart(2, "0")}:${match[2]}`;
    }
  }

  return "--:--";
}

function getDayNumber(schedule) {
  const value = schedule.dayOfWeek ?? schedule.DayOfWeek;

  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim();
    const byName = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    if (byName[normalized] !== undefined) return byName[normalized];

    const numeric = Number(value);
    if (Number.isInteger(numeric)) return numeric;
  }

  return -1;
}

export default function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadSchedule() {
      setLoading(true);
      setError("");

      try {
        // Backend-də həkim cədvəli üçün istifadə olunan endpoint.
        const response = await api.get("/DoctorSchedule/my");

        if (active) {
          const data = Array.isArray(response.data)
            ? response.data
            : response.data?.$values || [];

          setSchedules(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "İş cədvəlini yükləmək mümkün olmadı. Backend-də DoctorSchedules endpoint-inin mövcudluğunu yoxlayın."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSchedule();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const normalizedSchedules = schedules.map((schedule) => {
    const dayNumber = getDayNumber(schedule);

    return {
      ...schedule,
      dayNumber,
      startTime: schedule.startTime ?? schedule.StartTime,
      endTime: schedule.endTime ?? schedule.EndTime,
      isAvailable: schedule.isAvailable ?? schedule.IsAvailable ?? false,
    };
  });

  const availableDays = normalizedSchedules.filter(
    (schedule) => schedule.isAvailable
  ).length;

  const availableSchedules = normalizedSchedules.filter(
    (schedule) => schedule.isAvailable
  );

  const totalHours = availableSchedules.reduce((total, schedule) => {
    const start = formatTime(schedule.startTime).split(":").map(Number);
    const end = formatTime(schedule.endTime).split(":").map(Number);

    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];

    if (
      !Number.isFinite(startMinutes) ||
      !Number.isFinite(endMinutes) ||
      endMinutes <= startMinutes
    ) {
      return total;
    }

    return total + (endMinutes - startMinutes) / 60;
  }, 0);

  const orderedSchedules = [...normalizedSchedules].sort(
    (a, b) => a.dayNumber - b.dayNumber
  );

  return (
    <div className="doctor-schedule">
      <style>{css}</style>

      <header className="heading">
        <div>
          <div className="eyebrow">DOCTOR WORKSPACE</div>
          <h1>İş cədvəli</h1>
          <p className="subtitle">
            Həftəlik iş günlərinizi və qəbul saatlarınızı izləyin.
          </p>
        </div>

        <button
          className="refresh"
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Yenilə
        </button>
      </header>

      <section className="stats">
        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Cədvəldəki günlər</span>
            <div className="stat-icon blue"><CalendarDays size={20} /></div>
          </div>
          <div className="stat-value">
            {loading ? "—" : normalizedSchedules.length}
          </div>
          <div className="stat-note">Sistemdə qeyd olunmuş iş günləri</div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Aktiv iş günləri</span>
            <div className="stat-icon green"><CalendarCheck size={20} /></div>
          </div>
          <div className="stat-value">{loading ? "—" : availableDays}</div>
          <div className="stat-note">Qəbul üçün aktiv günlər</div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Həftəlik iş saatı</span>
            <div className="stat-icon orange"><Timer size={20} /></div>
          </div>
          <div className="stat-value">
            {loading ? "—" : `${Number(totalHours.toFixed(1))} saat`}
          </div>
          <div className="stat-note">Aktiv cədvəllərin saatlarına əsasən</div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Həftəlik cədvəl</h2>
          <p>İş günləri və qəbul üçün nəzərdə tutulan vaxtlar.</p>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">
            <RefreshCw size={25} className="spin" />
            İş cədvəli yüklənir...
          </div>
        ) : !error && orderedSchedules.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><CalendarDays size={26} /></div>
            <strong>İş cədvəli tapılmadı</strong>
            <span>
              Həkim üçün backend-də iş cədvəli yaradıldıqdan sonra burada görünəcək.
            </span>
          </div>
        ) : !error ? (
          <div className="schedule-list">
            {orderedSchedules.map((schedule, index) => {
              const day = DAYS.find((item) => item.value === schedule.dayNumber);
              const startTime = formatTime(schedule.startTime);
              const endTime = formatTime(schedule.endTime);

              return (
                <div
                  className="day-row"
                  key={schedule.id ?? schedule.Id ?? `${schedule.dayNumber}-${index}`}
                >
                  <div className="day-info">
                    <div className="day-icon"><CalendarDays size={20} /></div>
                    <div>
                      <div className="day-name">
                        {day?.name || `Gün ${schedule.dayNumber}`}
                      </div>
                      <div className="day-small">
                        {schedule.isAvailable ? "İş günü" : "İş günü deyil"}
                      </div>
                    </div>
                  </div>

                  <div className="time-range">
                    <div className="time-box">
                      <Clock size={15} />
                      {startTime}
                    </div>
                    <span className="time-separator">—</span>
                    <div className="time-box">
                      <Clock size={15} />
                      {endTime}
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      schedule.isAvailable ? "available" : "unavailable"
                    }`}
                  >
                    {schedule.isAvailable ? (
                      <><CheckCircle2 size={13} /> Aktiv</>
                    ) : (
                      <><XCircle size={13} /> Bağlıdır</>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      <div className="notice">
        <Info size={18} />
        <span>
          Bu səhifə cədvəli göstərir. Cədvəli dəyişmək və yeni iş saatları əlavə
          etmək üçün backend-də həkimin öz cədvəlini idarə etməsinə icazə verən
          endpoint olmalıdır. Hazırda səhifə məlumatları yalnız oxuyur.
        </span>
      </div>
    </div>
  );
}
