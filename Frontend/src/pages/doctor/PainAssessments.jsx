
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  Search,
  RefreshCw,
  UserRound,
  CalendarDays,
  Activity,
  HeartPulse,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";

const css = `
.doctor-pain {
  width:100%; min-width:0; padding:8px 4px 28px;
  color:#17243b; font-family:Inter,"Segoe UI",sans-serif;
}
.doctor-pain * { box-sizing:border-box; }
.doctor-pain .heading {
  display:flex; justify-content:space-between; align-items:center;
  flex-wrap:wrap; gap:16px; margin-bottom:25px;
}
.doctor-pain .eyebrow {
  color:#5375e7; font-size:11px; font-weight:800;
  letter-spacing:1.7px; margin-bottom:8px;
}
.doctor-pain h1 {
  margin:0; font-size:clamp(25px,3vw,32px);
  font-weight:800; letter-spacing:-1px; color:#15223b;
}
.doctor-pain .subtitle {
  margin:8px 0 0; color:#8994a8; font-size:13px;
}
.doctor-pain .refresh {
  display:flex; align-items:center; gap:9px;
  padding:11px 15px; border:1px solid #e4eaf3;
  background:white; color:#34435e; border-radius:12px;
  font-size:13px; font-weight:700; cursor:pointer;
}
.doctor-pain .refresh:hover { background:#f4f7ff; }
.doctor-pain .stats {
  display:grid; grid-template-columns:repeat(3,minmax(0,1fr));
  gap:15px; margin-bottom:22px;
}
.doctor-pain .stat {
  padding:19px; border:1px solid #e8edf5;
  border-radius:16px; background:white;
  box-shadow:0 5px 20px #1d315005;
}
.doctor-pain .stat-top {
  display:flex; justify-content:space-between; align-items:center;
  gap:10px; margin-bottom:15px;
}
.doctor-pain .stat-label { color:#8490a5; font-size:12px; }
.doctor-pain .stat-icon {
  display:flex; align-items:center; justify-content:center;
  width:40px; height:40px; border-radius:13px;
}
.doctor-pain .blue { color:#5375e7; background:#edf1ff; }
.doctor-pain .green { color:#1c9a67; background:#e7f8ef; }
.doctor-pain .red { color:#d45b65; background:#fff0f0; }
.doctor-pain .stat-value {
  color:#1a2944; font-size:28px; font-weight:800;
}
.doctor-pain .stat-note {
  margin-top:6px; color:#9aa3b3; font-size:11px;
}
.doctor-pain .panel {
  background:white; border:1px solid #e8edf5;
  border-radius:17px; overflow:hidden;
  box-shadow:0 5px 20px #1d315005;
}
.doctor-pain .toolbar {
  display:flex; justify-content:space-between; align-items:center;
  flex-wrap:wrap; gap:15px; padding:21px;
  border-bottom:1px solid #edf0f6;
}
.doctor-pain .toolbar h2 {
  margin:0; color:#1b2943; font-size:16px; font-weight:800;
}
.doctor-pain .toolbar p {
  margin:7px 0 0; color:#8994a8; font-size:12px;
}
.doctor-pain .search {
  display:flex; align-items:center; gap:9px; padding:11px 13px;
  border:1px solid #e5eaf3; border-radius:11px;
  background:#fbfcff; color:#8793a7;
}
.doctor-pain .search input {
  width:220px; min-width:0; border:0; outline:0;
  background:transparent; color:#263550; font-size:12px;
}
.doctor-pain .table-wrap { width:100%; overflow-x:auto; }
.doctor-pain table {
  width:100%; border-collapse:collapse; text-align:left; font-size:12px;
}
.doctor-pain th {
  padding:15px 18px; color:#7f8ba0; background:#f8faff;
  border-bottom:1px solid #e9edf5; font-size:10px;
  font-weight:800; text-transform:uppercase; letter-spacing:.5px;
  white-space:nowrap;
}
.doctor-pain td {
  padding:16px 18px; color:#46546c;
  border-bottom:1px solid #f0f2f7; vertical-align:middle;
}
.doctor-pain tbody tr:hover { background:#f9faff; }
.doctor-pain tbody tr:last-child td { border-bottom:0; }
.doctor-pain .patient {
  display:flex; align-items:center; gap:10px; min-width:150px;
}
.doctor-pain .avatar {
  width:38px; height:38px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  background:#edf1ff; color:#5375e7; border-radius:12px;
}
.doctor-pain .patient strong {
  display:block; color:#263550; font-size:12px;
}
.doctor-pain .patient small {
  display:block; margin-top:4px; color:#909bad; font-size:10px;
}
.doctor-pain .pain-level {
  display:flex; align-items:center; gap:9px; min-width:125px;
}
.doctor-pain .pain-number {
  font-size:15px; font-weight:800; min-width:24px;
}
.doctor-pain .pain-track {
  width:75px; height:6px; overflow:hidden;
  background:#edf0f6; border-radius:10px;
}
.doctor-pain .pain-fill { height:100%; border-radius:10px; }
.doctor-pain .pain-label {
  display:inline-flex; align-items:center; gap:5px;
  padding:6px 9px; border-radius:20px;
  font-size:10px; font-weight:800; white-space:nowrap;
}
.doctor-pain .level-low { color:#178354; background:#e6f8ef; }
.doctor-pain .level-medium { color:#a97113; background:#fff4df; }
.doctor-pain .level-high { color:#cc4c58; background:#fff0f0; }
.doctor-pain .date {
  display:flex; align-items:center; gap:7px; white-space:nowrap;
}
.doctor-pain .date svg { color:#8798b8; }
.doctor-pain .area {
  max-width:180px; overflow-wrap:anywhere;
  color:#43516a; font-weight:600;
}
.doctor-pain .notes {
  max-width:230px; color:#7b879b; line-height:1.6;
  overflow-wrap:anywhere;
}
.doctor-pain .empty,
.doctor-pain .loading {
  min-height:230px; display:flex; align-items:center;
  justify-content:center; flex-direction:column; gap:12px;
  color:#8994a8; font-size:13px; text-align:center; padding:25px;
}
.doctor-pain .empty-icon {
  width:55px; height:55px; border-radius:17px;
  display:flex; align-items:center; justify-content:center;
  background:#eff2ff; color:#5375e7;
}
.doctor-pain .error {
  margin:18px; padding:15px; border:1px solid #f0d0d2;
  background:#fff7f7; color:#bd4851; border-radius:11px; font-size:13px;
}
.doctor-pain .footer {
  padding:15px 21px; border-top:1px solid #edf0f6;
  color:#8994a8; font-size:11px;
}
.doctor-pain .notice {
  display:flex; align-items:flex-start; gap:10px;
  margin-top:18px; padding:14px 16px;
  border:1px solid #e1e9ff; border-radius:12px;
  background:#f5f7ff; color:#69799b; font-size:12px; line-height:1.7;
}
.doctor-pain .notice svg { flex-shrink:0; color:#5375e7; margin-top:2px; }
.doctor-pain .spin { animation:pain-spin .8s linear infinite; }
@keyframes pain-spin { to { transform:rotate(360deg); } }
@media(max-width:1000px) {
  .doctor-pain .stats { grid-template-columns:1fr; gap:10px; }
}
@media(max-width:560px) {
  .doctor-pain .toolbar { padding:15px; }
  .doctor-pain .search { width:100%; }
  .doctor-pain .search input { width:100%; }
}
`;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function getPatientName(item) {
  return (
    item.patient?.fullName ||
    item.patientName ||
    (item.patientId != null ? `Pasiyent #${item.patientId}` : "Pasiyent")
  );
}

