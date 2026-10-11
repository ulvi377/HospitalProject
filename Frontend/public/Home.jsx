
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import doctorService from "../../services/doctorService";
import specialtyService from "../../services/specialtyService";

const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);

        const [doctorsData, specialtiesData] =
          await Promise.all([
            doctorService.getAll(),
            specialtyService.getAll(),
          ]);

        const doctorList = Array.isArray(doctorsData)
          ? doctorsData
          : Array.isArray(doctorsData?.data)
            ? doctorsData.data
            : Array.isArray(doctorsData?.items)
              ? doctorsData.items
              : [];

        const specialtyList = Array.isArray(specialtiesData)
          ? specialtiesData
          : Array.isArray(specialtiesData?.data)
            ? specialtiesData.data
            : Array.isArray(specialtiesData?.items)
              ? specialtiesData.items
              : [];

        setDoctors(doctorList);
        setSpecialties(specialtyList);
      } catch (error) {
        console.error(
          "Home məlumatları yüklənmədi:",
          error,
        );

        setDoctors([]);
        setSpecialties([]);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const getDoctorName = (doctor) => {
    if (doctor.fullName) {
      return doctor.fullName;
    }

    if (doctor.name) {
      return doctor.name;
    }

    return [doctor.firstName, doctor.lastName]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div className="overflow-hidden bg-white">
      {/* Hero */}
      <section className="relative bg-slate-50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <HeartPulse size={16} />
              Müasir tibbi xidmət
            </div>

            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Sağlamlığınız üçün
              <span className="block text-blue-600">
                doğru seçim.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Peşəkar həkimlər, müasir tibbi yanaşma və
              pasiyentlər üçün rahat rəqəmsal xidmət
              təcrübəsi bir platformada.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/doctors"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Həkimlərə bax
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <CalendarDays size={18} />
                Görüş təyin et
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-emerald-500"
                />
                Peşəkar həkimlər
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-emerald-500"
                />
                Rahat görüş sistemi
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-emerald-500"
                />
                Təhlükəsiz platforma
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-cyan-100 blur-3xl" />

            <div className="relative rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/60">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-8 sm:p-10">
                <div className="flex min-h-[320px] flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                      <Stethoscope size={25} />
                    </div>

                    <div className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                      Avropa Hospital
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-blue-100">
                      Sağlamlıq sizinlə başlayır
                    </p>

                    <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight text-white sm:text-4xl">
                      Sizə uyğun həkimi asanlıqla tapın.
                    </h2>

                    <div className="mt-7 flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {doctors.slice(0, 3).map((doctor, index) => (
                          <div
                            key={doctor.id ?? index}
                            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-blue-500 bg-white text-sm font-bold text-blue-600"
                            title={getDoctorName(doctor)}
                          >
                            {doctor.imageUrl ? (
                              <img
                                src={doctor.imageUrl}
                                alt={getDoctorName(doctor)}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getDoctorName(doctor)
                                ?.charAt(0)
                                ?.toUpperCase() || "H"
                            )}
                          </div>
                        ))}

                        {!loading &&
                          doctors.length === 0 && (
                            <>
                              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-500 bg-white text-sm font-bold text-blue-600">
                                A
                              </div>

                              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-500 bg-slate-100 text-sm font-bold text-slate-600">
                                H
                              </div>

                              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-500 bg-white text-sm font-bold text-blue-600">
                                D
                              </div>
                            </>
                          )}
                      </div>

                      <span className="text-sm text-blue-50">
                        Peşəkar tibbi xidmət
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-5 -left-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Təhlükəsiz
                  </p>

                  <p className="text-xs text-slate-500">
                    Məlumatların qorunması
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Stethoscope size={21} />
            </div>

            <h3 className="font-semibold text-slate-900">
              Peşəkar həkimlər
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Müxtəlif ixtisaslar üzrə həkimləri
              araşdırın və sizə uyğun mütəxəssisi seçin.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
              <CalendarDays size={21} />
            </div>

            <h3 className="font-semibold text-slate-900">
              Rahat görüş planlaması
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Uyğun həkimi seçərək görüş prosesini
              rahat şəkildə idarə edin.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <HeartPulse size={21} />
            </div>

            <h3 className="font-semibold text-slate-900">
              Sağlamlıq tarixçəsi
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Tibbi məlumatlarınızı və reseptlərinizi
              sistem üzərindən izləyin.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Stethoscope size={23} />
              </div>

              <div>
                <p className="text-3xl font-bold text-slate-950">
                  {loading ? "..." : doctors.length}
                </p>

                <p className="text-sm text-slate-500">
                  Həkim
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <HeartPulse size={23} />
              </div>

              <div>
                <p className="text-3xl font-bold text-slate-950">
                  {loading ? "..." : specialties.length}
                </p>

                <p className="text-sm text-slate-500">
                  Tibbi ixtisas
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={23} />
              </div>

              <div>
                <p className="text-3xl font-bold text-slate-950">
                  24/7
                </p>

                <p className="text-sm text-slate-500">
                  Rəqəmsal platforma
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="text-sm font-semibold text-blue-600">
              Niyə Avropa Hospital?
            </span>

            <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Tibbi xidmətləri daha rahat və
              əlçatan edirik.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-600">
              Platformamız pasiyent, həkim və
              administrator üçün nəzərdə tutulmuş vahid
              rəqəmsal xəstəxana təcrübəsi təqdim edir.
            </p>

            <Link
              to="/about"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Daha ətraflı
              <ChevronRight size={17} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-6">
              <UsersRound
                size={24}
                className="text-blue-600"
              />

              <h3 className="mt-5 font-semibold text-slate-900">
                Pasiyent yönümlü
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Pasiyentin ehtiyaclarına uyğun sadə və
                rahat istifadə təcrübəsi.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6">
              <Clock3
                size={24}
                className="text-blue-600"
              />

              <h3 className="mt-5 font-semibold text-slate-900">
                Vaxta qənaət
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Görüş və tibbi məlumatların idarəsini
                daha sürətli həyata keçirin.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6">
              <ShieldCheck
                size={24}
                className="text-blue-600"
              />

              <h3 className="mt-5 font-semibold text-slate-900">
                Təhlükəsizlik
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                İstifadəçi rolları və qorunan API
                endpointləri ilə təhlükəsiz giriş.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6">
              <HeartPulse
                size={24}
                className="text-blue-600"
              />

              <h3 className="mt-5 font-semibold text-slate-900">
                Kompleks yanaşma
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Görüşlərdən tibbi tarixçəyə qədər vahid
                sistem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 sm:px-10 lg:px-14">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold text-blue-400">
                Sağlamlığınızı gecikdirməyin
              </p>

              <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Sizə uyğun həkimi indi kəşf edin.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
                Həkimlərə baxın və sizin üçün uyğun
                mütəxəssis haqqında ətraflı məlumat əldə edin.
              </p>
            </div>

            <Link
              to="/doctors"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Həkimlərə bax
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
