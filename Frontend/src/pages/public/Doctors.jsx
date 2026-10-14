import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  UserRound,
  Stethoscope,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  X,
  ShieldCheck,
  HeartPulse,
  CalendarCheck,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  Activity,
} from "lucide-react";

import doctorService from "../../services/doctorService";

const normalizeText = (value) =>
  String(value ?? "")
    .toLocaleLowerCase("az")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getDoctorName = (doctor) => {
  const fullName =
    doctor?.fullName ??
    doctor?.FullName ??
    doctor?.name ??
    doctor?.Name;

  if (fullName) return String(fullName);

  const firstName = doctor?.firstName ?? doctor?.FirstName ?? "";
  const lastName = doctor?.lastName ?? doctor?.LastName ?? "";
  const middleName = doctor?.middleName ?? doctor?.MiddleName ?? "";

  return (
    [firstName, middleName, lastName].filter(Boolean).join(" ").trim() ||
    "Həkim"
  );
};

const getSpecialty = (doctor) => {
  const specialty =
    doctor?.specialtyName ??
    doctor?.SpecialtyName ??
    doctor?.specializationName ??
    doctor?.SpecializationName ??
    doctor?.specialty ??
    doctor?.Specialty ??
    doctor?.specialization ??
    doctor?.Specialization ??
    doctor?.departmentName ??
    doctor?.DepartmentName ??
    doctor?.department ??
    doctor?.Department;

  if (typeof specialty === "string") return specialty;

  if (specialty && typeof specialty === "object") {
    return (
      specialty.name ??
      specialty.Name ??
      specialty.title ??
      specialty.Title ??
      specialty.specialtyName ??
      specialty.SpecialtyName ??
      ""
    );
  }

  return "";
};

const getDoctorImage = (doctor) =>
  doctor?.imageUrl ??
  doctor?.ImageUrl ??
  doctor?.photoUrl ??
  doctor?.PhotoUrl ??
  doctor?.profileImageUrl ??
  doctor?.ProfileImageUrl ??
  doctor?.profileImage ??
  doctor?.ProfileImage ??
  doctor?.image ??
  doctor?.Image ??
  doctor?.photo ??
  doctor?.Photo ??
  doctor?.avatar ??
  doctor?.Avatar ??
  "";

const getDoctorId = (doctor) =>
  doctor?.id ??
  doctor?.Id ??
  doctor?.doctorId ??
  doctor?.DoctorId;

const getDoctorSlug = (doctor) =>
  doctor?.slug ??
  doctor?.Slug ??
  doctor?.doctorSlug ??
  doctor?.DoctorSlug ??
  "";

const getDoctorsArray = (response) => {
  const candidates = [
    response?.data,
    response?.data?.items,
    response?.data?.Items,
    response?.data?.doctors,
    response?.data?.Doctors,
    response?.data?.$values,
    response?.items,
    response?.Items,
    response?.doctors,
    response?.Doctors,
    response?.results,
    response?.Results,
    response?.$values,
    response,
  ];

  return candidates.find(Array.isArray) ?? [];
};

const getSearchableText = (value, depth = 0) => {
  if (value == null || depth > 5) return "";

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => getSearchableText(item, depth + 1))
      .join(" ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([key]) => {
        const normalizedKey = normalizeText(key);
        return ![
          "password",
          "token",
          "access token",
          "refresh token",
        ].includes(normalizedKey);
      })
      .map(([, item]) => getSearchableText(item, depth + 1))
      .join(" ");
  }

  return "";
};

const matchesDoctorSearch = (doctor, query) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;

  const words = normalizedQuery.split(/\s+/).filter(Boolean);

  const searchableText = normalizeText(
    [
      getDoctorName(doctor),
      getSpecialty(doctor),
      getSearchableText(doctor),
    ].join(" ")
  );

  const aliases = {
    kardioloq: ["kardiolog", "cardiologist", "cardiology"],
    kardiolog: ["kardioloq", "cardiologist", "cardiology"],
    terapevt: ["terapiya", "therapist"],
    nevroloq: ["neurolog", "neurology"],
    pediatr: ["pediatriya", "pediatrician", "pediatrics"],
    cerrah: ["surgeon", "surgery"],
    uroloq: ["urolog", "urology"],
    stomatoloq: ["dentist", "dentistry"],
    dermatoloq: ["dermatolog", "dermatologist", "dermatology"],
    ginekoloq: ["gynecologist", "gynecology"],
  };

  return words.every(
    (word) =>
      searchableText.includes(word) ||
      (aliases[word] ?? []).some((alias) =>
        searchableText.includes(normalizeText(alias))
      )
  );
};

