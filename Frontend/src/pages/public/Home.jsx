
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Activity,
  Brain,
  Baby,
  Bone,
  Microscope,
  MoveRight,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const specialties = [
  {
    name: "Kardiologiya",
    description: "Ürək və damar sağlamlığı",
    icon: HeartPulse,
    color: "rose",
  },
  {
    name: "Nevrologiya",
    description: "Sinir sistemi xəstəlikləri",
    icon: Brain,
    color: "blue",
  },
  {
    name: "Pediatriya",
    description: "Uşaqların sağlamlığı",
    icon: Baby,
    color: "emerald",
  },
  {
    name: "Ortopediya",
    description: "Sümük və oynaq sağlamlığı",
    icon: Bone,
    color: "violet",
  },
  {
    name: "Diaqnostika",
    description: "Müayinə və analizlər",
    icon: Microscope,
    color: "amber",
  },
  {
    name: "Ümumi müayinə",
    description: "Sağlamlığınıza ümumi nəzarət",
    icon: Activity,
    color: "cyan",
  },
];

const features = [
  {
    icon: Stethoscope,
    title: "Peşəkar həkimlər",
    description:
      "İxtisaslara uyğun həkimləri araşdırın və sizə uyğun mütəxəssisi seçin.",
  },
  {
    icon: CalendarDays,
    title: "Rahat görüş sistemi",
    description:
      "Görüş prosesinizi onlayn idarə edin və qəbul məlumatlarınızı izləyin.",
  },
  {
    icon: ShieldCheck,
    title: "Şəxsi kabinet",
    description:
      "Hesabınıza daxil olaraq tibbi xidmətlərinizə rahat çıxış əldə edin.",
  },
];

const Home = () => {
  return (
    <main className="overflow-hidden bg-white text-slate-900">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#f1f7fd]">
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:px-8 lg:py-20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-bold tracking-wide text-blue-700 shadow-sm sm:text-sm">
              <Sparkles size={15} />
              AVROPA HOSPITAL
            </div>

            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight text-[#102b4e] sm:text-5xl lg:text-6xl xl:text-7xl">
              Sağlamlığınız üçün
              <span className="mt-1 block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                doğru seçim.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Müasir tibbi xidmətlər, peşəkar mütəxəssislər
              və rahat görüş təyinatı — sağlamlığınız üçün
              lazım olan hər şey bir platformada.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                <CalendarDays size={19} />
                Görüş təyin et
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/doctors"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                Həkimlərə bax
                <MoveRight size={18} />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                Rahat və təhlükəsiz giriş
              </div>
              <div className="flex items-center gap-2">
                <Clock3 size={18} className="text-blue-600" />
                Onlayn görüş idarəetməsi
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-blue-300/40 to-cyan-200/40 blur-xl" />

            <div className="relative min-h-[350px] overflow-hidden rounded-[1.75rem] border border-white bg-gradient-to-br from-blue-100 via-white to-cyan-100 shadow-2xl shadow-blue-900/10 sm:min-h-[460px]">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1100&q=85"
                alt="Peşəkar həkim"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#102b4e]/75 via-transparent to-white/10" />

              <div className="absolute left-4 top-4 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur-md sm:left-6 sm:top-6 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <HeartPulse size={23} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Sağlamlığınız önəmlidir
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Sizə uyğun tibbi xidmət
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-[#102b4e]/85 p-5 text-white shadow-xl backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6 sm:p-6">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Sağlam gələcəyiniz üçün
                </div>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  Qayğınız bizim üçün dəyərlidir.
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Həkimləri kəşf edin, xidmətlərlə tanış olun
                  və görüşünüzü rahatlıqla planlaşdırın.
                </p>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-2 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:flex lg:-left-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Pasiyent yönümlü
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Rahat rəqəmsal təcrübə
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 mx-auto -mt-1 max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 sm:p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={24} />
                </div>

                <h2 className="mt-5 text-lg font-bold text-[#102b4e]">
                  {feature.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {feature.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-blue-600">
                  <span>Avropa Hospital</span>
                  <span className="h-1 w-1 rounded-full bg-blue-300" />
                  <span>0{index + 1}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* SPECIALTIES */}
      <section className="bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">
                Tibbi istiqamətlər
              </span>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#102b4e] sm:text-4xl">
                İxtisaslarımızı kəşf edin
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Ehtiyacınıza uyğun tibbi istiqaməti seçin və
                uyğun mütəxəssislərlə tanış olun.
              </p>
            </div>

            <Link
              to="/specialties"
              className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-blue-700 transition hover:border-blue-200 hover:bg-blue-50 sm:self-auto"
            >
              Bütün ixtisaslar
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {specialties.map((specialty) => {
              const Icon = specialty.icon;

              const colorClasses = {
                rose: "bg-rose-50 text-rose-600",
                blue: "bg-blue-50 text-blue-600",
                emerald: "bg-emerald-50 text-emerald-600",
                violet: "bg-violet-50 text-violet-600",
                amber: "bg-amber-50 text-amber-600",
                cyan: "bg-cyan-50 text-cyan-600",
              };

              return (
                <Link
                  key={specialty.name}
                  to={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}
                  className="group flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 sm:p-6"
                >
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                      colorClasses[specialty.color]
                    }`}
                  >
                    <Icon size={26} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 transition group-hover:text-blue-700">
                      {specialty.name}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {specialty.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={19}
                    className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT / CTA */}
      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#102b4e] shadow-2xl shadow-blue-950/10">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative p-7 sm:p-10 lg:p-14">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-blue-200">
                  <HeartPulse size={16} />
                  AVROPA HOSPITAL
                </div>

                <h2 className="mt-6 max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                  Sağlamlığınıza daha yaxın olun.
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                  Platformamız vasitəsilə həkimləri araşdırın,
                  tibbi ixtisaslarla tanış olun və görüş prosesinizi
                  daha rahat idarə edin.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/doctors"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#102b4e] transition hover:bg-blue-50"
                  >
                    Həkimləri kəşf et
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    to="/about"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Haqqımızda
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-3 lg:grid-cols-1">
              <div className="flex items-center gap-4 bg-white/5 p-6 sm:flex-col sm:items-start sm:justify-center sm:p-7 lg:p-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                  <UsersRound size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Pasiyent yönümlü xidmət</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Sadə və rahat istifadə təcrübəsi.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 p-6 sm:flex-col sm:items-start sm:justify-center sm:p-7 lg:p-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Rəqəmsal görüşlər</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Görüş məlumatlarını bir yerdə izləyin.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 p-6 sm:flex-col sm:items-start sm:justify-center sm:p-7 lg:p-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Şəxsi hesab</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Xidmətlərə öz hesabınızdan daxil olun.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
