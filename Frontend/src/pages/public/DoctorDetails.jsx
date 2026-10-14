import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Stethoscope,
  GraduationCap,
  BriefcaseMedical,
  Star,
  MessageCircle,
  HeartPulse,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";

const getValue = (obj, ...keys) => {
  for (const key of keys) {
    if (
      obj?.[key] !== undefined &&
      obj?.[key] !== null &&
      obj[key] !== ""
    ) {
      return obj[key];
    }
  }

  return null;
};

const getName = (doctor) => {
  const fullName = getValue(
    doctor,
    "fullName",
    "FullName",
    "name",
    "Name"
  );

  if (fullName) return fullName;

  const firstName = getValue(doctor, "firstName", "FirstName") || "";
  const lastName = getValue(doctor, "lastName", "LastName") || "";

  return `${firstName} ${lastName}`.trim() || "Həkim";
};

const getSpecialty = (doctor) => {
  const value = getValue(
    doctor,
    "specialtyName",
    "SpecialtyName",
    "specializationName",
    "SpecializationName"
  );

  if (value) return value;

  const specialty = getValue(
    doctor,
    "specialty",
    "Specialty",
    "specialization",
    "Specialization"
  );

  if (typeof specialty === "string") return specialty;

  return (
    getValue(specialty, "name", "Name") ||
    "Tibbi mütəxəssis"
  );
};

const getImage = (doctor) =>
  getValue(
    doctor,
    "imageUrl",
    "ImageUrl",
    "profileImageUrl",
    "ProfileImageUrl",
    "image",
    "Image",
    "profileImage",
    "ProfileImage"
  );

const getArray = (response) => {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;

  return (
    data?.ratings ||
    data?.Ratings ||
    data?.items ||
    data?.Items ||
    data?.$values ||
    []
  );
};

const StarRating = ({ rating = 0, size = 18 }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={
          star <= Math.round(Number(rating))
            ? "fill-amber-400 text-amber-400"
            : "text-slate-300"
        }
      />
    ))}
  </div>
);

