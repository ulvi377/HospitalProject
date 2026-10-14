
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  Search,
  RefreshCw,
  UserRound,
  CalendarDays,
  Star,
  Award,
  MessageSquareText,
  CircleAlert,
} from "lucide-react";

const css = `
.doctor-ratings {
  width: 100%;
  min-width: 0;
  padding: 8px 4px 28px;
  color: #17243b;
  font-family: Inter, "Segoe UI", sans-serif;
}
.doctor-ratings * { box-sizing: border-box; }
.doctor-ratings .heading {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 16px; margin-bottom: 25px;
}
.doctor-ratings .eyebrow {
  color: #5375e7; font-size: 11px; font-weight: 800;
  letter-spacing: 1.7px; margin-bottom: 8px;
}
.doctor-ratings h1 {
  margin: 0; font-size: clamp(25px, 3vw, 32px);
  font-weight: 800; letter-spacing: -1px; color: #15223b;
}
.doctor-ratings .subtitle {
  margin: 8px 0 0; color: #8994a8; font-size: 13px;
}
.doctor-ratings .refresh {
  display: flex; align-items: center; gap: 9px;
  padding: 11px 15px; border: 1px solid #e4eaf3;
  background: white; color: #34435e; border-radius: 12px;
  font-size: 13px; font-weight: 700; cursor: pointer;
}
.doctor-ratings .refresh:hover { background: #f4f7ff; }
.doctor-ratings .refresh:disabled { opacity: .6; cursor: not-allowed; }
.doctor-ratings .stats {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px; margin-bottom: 22px;
}
.doctor-ratings .stat {
  padding: 20px; border: 1px solid #e8edf5;
  border-radius: 16px; background: white;
  box-shadow: 0 5px 20px #1d315005;
}
.doctor-ratings .stat-top {
  display: flex; justify-content: space-between; align-items: center;
  gap: 10px; margin-bottom: 15px;
}
.doctor-ratings .stat-label { color: #8490a5; font-size: 12px; }
.doctor-ratings .stat-icon {
  display: flex; align-items: center; justify-content: center;
  width: 42px; height: 42px; border-radius: 13px;
}
.doctor-ratings .blue { color: #5375e7; background: #edf1ff; }
.doctor-ratings .yellow { color: #d99a20; background: #fff5dc; }
.doctor-ratings .green { color: #1c9a67; background: #e7f8ef; }
.doctor-ratings .stat-value {
  color: #1a2944; font-size: 29px; font-weight: 800;
}
.doctor-ratings .stat-note { margin-top: 6px; color: #9aa3b3; font-size: 11px; }
.doctor-ratings .rating-summary {
  display: grid; grid-template-columns: minmax(190px, .8fr) minmax(0, 1.4fr);
  gap: 24px; padding: 23px; margin-bottom: 22px;
  background: white; border: 1px solid #e8edf5;
  border-radius: 17px; box-shadow: 0 5px 20px #1d315005;
}
.doctor-ratings .average-block {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 10px;
  border-right: 1px solid #edf0f6;
}
.doctor-ratings .average-number {
  color: #17243b; font-size: 52px; font-weight: 800;
  letter-spacing: -2px; line-height: 1.1;
}
.doctor-ratings .stars { display: flex; gap: 4px; margin: 12px 0 8px; }
.doctor-ratings .average-caption {
  color: #8994a8; font-size: 12px; text-align: center;
}
.doctor-ratings .distribution {
  display: flex; flex-direction: column; justify-content: center; gap: 13px;
}
.doctor-ratings .distribution-row {
  display: grid; grid-template-columns: 35px minmax(50px, 1fr) 35px;
  align-items: center; gap: 10px; color: #7c889e; font-size: 12px;
}
.doctor-ratings .distribution-label {
  display: flex; align-items: center; gap: 4px; font-weight: 700;
}
.doctor-ratings .distribution-label svg { color: #f0ae32; }
.doctor-ratings .bar {
  height: 8px; background: #edf0f6; border-radius: 20px; overflow: hidden;
}
.doctor-ratings .bar-fill {
  height: 100%; background: #f0ae32; border-radius: 20px;
  transition: width .3s ease;
}
.doctor-ratings .distribution-count { text-align: right; font-weight: 700; }
.doctor-ratings .panel {
  background: white; border: 1px solid #e8edf5;
  border-radius: 17px; overflow: hidden;
  box-shadow: 0 5px 20px #1d315005;
}
.doctor-ratings .toolbar {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 15px; padding: 21px;
  border-bottom: 1px solid #edf0f6;
}
.doctor-ratings .toolbar h2 {
  margin: 0; color: #1b2943; font-size: 16px; font-weight: 800;
}
.doctor-ratings .toolbar p { margin: 7px 0 0; color: #8994a8; font-size: 12px; }
.doctor-ratings .search {
  display: flex; align-items: center; gap: 9px; padding: 11px 13px;
  border: 1px solid #e5eaf3; border-radius: 11px;
  background: #fbfcff; color: #8793a7;
}
.doctor-ratings .search input {
  width: 220px; min-width: 0; border: 0; outline: 0;
  background: transparent; color: #263550; font-size: 12px;
}
.doctor-ratings .review-list { display: flex; flex-direction: column; }
.doctor-ratings .review { padding: 20px 22px; border-bottom: 1px solid #f0f2f7; }
.doctor-ratings .review:last-child { border-bottom: 0; }
.doctor-ratings .review-top {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 14px;
}
.doctor-ratings .patient { display: flex; align-items: center; gap: 11px; min-width: 0; }
.doctor-ratings .avatar {
  width: 42px; height: 42px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: #edf1ff; color: #5375e7; border-radius: 13px;
}
.doctor-ratings .patient strong {
  display: block; color: #263550; font-size: 13px; overflow-wrap: anywhere;
}
.doctor-ratings .patient small {
  display: flex; align-items: center; gap: 5px;
  margin-top: 5px; color: #909bad; font-size: 11px;
}
.doctor-ratings .review-score {
  display: flex; align-items: center; gap: 3px; flex-shrink: 0; color: #f0ae32;
}
.doctor-ratings .review-score strong { color: #263550; margin-left: 6px; font-size: 14px; }
.doctor-ratings .review-comment {
  margin: 15px 0 0 53px; color: #647189; font-size: 13px;
  line-height: 1.8; overflow-wrap: anywhere; white-space: pre-wrap;
}
.doctor-ratings .review-comment.empty-comment { color: #a1aabc; font-style: italic; }
.doctor-ratings .empty, .doctor-ratings .loading {
  min-height: 220px; display: flex; align-items: center;
  justify-content: center; flex-direction: column; gap: 12px;
  color: #8994a8; font-size: 13px; text-align: center; padding: 25px;
}
.doctor-ratings .empty-icon {
  width: 55px; height: 55px; border-radius: 17px;
  display: flex; align-items: center; justify-content: center;
  background: #eff2ff; color: #5375e7;
}
.doctor-ratings .error {
  margin: 18px; padding: 15px; border: 1px solid #f0d0d2;
  background: #fff7f7; color: #bd4851; border-radius: 11px;
  font-size: 13px; line-height: 1.7;
}
.doctor-ratings .footer {
  padding: 15px 21px; border-top: 1px solid #edf0f6;
  color: #8994a8; font-size: 11px;
}
.doctor-ratings .notice {
  display: flex; align-items: flex-start; gap: 10px; margin-top: 18px;
  padding: 14px 16px; border: 1px solid #e1e9ff; border-radius: 12px;
  background: #f5f7ff; color: #69799b; font-size: 12px; line-height: 1.7;
}
.doctor-ratings .notice svg { flex-shrink: 0; color: #5375e7; margin-top: 2px; }
.doctor-ratings .spin { animation: rating-spin .8s linear infinite; }
@keyframes rating-spin { to { transform: rotate(360deg); } }
@media(max-width:850px) {
  .doctor-ratings .stats { grid-template-columns: 1fr; gap: 10px; }
  .doctor-ratings .rating-summary { grid-template-columns: 1fr; }
  .doctor-ratings .average-block {
    border-right: 0; border-bottom: 1px solid #edf0f6; padding-bottom: 22px;
  }
}
@media(max-width:560px) {
  .doctor-ratings .toolbar { padding: 15px; }
  .doctor-ratings .search { width: 100%; }
  .doctor-ratings .search input { width: 100%; }
  .doctor-ratings .review { padding: 17px 14px; }
  .doctor-ratings .review-comment { margin-left: 0; }
  .doctor-ratings .review-top { gap: 8px; }
}
`;

