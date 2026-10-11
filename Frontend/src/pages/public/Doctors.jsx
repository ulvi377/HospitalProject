
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  UserRound,
  Stethoscope,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  X,
} from "lucide-react";

import doctorService from "../../services/doctorService";

// Mətni axtarış üçün normallaşdırır
const normalizeText = (value) => {
  return String(value ?? "")
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
};

// Həkimin adını götürür
const getDoctorName = (doctor) => {
  const fullName =
    doctor?.fullName ??
    doctor?.FullName ??
    doctor?.name ??
    doctor?.Name;

  if (fullName) return String(fullName);

  const firstName =
    doctor?.firstName ??
    doctor?.FirstName ??
    doctor?.name ??
    doctor?.Name ??
    "";

  const lastName =
    doctor?.lastName ??
    doctor?.LastName ??
    "";

  const middleName =
    doctor?.middleName ??
    doctor?.MiddleName ??
    "";

  return [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || "Həkim";
};

// Həkimin ixtisasını götürür
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

  if (typeof specialty === "string") {
    return specialty;
  }

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

// Həkimin şəklini götürür
const getDoctorImage = (doctor) => {
  return (
    doctor?.imageUrl ??
    doctor?.ImageUrl ??
    doctor?.photoUrl ??
    doctor?.PhotoUrl ??
    doctor?.profileImage ??
    doctor?.ProfileImage ??
    doctor?.image ??
    doctor?.Image ??
    doctor?.photo ??
    doctor?.Photo ??
    doctor?.avatar ??
    doctor?.Avatar ??
    ""
  );
};

// Həkimin ID-sini götürür
const getDoctorId = (doctor) => {
  return (
    doctor?.id ??
    doctor?.Id ??
    doctor?.doctorId ??
    doctor?.DoctorId
  );
};

// API cavabından həkim siyahısını çıxarır
const getDoctorsArray = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.Items)) {
    return response.Items;
  }

  if (Array.isArray(response?.doctors)) {
    return response.doctors;
  }

  if (Array.isArray(response?.Doctors)) {
    return response.Doctors;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  if (Array.isArray(response?.Results)) {
    return response.Results;
  }

  if (Array.isArray(response?.$values)) {
    return response.$values;
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response?.data?.Items)) {
    return response.data.Items;
  }

  return [];
};