function DoctorImage({ doctor }) {
  const [imageError, setImageError] = useState(false);
  const image = getDoctorImage(doctor);

  useEffect(() => {
    setImageError(false);
  }, [image]);

  if (!image || imageError) {
    return (
      <div className="flex h-full min-h-[260px] items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-100">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white bg-white/80 text-blue-300 shadow-sm">
          <UserRound className="h-14 w-14" strokeWidth={1.2} />
        </div>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={getDoctorName(doctor)}
      loading="lazy"
      className="h-full min-h-[260px] w-full object-cover object-top transition duration-700 group-hover:scale-105"
      onError={() => setImageError(true)}
    />
  );
}

export default function Doctors() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const specialtyFromUrl = searchParams.get("specialty") ?? "";

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState(
    searchParams.get("search") ?? ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await doctorService.getAll(
        specialtyFromUrl ? { specialtyId: specialtyFromUrl } : {}
      );

      const list = getDoctorsArray(response);

      setDoctors(
        list.filter(
          (doctor) =>
            doctor?.isActive !== false &&
            doctor?.IsActive !== false
        )
      );
    } catch (err) {
      console.error("Həkimləri yükləmək mümkün olmadı:", err);
      setDoctors([]);
      setError(
        "Həkim məlumatlarını yükləmək mümkün olmadı. Backend serverin işlədiyini yoxlayın."
      );
    } finally {
      setLoading(false);
    }
  }, [specialtyFromUrl, reloadKey]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSearch = matchesDoctorSearch(doctor, search);
      const specialtyName = normalizeText(getSpecialty(doctor));

      const matchesSpecialty =
        !specialtyFromUrl ||
        String(
          doctor?.specialtyId ??
            doctor?.SpecialtyId ??
            doctor?.specializationId ??
            doctor?.SpecializationId ??
            ""
        ) === specialtyFromUrl ||
        specialtyName.includes(normalizeText(specialtyFromUrl));

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, search, specialtyFromUrl]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);

    const nextParams = new URLSearchParams(searchParams);

    if (value.trim()) {
      nextParams.set("search", value);
    } else {
      nextParams.delete("search");
    }

    setSearchParams(nextParams, { replace: true });
  };

  const clearSearch = () => {
    setSearch("");

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");

    setSearchParams(nextParams, { replace: true });
  };

  const openDoctorProfile = (doctor) => {
    const slug = getDoctorSlug(doctor);

    if (slug !== undefined && slug !== null && String(slug).trim() !== "") {
      navigate(`/doctors/${encodeURIComponent(String(slug).trim())}`);
      return;
    }

    console.error("Həkimin slug məlumatı tapılmadı:", doctor);
    alert(
      "Həkim profilini açmaq mümkün olmadı. Həkimin slug məlumatı yoxdur."
    );
  };

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      {/* PREMIUM HERO */}
      <section className="relative isolate overflow-hidden bg-[#0b1f3a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.22),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(37,99,235,0.20),transparent_45%)]" />

        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-10 top-24 h-52 w-52 rounded-full border border-white/10" />
        <div className="absolute -bottom-36 left-1/3 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200 sm:text-sm">
              <Sparkles className="h-4 w-4" />
              Avropa Hospital
            </div>

            <h1 className="mt-7 max-w-3xl text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Sağlamlığınız üçün
              <span className="mt-2 block bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                doğru mütəxəssis
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Peşəkar həkimlərimizi kəşf edin, ixtisasları araşdırın
              və sağlamlığınız üçün doğru seçimi rahatlıqla edin.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
                <span className="text-sm font-medium text-slate-100">
                  Peşəkar tibbi heyət
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
                <HeartPulse className="h-5 w-5 text-cyan-300" />
                <span className="text-sm font-medium text-slate-100">
                  Fərdi yanaşma
                </span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-4 rounded-[2rem] bg-cyan-400/10 blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-white shadow-lg shadow-blue-900/30">
                  <Stethoscope className="h-8 w-8" />
                </div>

                <div>
                  <p className="text-sm font-medium text-cyan-200">
                    Sağlamlığınız bizim üçün dəyərlidir
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-white">
                    Həkimlərinizi kəşf edin
                  </h2>
                </div>
              </div>

              <div className="my-7 h-px bg-white/10" />

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-[#102944] p-4">
                  <HeartPulse className="h-6 w-6 text-cyan-300" />
                  <p className="mt-3 text-sm font-semibold text-white">
                    Fərqli ixtisaslar
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Ehtiyacınıza uyğun mütəxəssis
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#102944] p-4">
                  <CalendarCheck className="h-6 w-6 text-cyan-300" />
                  <p className="mt-3 text-sm font-semibold text-white">
                    Rahat qəbul
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Görüş prosesini idarə edin
                  </p>
                </div>
              </div>

              <p className="mt-6 flex items-center gap-2 text-sm text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Həkimlər haqqında məlumat bir yerdə
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH PANEL */}
      <section className="relative z-10 mx-auto -mt-7 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.22)] sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Search className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#102b4e]">
                  Sizə uyğun həkimi tapın
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ad, soyad və ya ixtisas üzrə axtarın
                </p>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />

              <input
                id="doctor-search"
                type="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Məsələn: Elvin kardioloq"
                className="h-14 min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 sm:text-base"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Axtarışı təmizlə"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {specialtyFromUrl && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500">
                Aktiv ixtisas filtri:
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                {specialtyFromUrl}
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.delete("specialty");
                    setSearchParams(next);
                  }}
                  aria-label="İxtisas filtrini sil"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* DOCTORS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">
              <span className="h-1 w-8 rounded-full bg-cyan-500" />
              Mütəxəssislərimiz
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-[#102b4e] sm:text-4xl">
              Həkimlərimiz
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
              Həkimlərin profillərinə baxın və ehtiyacınıza uyğun
              mütəxəssisi seçin.
            </p>

            {!loading && !error && (
              <p className="mt-3 text-sm font-semibold text-blue-700">
                {filteredDoctors.length} həkim tapıldı
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Yenilə
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="h-64 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white px-6 py-14 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-xl font-bold text-slate-900">
              Məlumatlar yüklənmədi
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              <RefreshCw className="h-4 w-4" />
              Yenidən yoxla
            </button>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-[#102b4e]">
              Həkim tapılmadı
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
              Axtarış sözlərini dəyişin və başqa ad və ya ixtisasla
              yenidən cəhd edin.
            </p>
            {(search || specialtyFromUrl) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchParams({});
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
              >
                <X className="h-4 w-4" />
                Filtrləri təmizlə
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDoctors.map((doctor, index) => {
              const id = getDoctorId(doctor);
              const name = getDoctorName(doctor);
              const specialty = getSpecialty(doctor);
              const slug = getDoctorSlug(doctor);

              return (
                <article
                  key={id ?? slug ?? `${name}-${index}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/10"
                >
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-100">
                    <DoctorImage doctor={doctor} />

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0b1f3a]/30 to-transparent" />

                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Aktiv həkim
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                      <Stethoscope className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {specialty || "Tibb mütəxəssisi"}
                      </span>
                    </div>

                    <h3 className="mt-4 min-h-14 text-lg font-extrabold leading-7 text-[#102b4e] transition group-hover:text-blue-700">
                      {name}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {specialty
                        ? `${specialty} üzrə mütəxəssis`
                        : "Sağlamlığınız üçün tibbi mütəxəssis"}
                    </p>

                    <div className="mt-auto border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={() => openDoctorProfile(doctor)}
                       
                            className="flex w-full items-center justify-between rounded-xl bg-blue-700 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-200"

                      >
                        <span className="flex items-center gap-2">
                          <UserRound className="h-4 w-4" />
                          Profilə bax
                        </span>
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* BOTTOM CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#102b4e]">
                Sizə uyğun həkimi tapın
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                İxtisasları araşdırın və ehtiyacınıza uyğun mütəxəssis seçin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/specialties")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
          >
            İxtisaslara bax
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}