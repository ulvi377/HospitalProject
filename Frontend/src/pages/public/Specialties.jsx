import { useEffect, useState } from "react";
import {
  ArrowRight,
  HeartPulse,
  LoaderCircle,
  Stethoscope,
} from "lucide-react";
import { Link } from "react-router-dom";
import specialtyService from "../../services/specialtyService";

const Specialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await specialtyService.getAll();

        if (Array.isArray(data)) {
          setSpecialties(data);
        } else if (Array.isArray(data?.data)) {
          setSpecialties(data.data);
        } else if (Array.isArray(data?.items)) {
          setSpecialties(data.items);
        } else {
          setSpecialties([]);
        }
      } catch (err) {
        console.error("Specialties loading error:", err);
        setError("Tibbi ixtisasları yükləmək mümkün olmadı.");
      } finally {
        setLoading(false);
      }
    };

    loadSpecialties();
  }, []);

  const getIcon = (index) => {
    if (index % 3 === 0) {
      return <Stethoscope size={24} />;
    }

    if (index % 3 === 1) {
      return <HeartPulse size={24} />;
    }

    return <Stethoscope size={24} />;
  };

  const getIconStyle = (index) => {
    if (index % 3 === 0) {
      return "bg-blue-50 text-blue-600";
    }

    if (index % 3 === 1) {
      return "bg-cyan-50 text-cyan-600";
    }

    return "bg-emerald-50 text-emerald-600";
  };

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-sm font-semibold text-blue-600">
            Avropa Hospital
          </span>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Tibbi ixtisaslar
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Müxtəlif tibbi ixtisaslar üzrə xidmətlərə baxın
            və sizə uyğun mütəxəssisi tapın.
          </p>
        </div>

        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <LoaderCircle
                size={22}
                className="animate-spin text-blue-600"
              />
              İxtisaslar yüklənir...
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="mt-12 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {specialties.length > 0 ? (
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {specialties.map((specialty, index) => {
                  const doctorCount = Array.isArray(specialty.doctors)
                    ? specialty.doctors.length
                    : 0;

                  return (
                    <div
                      key={specialty.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${getIconStyle(
                          index,
                        )}`}
                      >
                        {getIcon(index)}
                      </div>

                      <h2 className="mt-5 text-lg font-semibold text-slate-900">
                        {specialty.name}
                      </h2>

                      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                        {specialty.description ||
                          "Bu ixtisas üzrə tibbi xidmətlər təqdim olunur."}
                      </p>

                      <div className="mt-4 text-xs font-medium text-slate-400">
                        {doctorCount} həkim
                      </div>

                      <Link
                        to={`/doctors?specialty=${encodeURIComponent(
                          specialty.name,
                        )}`}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Həkimlərə bax
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Stethoscope
                  size={36}
                  className="mx-auto text-slate-400"
                />

                <h2 className="mt-5 text-xl font-semibold text-slate-900">
                  İxtisas tapılmadı
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sistemdə hələ tibbi ixtisas əlavə edilməyib.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Specialties;