export default function DoctorDetails() {
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        setDoctor(null);
        setRatings([]);
        setAverageRating(0);
        setTotalRatings(0);

       const isNumericId = /^\d+$/.test(String(id));

       const doctorResponse = await api.get(
       isNumericId
        ? `/Doctors/${encodeURIComponent(id)}`
        : `/Doctors/by-slug/${encodeURIComponent(id)}`
        );

        if (cancelled) return;

        const doctorData =
          doctorResponse.data?.doctor ??
          doctorResponse.data?.Doctor ??
          doctorResponse.data;

        if (!doctorData || typeof doctorData !== "object") {
          throw new Error("Həkim məlumatları tapılmadı.");
        }

        setDoctor(doctorData);

        // Rəylər üçün verilənlər bazasındakı rəqəmsal ID-dən istifadə et
        const doctorId = getValue(doctorData, "id", "Id");

        if (doctorId !== null) {
          try {
            const ratingsResponse = await api.get(
              `/DoctorRatings/doctor/${doctorId}`
            );

            if (cancelled) return;

            const ratingData = ratingsResponse.data;
            const ratingList = getArray(ratingData);

            setRatings(ratingList);

            setAverageRating(
              Number(
                getValue(
                  ratingData,
                  "averageRating",
                  "AverageRating"
                ) ?? 0
              )
            );

            setTotalRatings(
              Number(
                getValue(
                  ratingData,
                  "totalRatings",
                  "TotalRatings"
                ) ?? ratingList.length
              )
            );
          } catch (ratingError) {
            console.error(
              "Rəyləri yükləmək mümkün olmadı:",
              ratingError
            );
          }
        }
      } catch (err) {
        console.error("Həkim profili xətası:", err);

        if (!cancelled) {
          setError(
            err.response?.status === 404
              ? "Bu slug ilə həkim tapılmadı."
              : "Həkim məlumatlarını yükləmək mümkün olmadı. Backend serverini və API ünvanını yoxlayın."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadProfile();
    } else {
      setError("Həkim profili üçün ünvan məlumatı tapılmadı.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-slate-50">
        <LoaderCircle
          size={42}
          className="animate-spin text-blue-600"
        />
        <p className="font-medium text-slate-600">
          Həkim profili yüklənir...
        </p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <RefreshCw size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            Profil açılmadı
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {error || "Həkim məlumatları tapılmadı."}
          </p>

          <Link
            to="/doctors"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft size={18} />
            Həkimlərə qayıt
          </Link>
        </div>
      </section>
    );
  }

  const name = getName(doctor);
  const specialty = getSpecialty(doctor);
  const image = getImage(doctor);

  const education =
    getValue(
      doctor,
      "education",
      "Education",
      "qualification",
      "Qualification"
    ) || "Təhsil məlumatı əlavə edilməyib";

  const experience = getValue(
    doctor,
    "experience",
    "Experience",
    "experienceYears",
    "ExperienceYears",
    "yearsOfExperience",
    "YearsOfExperience"
  );

  const biography =
    getValue(
      doctor,
      "biography",
      "Biography",
      "bio",
      "Bio",
      "description",
      "Description",
      "about",
      "About"
    ) || "Bu həkim haqqında ətraflı məlumat hələ əlavə edilməyib.";

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Həkimlərə qayıt
          </Link>

          <div className="mt-8 grid gap-8 pb-10 md:grid-cols-[240px_1fr] md:items-center">
            <div className="flex h-60 w-60 max-w-full items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <UserRound
                  size={100}
                  className="text-blue-200"
                  strokeWidth={1.2}
                />
              )}
            </div>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-200">
                <HeartPulse size={17} />
                Avropa Hospital
              </span>

              <h1 className="mt-5 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                {name}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-lg font-medium text-blue-100">
                <Stethoscope
                  size={21}
                  className="text-cyan-300"
                />
                {specialty}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3">
                  <StarRating rating={averageRating} size={17} />
                  <span className="font-bold text-slate-900">
                    {averageRating.toFixed(1)}
                  </span>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white">
                  {totalRatings} pasiyent rəyi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserRound size={22} />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Həkim haqqında
              </h2>
            </div>

            <p className="mt-5 whitespace-pre-line text-sm leading-8 text-slate-600">
              {biography}
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MessageCircle size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Pasiyent rəyləri
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Həkim haqqında paylaşılan qiymətləndirmələr
                </p>
              </div>
            </div>

            {ratings.length > 0 ? (
              <div className="mt-6 space-y-4">
                {ratings.map((review, index) => {
                  const patientName =
                    getValue(
                      review,
                      "patientName",
                      "PatientName"
                    ) || "Pasiyent";

                  const rating = Number(
                    getValue(review, "rating", "Rating") ?? 0
                  );

                  const comment =
                    getValue(review, "comment", "Comment") ||
                    "Şərh yazılmayıb.";

                  const date = getValue(
                    review,
                    "createdAt",
                    "CreatedAt"
                  );

                  return (
                    <article
                      key={getValue(review, "id", "Id") ?? index}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {patientName}
                          </h3>

                          {date && (
                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(date).toLocaleDateString(
                                "az-AZ"
                              )}
                            </p>
                          )}
                        </div>

                        <StarRating rating={rating} size={16} />
                      </div>

                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        {comment}
                      </p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-8 text-center">
                <MessageCircle
                  size={30}
                  className="mx-auto text-slate-400"
                />
                <p className="mt-3 font-semibold text-slate-700">
                  Hələ rəy yoxdur
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Bu həkim üçün pasiyent rəyi əlavə edilməyib.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Peşəkar məlumatlar
            </h2>

            <div className="mt-5 space-y-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Stethoscope size={20} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    İxtisas
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {specialty}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <GraduationCap size={21} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Təhsil
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {education}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BriefcaseMedical size={20} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    İş təcrübəsi
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {experience !== null
                      ? typeof experience === "number"
                        ? `${experience} il`
                        : experience
                      : "Təcrübə məlumatı əlavə edilməyib"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-950 p-6 text-white shadow-lg">
            <HeartPulse
              size={30}
              className="text-cyan-300"
            />

            <h2 className="mt-4 text-xl font-bold">
              Sağlamlığınız önəmlidir
            </h2>

            <p className="mt-3 text-sm leading-7 text-blue-100">
              Həkimlərimiz haqqında ətraflı məlumatla tanış olun.
            </p>

            <Link
              to="/doctors"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-800 transition hover:bg-blue-50"
            >
              Digər həkimlər
              <ArrowLeft
                size={17}
                className="rotate-180"
              />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}