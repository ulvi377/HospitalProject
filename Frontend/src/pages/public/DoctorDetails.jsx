
import { useEffect, useState } from "react";
import {
  Search,
  Stethoscope,
  ArrowRight,
  LoaderCircle,
  UserRound,
  RefreshCw,
  X,
  HeartPulse,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import doctorService from "../../services/doctorService";

// Hərfləri və boşluqları normallaşdırır.
const normalizeText = (value) =>
  String(value ?? "")
    .toLocaleLowerCase("az")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const getDoctorName = (doctor) => {
  return (
    doctor.fullName ||
    doctor.FullName ||
    doctor.name ||
    doctor.Name ||
    [
      doctor.firstName || doctor.FirstName,
      doctor.lastName || doctor.LastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Həkim"
  );
};

const getSpecialty = (doctor) => {
  const specialty =
    doctor.specialty ||
    doctor.Specialty ||
    doctor.specialization ||
    doctor.Specialization;

  return (
    doctor.specialtyName ||
    doctor.SpecialtyName ||
    doctor.specializationName ||
    doctor.SpecializationName ||
    (typeof specialty === "string"
      ? specialty
      : specialty?.name || specialty?.Name) ||
    "Tibbi mütəxəssis"
  );
};

const getDoctorImage = (doctor) => {
  return (
    doctor.imageUrl ||
    doctor.ImageUrl ||
    doctor.profileImageUrl ||
    doctor.ProfileImageUrl ||
    doctor.image ||
    doctor.Image ||
    doctor.profileImage ||
    doctor.ProfileImage ||
    null
  );
};

const getDoctorId = (doctor) => {
  return (
    doctor.id ??
    doctor.Id ??
    doctor.doctorId ??
    doctor.DoctorId
  );
};

// Məsələn: "Elvin kardioloq"
// Həm adı, həm də ixtisası birlikdə yoxlanılır.
const matchesDoctorSearch = (doctor, query) => {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  const name = normalizeText(getDoctorName(doctor));
  const specialty = normalizeText(getSpecialty(doctor));

  const searchText = `${name} ${specialty}`;

  const words = normalizedQuery
    .split(/\s+/)
    .filter(Boolean);

  return words.every((word) => searchText.includes(word));
};

// API cavabından həkim siyahısını çıxarır.
const getDoctorsArray = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  const candidates = [
    response?.data,
    response?.items,
    response?.results,
    response?.doctors,
    response?.$values,
    response?.data?.items,
    response?.data?.results,
    response?.data?.doctors,
    response?.data?.$values,
  ];

  return candidates.find(Array.isArray) || [];
};

// Həkimin şəkli olmadıqda alternativ görünüş göstərir.
const DoctorImage = ({ doctor, name }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const image = getDoctorImage(doctor);

  return (
    <div className="relative flex h-72 items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-100 sm:h-80">
      {image && !imageFailed ? (
        <img
          src={image}
          alt={name}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white bg-white/80 text-blue-500 shadow-lg">
            <UserRound size={58} strokeWidth={1.3} />
          </div>

          <span className="text-sm font-medium text-slate-500">
            Avropa Hospital
          </span>
        </div>
      )}

      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">
        <HeartPulse size={15} />
        Həkimlərimiz
      </div>
    </div>
  );
};

const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const specialtyFromUrl =
    searchParams.get("specialty") || "";

  const searchFromUrl =
    searchParams.get("search") || "";

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState(searchFromUrl);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // URL-dən gələn axtarış sözünü inputda göstərir.
  useEffect(() => {
    setSearch(searchFromUrl);
  }, [searchFromUrl]);

  // Həkimləri API-dən yükləyir.
  // Axtarış hər dəyişəndə API sorğusu göndərilmir.
  useEffect(() => {
    let cancelled = false;

    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        if (specialtyFromUrl.trim()) {
          params.specialty = specialtyFromUrl.trim();
        }

        const response = await doctorService.getAll(params);

        if (cancelled) {
          return;
        }

        setDoctors(getDoctorsArray(response));
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Doctors loading error:", err);

        setDoctors([]);
        setError(
          "Həkim məlumatlarını yükləmək mümkün olmadı. Backend serverinin işlədiyini yoxlayın."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDoctors();

    return () => {
      cancelled = true;
    };
  }, [specialtyFromUrl, reloadKey]);

  // Axtarış sözünü URL-də saxlayır.
  const handleSearch = (event) => {
    const value = event.target.value;

    setSearch(value);

    const params = new URLSearchParams(searchParams);

    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    setSearchParams(params, { replace: true });
  };

  const clearSearch = () => {
    setSearch("");

    const params = new URLSearchParams(searchParams);
    params.delete("search");

    setSearchParams(params, { replace: true });
  };

  const clearSpecialtyFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("specialty");

    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearch("");
    setSearchParams({});
  };

  const retryLoading = () => {
    setReloadKey((previous) => previous + 1);
  };

  // Axtarış həm həkim adına, həm ixtisasa tətbiq olunur.
  const filteredDoctors = doctors.filter((doctor) => {
    return matchesDoctorSearch(doctor, search);
  });

  return (
    <section className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800">
        <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="absolute -bottom-32 left-1/4 -z-10 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur">
              <HeartPulse size={17} />
              Avropa Hospital
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Sağlamlığınız üçün
              <span className="mt-2 block text-cyan-300">
                doğru mütəxəssis
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100/85 sm:text-lg">
              Təcrübəli həkimlərimizi kəşf edin, ixtisasları
              ilə tanış olun və sizə uyğun mütəxəssisi tapın.
            </p>

            <div className="mt-9 flex flex-wrap gap-4 text-sm text-blue-100">
              <span className="inline-flex items-center gap-2">
                <Stethoscope
                  size={18}
                  className="text-cyan-300"
                />
                Müxtəlif tibbi ixtisaslar
              </span>

              <span className="inline-flex items-center gap-2">
                <HeartPulse
                  size={18}
                  className="text-cyan-300"
                />
                Pasiyent yönümlü xidmət
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
              Tibbi komandamız
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Həkimlərimiz
            </h2>

            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
              Həkimin adını və ixtisasını eyni xanada
              yazaraq sizə uyğun mütəxəssisi tapın.
            </p>
          </div>

          {!loading && !error && (
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
              <Stethoscope
                size={18}
                className="text-blue-600"
              />
              {filteredDoctors.length} həkim
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500">
            <Search
              size={21}
              className="shrink-0 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={handleSearch}
              placeholder="Məsələn: Elvin kardioloq"
              aria-label="Həkim adı və ixtisas üzrə axtarış"
              className="min-w-0 flex-1 bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Axtarışı təmizlə"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {specialtyFromUrl && (
            <div className="mt-3 flex flex-wrap items-center gap-3 px-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                <Stethoscope size={15} />
                {specialtyFromUrl}
              </span>

              <button
                type="button"
                onClick={clearSpecialtyFilter}
                className="text-sm font-semibold text-slate-500 transition hover:text-red-600"
              >
                İxtisas filtrini sil
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
              >
                <div className="h-72 animate-pulse bg-slate-200 sm:h-80" />

                <div className="space-y-4 p-6">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            role="alert"
            className="mt-10 rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <RefreshCw size={30} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Məlumatları yükləmək mümkün olmadı
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
              {error}
            </p>

            <button
              type="button"
              onClick={retryLoading}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <RefreshCw size={17} />
              Yenidən cəhd et
            </button>
          </div>
        )}

        {/* Doctor cards */}
        {!loading &&
          !error &&
          filteredDoctors.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor, index) => {
                const id = getDoctorId(doctor);
                const name = getDoctorName(doctor);
                const specialty = getSpecialty(doctor);

                return (
                  <article
                    key={id ?? `${name}-${index}`}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5"
                  >
                    <DoctorImage
                      doctor={doctor}
                      name={name}
                    />

                    <div className="flex flex-1 flex-col p-6">
                      <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                        <Stethoscope
                          size={16}
                          className="shrink-0"
                        />

                        <span className="line-clamp-2">
                          {specialty}
                        </span>
                      </div>

                      <h3 className="mt-4 text-xl font-bold leading-7 text-slate-950 transition group-hover:text-blue-700">
                        {name}
                      </h3>

                      <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
                        Həkim haqqında ətraflı məlumat əldə edin
                        və tibbi ixtisası ilə tanış olun.
                      </p>

                      {id != null ? (
                        <Link
                          to={`/doctors/${id}`}
                          className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Profilə bax

                          <ArrowRight
                            size={17}
                            className="transition group-hover:translate-x-1"
                          />
                        </Link>
                      ) : (
                        <span className="mt-6 text-sm text-slate-400">
                          Profil identifikatorı mövcud deyil
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        {/* Empty state */}
        {!loading &&
          !error &&
          filteredDoctors.length === 0 && (
            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                <Stethoscope size={36} />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-slate-900">
                Həkim tapılmadı
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                Axtarışınıza uyğun həkim tapılmadı.
                Həkimin adını və ixtisasını yoxlayın
                və ya axtarış sözünü dəyişin.
              </p>

              {(search || specialtyFromUrl) && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <X size={17} />
                  Filtrləri təmizlə
                </button>
              )}
            </div>
          )}
      </div>
    </section>
  );
};

export default Doctors;