// Obyektdəki bütün mətnləri axtarış üçün toplayır
const getSearchableText = (value, depth = 0) => {
  if (value == null || depth > 5) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
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

// Ada və ixtisasa görə axtarış
const matchesDoctorSearch = (doctor, query) => {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  const words = normalizedQuery
    .split(/\s+/)
    .filter(Boolean);

  const searchableText = normalizeText(
    [
      getDoctorName(doctor),
      getSpecialty(doctor),
      getSearchableText(doctor),
    ].join(" ")
  );

  // Məsələn: "elvin kardioloq"
  // Hər iki söz həkim məlumatlarında tapılmalıdır.
  return words.every((word) => {
    if (searchableText.includes(word)) {
      return true;
    }

    // Kardioloq / kardiolog kimi yazılış fərqlərinə kömək edir
    const aliases = {
      kardioloq: ["kardiolog", "cardiologist", "cardiology"],
      kardiolog: ["kardioloq", "cardiologist", "cardiology"],
      terapevt: ["terapiya", "therapist", "therapist"],
      nevroloq: ["neurolog", "neurology"],
      pediatr: ["pediatriya", "pediatrician", "pediatrics"],
      cerrah: ["cərrah", "surgeon", "surgery"],
      uroloq: ["urolog", "urology"],
      stomatoloq: ["dentist", "dentistry"],
      dermatoloq: ["dermatolog", "dermatologist", "dermatology"],
      ginekoloq: ["gynecologist", "gynecology"],
    };

    return (aliases[word] ?? []).some((alias) =>
      searchableText.includes(normalizeText(alias))
    );
  });
};

function DoctorImage({ doctor }) {
  const [imageError, setImageError] = useState(false);
  const image = getDoctorImage(doctor);

  useEffect(() => {
    setImageError(false);
  }, [image]);

  if (!image || imageError) {
    return (
      <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <UserRound className="h-24 w-24 text-blue-300" />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={getDoctorName(doctor)}
      className="h-64 w-full object-cover object-top transition duration-500 group-hover:scale-105"
      onError={() => setImageError(true)}
    />
  );
}

export default function Doctors() {
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
      // Mövcud doctorService istifadə olunur.
      const response = await doctorService.getAll(
        specialtyFromUrl
          ? { specialtyId: specialtyFromUrl }
          : undefined
      );

      const list = getDoctorsArray(response);

      setDoctors(list);

      if (!Array.isArray(response) && list.length === 0) {
        console.warn("Doctors API cavabı:", response);
      }
    } catch (err) {
      console.error("Həkimləri yükləmək mümkün olmadı:", err);

      setDoctors([]);
      setError(
        "Həkim məlumatlarını yükləmək mümkün olmadı. Backend serverin işlədiyini yoxla."
      );
    } finally {
      setLoading(false);
    }
  }, [specialtyFromUrl, reloadKey]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  // URL-dəki axtarış dəyişəndə input-u yenilə
  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  // Axtarış nəticələri
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
        normalizeText(specialtyName).includes(
          normalizeText(specialtyFromUrl)
        );

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

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 px-4 py-16 text-white sm:py-20">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100">
            <Stethoscope className="h-4 w-4" />
            Peşəkar tibbi heyət
          </div>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Həkimlərimiz
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
            Sağlamlığınız üçün təcrübəli mütəxəssislərimizi
            kəşf edin və sizə uyğun həkimi seçin.
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Peşəkar mütəxəssislər
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Müxtəlif ixtisaslar
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="relative z-10 mx-auto -mt-7 max-w-7xl px-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/60 sm:p-6">
          <label
            htmlFor="doctor-search"
            className="mb-3 block text-sm font-semibold text-slate-700"
          >
            Həkim axtarışı
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />

            <input
              id="doctor-search"
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Həkimin adını və ya ixtisasını yazın..."
              className="h-14 min-w-0 flex-1 bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
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

          <p className="mt-3 text-sm text-slate-500">
            Ad, soyad və ixtisas üzrə axtarış edə bilərsiniz.
            Məsələn: <span className="font-medium text-blue-700">Elvin kardioloq</span>
          </p>
        </div>
      </section>

      {/* Doctors list */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Həkimlərimizlə tanış olun
            </h2>

            {!loading && !error && (
              <p className="mt-2 text-slate-500">
                {filteredDoctors.length} həkim tapıldı
              </p>
            )}
          </div>

          {!loading && !error && (
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700 sm:self-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Yenilə
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
              >
                <div className="h-64 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Xəta baş verdi
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-medium text-white transition hover:bg-blue-800"
            >
              <RefreshCw className="h-4 w-4" />
              Yenidən yoxla
            </button>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Search className="h-8 w-8 text-blue-600" />
            </div>

            <h3 className="mt-5 text-xl font-semibold text-slate-900">
              Həkim tapılmadı
            </h3>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              Axtarış sözlərini dəyişin və ya başqa ad və ixtisasla
              yenidən cəhd edin.
            </p>

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-medium text-white transition hover:bg-blue-800"
              >
                <X className="h-4 w-4" />
                Axtarışı təmizlə
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDoctors.map((doctor, index) => {
              const id = getDoctorId(doctor);
              const name = getDoctorName(doctor);
              const specialty = getSpecialty(doctor);

              return (
                <article
                  key={id ?? `${name}-${index}`}
                  className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10"
                >
                  <div className="relative overflow-hidden bg-slate-100">
                    <DoctorImage doctor={doctor} />

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 to-transparent" />

                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-semibold text-blue-800 shadow">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {specialty || "Tibb mütəxəssisi"}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-blue-700">
                      {name}
                    </h3>

                    <p className="mt-2 min-h-5 text-sm text-slate-500">
                      {specialty || "Həkim"}
                    </p>

                    {id != null ? (
                      <Link
                        to={`/doctors/${id}`}
                        className="mt-5 flex w-full items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-700 hover:text-white"
                      >
                        Ətraflı məlumat
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </Link>
                    ) : (
                      <div className="mt-5 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm text-slate-500">
                        Həkim ID-si mövcud deyil
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
