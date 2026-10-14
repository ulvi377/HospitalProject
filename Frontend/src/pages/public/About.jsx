
import { Link } from "react-router-dom";
import {
  ArrowRight,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  Target,
  Eye,
  HandHeart,
  CheckCircle2,
  Activity,
  Clock3,
  Sparkles,
} from "lucide-react";

const values = [
  {
    icon: HeartPulse,
    title: "Pasiyent mərkəzli yanaşma",
    description:
      "Hər bir pasiyentin ehtiyacını ön planda tutaraq rahat və əlçatan tibbi xidmət təcrübəsi yaratmağa çalışırıq.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: ShieldCheck,
    title: "Etibar və təhlükəsizlik",
    description:
      "İstifadəçilərin məlumatlarına diqqətlə yanaşır, etibarlı və şəffaf rəqəmsal mühit yaratmağı hədəfləyirik.",
    color: "bg-teal-50 text-teal-700",
  },
  {
    icon: Sparkles,
    title: "Müasir texnologiya",
    description:
      "Tibbi xidmətlərə çıxışı asanlaşdıran müasir texnologiyalardan və rahat rəqəmsal həllərdən istifadə edirik.",
    color: "bg-blue-50 text-blue-600",
  },
];

const features = [
  "Həkimlər haqqında məlumatlara rahat çıxış",
  "Sadə və istifadəçi dostu interfeys",
  "Müasir rəqəmsal səhiyyə təcrübəsi",
  "Pasiyent rahatlığına yönəlmiş yanaşma",
];