const formatDate = (value) => {
  if (!value) return "Tarix göstərilməyib";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tarix göstərilməyib";

  return date.toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getPatientName = (item) =>
  item.patientName || item.patient?.fullName || "Pasiyent";

const getRating = (item) => {
  const value = Number(item.rating);
  return Number.isFinite(value) ? Math.min(5, Math.max(0, value)) : 0;
};

export default function Ratings() {
  const [ratings, setRatings] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadRatings() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/DoctorRatings/my");
        const data = response.data;

        if (!active) return;

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.ratings)
          ? data.ratings
          : Array.isArray(data?.ratings?.$values)
          ? data.ratings.$values
          : Array.isArray(data?.$values)
          ? data.$values
          : [];

        setRatings(list);
        setDoctorName(data?.doctorName || "");
      } catch (err) {
        if (!active) return;

        const status = err.response?.status;

        if (status === 401) {
          setError("Sessiyanız bitib və ya daxil olmaq lazımdır. Yenidən giriş edin.");
        } else if (status === 403) {
          setError("Bu səhifəyə yalnız həkim hesabı ilə daxil olmaq mümkündür.");
        } else {
          setError(
            err.response?.data?.message ||
              "Reytinqləri yükləmək mümkün olmadı. Backend-də GET /api/DoctorRatings/my endpoint-ini yoxlayın."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRatings();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const filteredRatings = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return ratings;

    return ratings.filter((item) =>
      [
        getPatientName(item),
        item.comment || "",
        item.appointmentId ?? "",
        getRating(item),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [ratings, search]);

  const averageRating = ratings.length
    ? ratings.reduce((total, item) => total + getRating(item), 0) / ratings.length
    : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = ratings.filter((item) => getRating(item) === star).length;

    return {
      star,
      count,
      percentage: ratings.length ? (count / ratings.length) * 100 : 0,
    };
  });

  return (
    <div className="doctor-ratings">
      <style>{css}</style>

      <header className="heading">
        <div>
          <div className="eyebrow">DOCTOR WORKSPACE</div>
          <h1>Reytinqlərim</h1>
          <p className="subtitle">
            {doctorName
              ? `${doctorName} — pasiyent rəyləri və qiymətləndirmələri`
              : "Pasiyentlərin qiymətləndirmələrini və rəylərini izləyin."}
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
            <span className="stat-label">Orta reytinq</span>
            <div className="stat-icon yellow"><Star size={21} /></div>
          </div>
          <div className="stat-value">
            {loading ? "—" : averageRating.toFixed(1)}
            <span style={{ fontSize: 15, color: "#9aa3b3" }}> / 5</span>
          </div>
          <div className="stat-note">Bütün pasiyent rəylərinin ortalaması</div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">Rəylərin sayı</span>
            <div className="stat-icon blue"><MessageSquareText size={21} /></div>
          </div>
          <div className="stat-value">{loading ? "—" : ratings.length}</div>
          <div className="stat-note">Qəbullardan gələn qiymətləndirmələr</div>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span className="stat-label">5 ulduzlu rəylər</span>
            <div className="stat-icon green"><Award size={21} /></div>
          </div>
          <div className="stat-value">
            {loading ? "—" : ratings.filter((item) => getRating(item) === 5).length}
          </div>
          <div className="stat-note">Ən yüksək qiymət verilən rəylər</div>
        </div>
      </section>

      <section className="rating-summary">
        <div className="average-block">
          <div className="average-number">
            {loading ? "—" : averageRating.toFixed(1)}
          </div>

          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={21}
                fill={!loading && averageRating >= star ? "currentColor" : "none"}
                color={!loading && averageRating >= star ? "#f0ae32" : "#d7dce5"}
              />
            ))}
          </div>

          <div className="average-caption">
            {loading ? "Reytinq hesablanır..." : `${ratings.length} qiymətləndirmə əsasında`}
          </div>
        </div>

        <div className="distribution">
          {distribution.map((item) => (
            <div className="distribution-row" key={item.star}>
              <span className="distribution-label">
                {item.star} <Star size={13} fill="currentColor" />
              </span>
              <div className="bar">
                <div
                  className="bar-fill"
                  style={{ width: loading ? "0%" : `${item.percentage}%` }}
                />
              </div>
              <span className="distribution-count">{loading ? "—" : item.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="toolbar">
          <div>
            <h2>Pasiyent rəyləri</h2>
            <p>Pasiyentlərin yazdığı rəyləri və verdiyi ulduzları görün.</p>
          </div>

          <label className="search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pasiyent və ya rəy axtar..."
            />
          </label>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">
            <RefreshCw size={25} className="spin" />
            Reytinqlər yüklənir...
          </div>
        ) : !error && filteredRatings.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><MessageSquareText size={26} /></div>
            <strong>{search ? "Rəy tapılmadı" : "Hələ rəy yoxdur"}</strong>
            <span>
              {search
                ? "Axtarış sözünü dəyişərək yenidən yoxlayın."
                : "Tamamlanmış qəbullardan pasiyentlər rəy yazdıqda burada görünəcək."}
            </span>
          </div>
        ) : !error ? (
          <div className="review-list">
            {filteredRatings.map((item, index) => {
              const rating = getRating(item);

              return (
                <article className="review" key={item.id ?? item.appointmentId ?? index}>
                  <div className="review-top">
                    <div className="patient">
                      <div className="avatar"><UserRound size={19} /></div>
                      <div>
                        <strong>{getPatientName(item)}</strong>
                        <small>
                          <CalendarDays size={12} />
                          {formatDate(item.createdAt)}
                        </small>
                      </div>
                    </div>

                    <div className="review-score" aria-label={`${rating} ulduz`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          fill={star <= rating ? "currentColor" : "none"}
                          color={star <= rating ? "#f0ae32" : "#d7dce5"}
                        />
                      ))}
                      <strong>{rating}/5</strong>
                    </div>
                  </div>

                  <p className={`review-comment ${!item.comment ? "empty-comment" : ""}`}>
                    {item.comment || "Şərh yazılmayıb."}
                  </p>
                </article>
              );
            })}
          </div>
        ) : null}

        <div className="footer">
          Göstərilir: {loading ? "—" : filteredRatings.length} rəy
        </div>
      </section>

      <div className="notice">
        <CircleAlert size={17} />
        <span>
          Bu səhifədə yalnız sizin həkim hesabınıza aid reytinqlər göstərilir.
          Reytinqlər tamamlanmış qəbullardan yazılmış rəylərə əsaslanır.
        </span>
      </div>
    </div>
  );
}