function getPainScore(item) {
  const value = Number(
    item.painLevel ??
      item.painScore ??
      item.severity ??
      item.score ??
      item.level
  );

  return Number.isFinite(value) ? Math.max(0, Math.min(10, value)) : null;
}

function getPainArea(item) {
  return (
    item.painArea?.name ||
    item.painAreaName ||
    item.bodyPart ||
    item.location ||
    item.area ||
    "Nahiyə qeyd edilməyib"
  );
}

function getPainNotes(item) {
  return (
    item.notes ||
    item.description ||
    item.symptoms ||
    item.comments ||
    "Əlavə qeyd yoxdur"
  );
}

function getLevel(score) {
  if (score === null) return { label: "Qiymətləndirilməyib", className: "level-medium" };
  if (score <= 3) return { label: "Yüngül", className: "level-low" };
  if (score <= 6) return { label: "Orta", className: "level-medium" };
  return { label: "Güclü", className: "level-high" };
}

export default function PainAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadAssessments() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/PainAssessment");

        if (active) {
          const data = Array.isArray(response.data)
            ? response.data
            : response.data?.$values || [];

          setAssessments(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Ağrı qiymətləndirmələrini yükləmək mümkün olmadı. Backend-də PainAssessment endpoint-ini və həkim icazəsini yoxlayın."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAssessments();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const filteredAssessments = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return assessments;

    return assessments.filter((item) => {
      const searchable = [
        item.id,
        getPatientName(item),
        getPainArea(item),
        getPainNotes(item),
        getPainScore(item),
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [assessments, search]);

  const scores = assessments
    .map(getPainScore)
    .filter((score) => score !== null);

  const averageScore = scores.length
    ? (scores.reduce((total, score) => total + score, 0) / scores.length).toFixed(1)
    : "—";

  const highPainCount = assessments.filter((item) => {
    const score = getPainScore(item);
    return score !== null && score >= 7;
  }).length;

  return (
    <div className="doctor-pain">
      <style>{css}</style>

      <header className="heading">
        <div>
          <div className="eyebrow">DOCTOR WORKSPACE</div>
          <h1>Ağrı qiymətləndirməsi</h1>
          <p className="subtitle">
            Pasiyentlərin bildirdiyi ağrı səviyyələrini və qeydlərini izləyin.
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
            <span className="stat-label">Qiymətləndirmələr</span>
            <div className="stat-icon blue"><ClipboardList size={20} /></div>
          </div>
          <div className="stat-value">
            {loading ? "—" : assessments.length}
          </div>
          <div className="stat-note">Ümumi qiymətləndirmə qeydləri</div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Orta ağrı səviyyəsi</span>
            <div className="stat-icon green"><HeartPulse size={20} /></div>
          </div>
          <div className="stat-value">
            {loading ? "—" : `${averageScore}${averageScore !== "—" ? "/10" : ""}`}
          </div>
          <div className="stat-note">Məlumatı olan qeydlərin ortalaması</div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Yüksək ağrı səviyyəsi</span>
            <div className="stat-icon red"><AlertTriangle size={20} /></div>
          </div>
          <div className="stat-value">{loading ? "—" : highPainCount}</div>
          <div className="stat-note">7 və daha yüksək qiymət verilən qeydlər</div>
        </div>
      </section>

      <section className="panel">
        <div className="toolbar">
          <div>
            <h2>Qiymətləndirmə tarixçəsi</h2>
            <p>Pasiyent, ağrı nahiyəsi və bal üzrə axtarış edin.</p>
          </div>

          <label className="search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pasiyent və ya nahiyə..."
            />
          </label>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">
            <RefreshCw size={25} className="spin" />
            Qiymətləndirmələr yüklənir...
          </div>
        ) : !error && filteredAssessments.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><HeartPulse size={27} /></div>
            <strong>
              {search
                ? "Qiymətləndirmə tapılmadı"
                : "Hələ qiymətləndirmə yoxdur"}
            </strong>
            <span>
              {search
                ? "Axtarış sözünü dəyişərək yenidən yoxlayın."
                : "Yeni qiymətləndirmələr əlavə olunduqda burada görünəcək."}
            </span>
          </div>
        ) : !error ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pasiyent</th>
                  <th>Ağrı səviyyəsi</th>
                  <th>Nahiyə</th>
                  <th>Tarix</th>
                  <th>Qeydlər</th>
                </tr>
              </thead>

              <tbody>
                {filteredAssessments.map((item, index) => {
                  const score = getPainScore(item);
                  const level = getLevel(score);
                  const dateValue =
                    item.assessmentDate ||
                    item.createdAt ||
                    item.date ||
                    item.createdDate;

                  const fillColor =
                    score === null
                      ? "#aab3c3"
                      : score <= 3
                      ? "#1c9a67"
                      : score <= 6
                      ? "#d9952e"
                      : "#d45b65";

                  return (
                    <tr key={item.id ?? item.Id ?? index}>
                      <td>
                        <div className="patient">
                          <div className="avatar"><UserRound size={18} /></div>
                          <div>
                            <strong>{getPatientName(item)}</strong>
                            <small>
                              Pasiyent ID: {item.patientId ?? item.patient?.id ?? "—"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="pain-level">
                          <span className="pain-number">
                            {score === null ? "—" : score}
                          </span>
                          <div className="pain-track">
                            <div
                              className="pain-fill"
                              style={{
                                width: `${score === null ? 0 : score * 10}%`,
                                background: fillColor,
                              }}
                            />
                          </div>
                        </div>
                        <span className={`pain-label ${level.className}`}>
                          {level.label}
                        </span>
                      </td>

                      <td>
                        <div className="area">{getPainArea(item)}</div>
                      </td>

                      <td>
                        <div className="date">
                          <CalendarDays size={15} />
                          {formatDate(dateValue)}
                        </div>
                      </td>

                      <td>
                        <div className="notes">{getPainNotes(item)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="footer">
          Göstərilir: {loading ? "—" : filteredAssessments.length} qeyd
        </div>
      </section>

      <div className="notice">
        <CircleAlert size={17} />
        <span>
          Ağrı səviyyələri 0–10 şkalası ilə göstərilir. Bu məlumatlar yalnız
          tibbi qiymətləndirmə qeydləridir və ayrıca klinik qərarı əvəz etmir.
        </span>
      </div>
    </div>
  );
}
