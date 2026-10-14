
import { useEffect, useMemo, useState } from "react";
import {
  Star,
  MessageSquare,
  Users,
  TrendingUp,
  Search,
  Trash2,
  RefreshCw,
  CalendarDays,
  UserRound,
  Stethoscope,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";
import "./Ratings.css";

export default function AdminReviews() {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadRatings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/DoctorRatings");
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : data?.ratings || [];

      setRatings(list);
      setTotalRatings(data?.totalRatings ?? list.length);

      const average =
        data?.averageRating ??
        (list.length
          ? list.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
            list.length
          : 0);

      setAverageRating(Number(average));
    } catch (err) {
      console.error("Reviews yüklənmədi:", err);

      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? "Bu səhifəyə baxmaq üçün Admin hesabı ilə daxil olmalısan."
          : "Rəyləri yükləmək mümkün olmadı. Backend və API bağlantısını yoxla."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRatings();
  }, []);

  const filteredRatings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return ratings.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.patientName || "").toLowerCase().includes(query) ||
        String(item.doctorName || "").toLowerCase().includes(query) ||
        String(item.comment || "").toLowerCase().includes(query);

      const matchesRating =
        ratingFilter === "all" ||
        Number(item.rating) === Number(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [ratings, search, ratingFilter]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Bu rəyi silmək istədiyinə əminsən? Bu əməliyyat geri qaytarılmır."
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      await api.delete(`/DoctorRatings/${id}`);

      const updatedRatings = ratings.filter((item) => item.id !== id);
      setRatings(updatedRatings);
      setTotalRatings(updatedRatings.length);

      const average = updatedRatings.length
        ? updatedRatings.reduce(
            (sum, item) => sum + Number(item.rating || 0),
            0
          ) / updatedRatings.length
        : 0;

      setAverageRating(average);
    } catch (err) {
      console.error("Rəy silinmədi:", err);

      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? "Rəyi silmək üçün Admin icazəsi lazımdır."
          : "Rəyi silmək mümkün olmadı. Yenidən cəhd et."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("az-AZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderStars = (value) => (
    <div className="reviews-stars" aria-label={`${value} / 5 ulduz`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={15}
          fill={star <= Number(value) ? "currentColor" : "none"}
          className={star <= Number(value) ? "star-filled" : "star-empty"}
        />
      ))}
      <span>{Number(value) || 0}.0</span>
    </div>
  );

  return (
    <div className="admin-reviews-page">
      <div className="reviews-header">
        <div>
          <div className="reviews-eyebrow">
            <MessageSquare size={14} />
            HOSPITAL MANAGEMENT
          </div>

          <h1>Patient Reviews</h1>

          <p>
            Pasiyentlərin həkimlər haqqında rəylərini və qiymətləndirmələrini
            idarə et.
          </p>
        </div>

        <button
          className="reviews-refresh-btn"
          type="button"
          onClick={loadRatings}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "reviews-spinning" : ""} />
          Yenilə
        </button>
      </div>

      <div className="reviews-stat-grid">
        <div className="reviews-stat-card">
          <div className="reviews-stat-icon blue">
            <MessageSquare size={21} />
          </div>
          <div className="reviews-stat-content">
            <span>Ümumi rəy sayı</span>
            <strong>{totalRatings}</strong>
            <small>Bütün pasiyent rəyləri</small>
          </div>
        </div>

        <div className="reviews-stat-card">
          <div className="reviews-stat-icon amber">
            <Star size={21} />
          </div>
          <div className="reviews-stat-content">
            <span>Orta reytinq</span>
            <strong>{averageRating.toFixed(1)} <small>/ 5</small></strong>
            <small>Həkimlər üzrə ümumi göstərici</small>
          </div>
        </div>

        <div className="reviews-stat-card">
          <div className="reviews-stat-icon green">
            <Users size={21} />
          </div>
          <div className="reviews-stat-content">
            <span>5 ulduzlu rəylər</span>
            <strong>
              {ratings.filter((item) => Number(item.rating) === 5).length}
            </strong>
            <small>Ən yüksək qiymətləndirmələr</small>
          </div>
        </div>

        <div className="reviews-stat-card">
          <div className="reviews-stat-icon purple">
            <TrendingUp size={21} />
          </div>
          <div className="reviews-stat-content">
            <span>Göstərilən rəylər</span>
            <strong>{filteredRatings.length}</strong>
            <small>Seçilmiş filtrə uyğun</small>
          </div>
        </div>
      </div>

      {error && (
        <div className="reviews-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            Bağla
          </button>
        </div>
      )}

      <section className="reviews-panel">
        <div className="reviews-panel-heading">
          <div>
            <h2>Rəylər siyahısı</h2>
            <p>Pasiyentlərin verdiyi qiymətləndirmələr</p>
          </div>

          <span className="reviews-count-badge">
            {filteredRatings.length} rəy
          </span>
        </div>

        <div className="reviews-filters">
          <div className="reviews-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Pasiyent, həkim və ya rəy axtar..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            aria-label="Reytinqə görə filtr"
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
          >
            <option value="all">Bütün reytinqlər</option>
            <option value="5">5 ulduz</option>
            <option value="4">4 ulduz</option>
            <option value="3">3 ulduz</option>
            <option value="2">2 ulduz</option>
            <option value="1">1 ulduz</option>
          </select>
        </div>

        {loading ? (
          <div className="reviews-state">
            <RefreshCw size={27} className="reviews-spinning" />
            <strong>Rəylər yüklənir...</strong>
            <span>Zəhmət olmasa gözlə.</span>
          </div>
        ) : filteredRatings.length === 0 ? (
          <div className="reviews-state">
            <div className="reviews-empty-icon">
              <MessageSquare size={27} />
            </div>
            <strong>
              {ratings.length === 0
                ? "Hələ rəy yoxdur"
                : "Uyğun rəy tapılmadı"}
            </strong>
            <span>
              {ratings.length === 0
                ? "Pasiyentlər rəy yazdıqdan sonra burada görünəcək."
                : "Axtarışı və ya reytinq filtrini dəyiş."}
            </span>
          </div>
        ) : (
          <div className="reviews-table-wrap">
            <table className="reviews-table">
              <thead>
                <tr>
                  <th>Pasiyent</th>
                  <th>Həkim</th>
                  <th>Reytinq</th>
                  <th>Rəy</th>
                  <th>Tarix</th>
                  <th>Əməliyyat</th>
                </tr>
              </thead>

              <tbody>
                {filteredRatings.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="reviews-person">
                        <div className="reviews-person-avatar patient-avatar">
                          <UserRound size={17} />
                        </div>
                        <div>
                          <strong>{item.patientName || "Pasiyent"}</strong>
                          <span>#{item.patientId ?? "—"}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="reviews-person">
                        <div className="reviews-person-avatar doctor-avatar">
                          <Stethoscope size={17} />
                        </div>
                        <div>
                          <strong>{item.doctorName || "Həkim"}</strong>
                          <span>Qəbul #{item.appointmentId ?? "—"}</span>
                        </div>
                      </div>
                    </td>

                    <td>{renderStars(item.rating)}</td>

                    <td>
                      <div className="reviews-comment">
                        {item.comment || "Şərh qeyd edilməyib."}
                      </div>
                    </td>

                    <td>
                      <div className="reviews-date">
                        <CalendarDays size={15} />
                        {formatDate(item.createdAt)}
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="reviews-delete-btn"
                        title="Rəyi sil"
                        aria-label="Rəyi sil"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item.id)}
                      >
                        {deletingId === item.id ? (
                          <RefreshCw size={16} className="reviews-spinning" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