const About = () => {
  return (
    <main className="overflow-hidden bg-white text-slate-900">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#0b172b]">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full border border-teal-300/10" />
        <div className="pointer-events-none absolute -right-12 top-0 h-[340px] w-[340px] rounded-full border border-teal-300/10" />
        <div className="pointer-events-none absolute -bottom-48 left-1/3 h-[450px] w-[450px] rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-4 py-2 text-sm font-medium text-teal-200">
              <HeartPulse size={17} />
              Avropa Hospital
            </div>

            <h1 className="mt-7 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Sağlam gələcək üçün{" "}
              <span className="text-teal-300">
                birlikdə.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Avropa Hospital müasir texnologiyaları və
              pasiyent rahatlığını bir araya gətirən
              rəqəmsal səhiyyə platformasıdır. Məqsədimiz
              tibbi xidmətlər haqqında məlumat əldə etməyi
              daha rahat və əlçatan etməkdir.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/doctors"
                className="group inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-teal-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/10 transition hover:-translate-y-0.5 hover:bg-teal-300"
              >
                Həkimlərimizlə tanış olun
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/register"
                className="inline-flex min-h-13 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
              >
                Hesab yaradın
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-teal-300" />
                Rahat istifadə
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-teal-300" />
                Müasir yanaşma
              </span>
            </div>
          </div>

          {/* Sağ vizual panel */}
          <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
            <div className="absolute -inset-5 rounded-[36px] bg-teal-300/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#152b43] to-[#0e1b30] p-6 shadow-2xl sm:p-8">
              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-teal-400/10 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-teal-200">
                    Bizim yanaşmamız
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                    İnsan sağlamlığı
                    <br />
                    hər şeydən önəmlidir.
                  </h2>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-300 text-[#0b172b] shadow-lg shadow-teal-500/10">
                  <HeartPulse size={30} />
                </div>
              </div>

              <div className="relative mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                    <Stethoscope size={24} />
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      Həkim məlumatları
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Lazım olan məlumatlara rahat çıxış
                    </p>
                  </div>
                </div>

                <div className="my-5 h-px bg-white/10" />

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                    <ShieldCheck size={24} />
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      Etibarlı rəqəmsal mühit
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Təhlükəsizliyə diqqət yetirən yanaşma
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative mt-5 flex items-center gap-3 rounded-xl bg-teal-300/10 px-4 py-3.5">
                <Activity size={20} className="text-teal-300" />
                <p className="text-sm font-medium text-teal-100">
                  Sağlamlıq üçün daha rahat rəqəmsal təcrübə
                </p>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:flex">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <HandHeart size={23} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Pasiyent rahatlığı
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Əsas prioritetimiz
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* DƏYƏRLƏR */}
<section className="bg-[#edf4fa] py-20 sm:py-24">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-3xl font-bold tracking-tight text-[#102b4e] sm:text-4xl">
        Dəyərlərimiz
      </h2>

      <p className="mt-4 text-base leading-7 text-slate-600">
        Hər addımda rahatlığı, etibarı və müasir
        texnologiyanı bir araya gətirməyə çalışırıq.
      </p>
    </div>

    <div className="mt-12 grid gap-6 md:grid-cols-3">
      {values.map((value) => {
        const Icon = value.icon;

        return (
          <article
            key={value.title}
            className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg sm:p-8"
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${value.color}`}
            >
              <Icon size={27} />
            </div>

            <h3 className="mt-6 text-xl font-bold leading-7 text-slate-900">
              {value.title}
            </h3>

            <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
              {value.description}
            </p>

            <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-5 text-sm font-semibold text-teal-800 transition group-hover:text-blue-700">
              <span>Əsas dəyərimiz</span>
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </div>
          </article>
        );
      })}
    </div>
  </div>
</section>


      {/* MISSİYA VƏ BAXIŞ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-3xl bg-[#0b172b] p-8 text-white sm:p-10">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-400/10 blur-2xl" />

              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-300/10 text-teal-300">
                  <Target size={28} />
                </div>

                <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-teal-300">
                  Missiyamız
                </p>

                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                  Tibbi xidmətlərə çıxışı asanlaşdırmaq
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                  İstifadəçilərin həkimlər haqqında məlumat
                  əldə etməsini və rəqəmsal səhiyyə
                  imkanlarından rahat istifadə etməsini
                  təmin edən əlçatan platforma yaratmaq.
                </p>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Eye size={28} />
              </div>

              <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
                Baxışımız
              </p>

              <h2 className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">
                Müasir səhiyyə təcrübəsi
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Texnologiyanın imkanlarından istifadə edərək
                daha rahat, anlaşılan və istifadəçi
                ehtiyaclarına uyğun rəqəmsal səhiyyə
                təcrübəsi formalaşdırmaq.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* NİYƏ BİZ */}
      <section className="border-y border-slate-100 bg-[#f7f9fc] py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
              Niyə Avropa Hospital?
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Sizin üçün düşünülmüş rahatlıq
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600">
              Platformamız tibbi məlumatlara daha rahat
              çıxış əldə etməyiniz və xidmətlər arasında
              asanlıqla hərəkət etməyiniz üçün nəzərdə tutulub.
            </p>

            <div className="mt-8 space-y-4">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <CheckCircle2 size={16} />
                  </div>

                  <p className="text-sm leading-6 text-slate-700 sm:text-base">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <UsersRound size={25} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Pasiyentlər
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                İstifadəçi rahatlığına yönəlmiş xidmət təcrübəsi.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Stethoscope size={25} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Həkimlər
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Həkim məlumatlarını araşdırmaq üçün rahat imkan.
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock3 size={25} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Daha rahat rəqəmsal təcrübə
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Lazım olan bölmələrə aydın və rahat naviqasiya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-gradient-to-r from-[#0b172b] via-[#10263a] to-[#0b353e] px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-teal-300/10 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-300 text-[#0b172b]">
              <HeartPulse size={29} />
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Sağlamlığınıza doğru addım atın
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              Platformamızla tanış olun, həkimlər haqqında
              məlumat əldə edin və rəqəmsal səhiyyə
              təcrübənizə indi başlayın.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/doctors"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-6 py-3.5 text-sm font-bold text-[#0b172b] transition hover:bg-teal-200"
              >
                Həkimlərə bax
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Qeydiyyatdan keç
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
