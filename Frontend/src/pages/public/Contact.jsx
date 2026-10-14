
import { useState } from "react";
import api from "../../services/api";
import {
  Mail,
  MapPin,
  Phone,
  HeartPulse,
  ArrowRight,
  Clock3,
  MessageSquareText,
  Send,
  ShieldCheck,
  CheckCircle2,
  Headphones,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

const contactDetails = [
  {
    icon: MapPin,
    title: "Ünvanımız",
    value: "Bakı, Azərbaycan",
    description: "Ünvanımızı xəritədə tapın və bizə yaxınlaşın.",
    href: "https://www.google.com/maps/search/?api=1&query=Baku+Azerbaijan",
    action: "Xəritədə aç",
    iconStyle: "bg-teal-50 text-teal-700",
  },
  {
    icon: Phone,
    title: "Telefon",
    value: "+994 12 000 00 00",
    description: "Suallarınız üçün bizimlə əlaqə saxlayın.",
    href: "tel:+994120000000",
    action: "Zəng et",
    iconStyle: "bg-blue-50 text-blue-700",
  },
  {
    icon: Mail,
    title: "E-poçt",
    value: "ulviehmedli8500@gmail.com",
    description: "Suallarınızı və təkliflərinizi bizə göndərin.",
    href: "mailto:ulviehmedli8500@gmail.com",
    action: "E-poçt yaz",
    iconStyle: "bg-violet-50 text-violet-700",
  },
];

const initialFormData = {
  fullName: "",
  email: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [formData, setFormData] = useState(initialFormData);
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (status.message) {
      setStatus({ type: "", message: "" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await api.post("/Contact", {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setStatus({
        type: "success",
        message:
          response.data?.message ||
          "Mesajınız uğurla göndərildi. Bizimlə əlaqə saxladığınız üçün təşəkkür edirik!",
      });

      setFormData({ ...initialFormData });
    } catch (error) {
      console.error(
        "Contact form göndərmə xətası:",
        error.response?.data || error.message
      );

      let errorMessage =
        "Mesaj göndərilmədi. Bir az sonra yenidən cəhd edin.";

      if (!error.response) {
        errorMessage =
          "Backend-ə qoşulmaq mümkün olmadı. API-nin işlədiyini yoxlayın.";
      } else if (error.response.status === 400) {
        errorMessage =
          "Məlumatları yoxlayın və yenidən cəhd edin.";
      } else if (error.response.status === 500) {
        errorMessage =
          "Server mesajı göndərə bilmədi. E-poçt və SMTP parametrlərini yoxlamaq lazımdır.";
      }

      const serverMessage = error.response?.data?.message;

      setStatus({
        type: "error",
        message:
          typeof serverMessage === "string"
            ? serverMessage
            : errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="overflow-hidden bg-white text-slate-900">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#0b172b]">
        <div className="pointer-events-none absolute -right-28 -top-32 h-[420px] w-[420px] rounded-full border border-teal-300/10" />
        <div className="pointer-events-none absolute right-10 top-16 h-64 w-64 rounded-full border border-teal-300/10" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-200">
              <Sparkles size={15} />
              Avropa Hospital
            </div>

            <h1 className="mt-7 max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Sizin üçün buradayıq.
              <span className="mt-2 block text-teal-300">
                Bizimlə əlaqə saxlayın.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Suallarınız, təklifləriniz və məlumat sorğularınız
              üçün bizimlə əlaqə yaradın. Sizə rahat və aydın
              ünsiyyət təcrübəsi təqdim etməyə çalışırıq.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contact-form"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-300 px-6 py-3.5 text-sm font-bold text-[#0b172b] shadow-lg shadow-teal-950/20 transition duration-200 hover:-translate-y-0.5 hover:bg-teal-200"
              >
                <MessageSquareText size={18} />
                Mesaj göndər
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>

              <a
                href="#contact-details"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-teal-300/30 hover:bg-white/[0.08]"
              >
                <MapPin size={17} />
                Əlaqə məlumatları
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-teal-300" />
                Rahat əlaqə
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-teal-300" />
                Məlumatlara diqqətli yanaşma
              </span>
            </div>
          </div>

          {/* ƏLAQƏ MƏRKƏZİ */}
          <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
            <div className="absolute -inset-4 rounded-[32px] bg-teal-300/[0.08] blur-2xl" />

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#172d46] via-[#11233a] to-[#0d1a2d] p-6 shadow-2xl shadow-black/20 sm:p-8">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-teal-400/[0.08] blur-3xl" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-300 text-[#0b172b] shadow-lg shadow-teal-950/20">
                  <Headphones size={27} />
                </div>

                <div>
                  <p className="text-sm font-medium text-teal-200">
                    Əlaqə mərkəzi
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                    Sizə kömək etməyə hazırıq
                  </h2>
                </div>
              </div>

              <p className="relative mt-5 text-sm leading-7 text-slate-300">
                Bizə ən uyğun əlaqə kanalını seçin. Suallarınızı
                bizə çatdırmaq üçün bir neçə sadə seçim təqdim edirik.
              </p>

              <div className="relative mt-6 space-y-3">
                <a
                  href="tel:+994120000000"
                  className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 transition duration-200 hover:border-blue-300/20 hover:bg-white/[0.07]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                    <Phone size={21} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400">Telefon</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      +994 12 000 00 00
                    </p>
                  </div>
                  <ArrowRight
                    size={17}
                    className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-blue-300"
                  />
                </a>

                <a
                  href="mailto:ulviehmedli8500@gmail.com"
                  className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 transition duration-200 hover:border-teal-300/20 hover:bg-white/[0.07]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                    <Mail size={21} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400">E-poçt</p>
                    <p className="mt-1 break-all text-sm font-semibold text-white">
                      ulviehmedli8500@gmail.com
                    </p>
                  </div>
                  <ArrowRight
                    size={17}
                    className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-teal-300"
                  />
                </a>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Baku+Azerbaijan"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 transition duration-200 hover:border-violet-300/20 hover:bg-white/[0.07]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                    <MapPin size={21} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400">Ünvan</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Bakı, Azərbaycan
                    </p>
                  </div>
                  <ArrowRight
                    size={17}
                    className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-violet-300"
                  />
                </a>
              </div>

              <div className="relative mt-5 flex items-start gap-3 rounded-2xl border border-teal-300/10 bg-teal-300/[0.06] p-4">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-teal-300"
                />
                <p className="text-xs leading-6 text-slate-300">
                  Məxfi və tibbi məlumatlarınızı adi əlaqə
                  mesajlarında paylaşmayın.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ƏLAQƏ MƏLUMATLARI */}
      <section
        id="contact-details"
        className="bg-[#f6f9fc] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
              Əlaqə məlumatları
            </span>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#102b4e] sm:text-4xl">
              Bizimlə əlaqə qurun
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Sizə uyğun əlaqə üsulunu seçin. Suallarınızı və
              təkliflərinizi məmnuniyyətlə qəbul edirik.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {contactDetails.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-900/[0.06] sm:p-7"
                >
                  <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-teal-500 to-blue-500 transition-transform duration-300 group-hover:scale-x-100" />

                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconStyle} transition-transform duration-300 group-hover:scale-105`}
                    >
                      <Icon size={23} />
                    </div>

                    <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-400">
                      Əlaqə
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-[#102b4e]">
                    {item.title}
                  </h3>

                  <p className="mt-2 break-words text-sm font-bold leading-6 text-slate-800">
                    {item.value}
                  </p>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <a
                    href={item.href}
                    target={
                      item.title === "Ünvanımız" ? "_blank" : undefined
                    }
                    rel={
                      item.title === "Ünvanımız" ? "noreferrer" : undefined
                    }
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-700 transition hover:text-teal-900"
                  >
                    {item.action}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* MESAJ FORMASI */}
      <section
        id="contact-form"
        className="relative overflow-hidden py-16 sm:py-24"
      >
        <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-teal-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 lg:px-8">
          <div className="lg:sticky lg:top-24">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700">
              <MessageSquareText size={16} />
              Bizə yazın
            </span>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#102b4e] sm:text-4xl">
              Fikirləriniz bizim üçün önəmlidir.
            </h2>

            <p className="mt-5 text-sm leading-8 text-slate-600 sm:text-base">
              Sualınız və ya təklifiniz varsa, aşağıdakı formanı
              doldurun. Mesajınız mövcud backend vasitəsilə
              göndərilmək üçün nəzərdə tutulub.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Sadə mesaj göndərilməsi
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Məlumatları daxil edin və mesajınızı göndərin.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Məlumatlı və təhlükəsiz yanaşma
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Formaya parol və ya həssas tibbi məlumatlar yazmayın.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.3)] sm:p-8 lg:p-9"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-xl font-extrabold text-[#102b4e] sm:text-2xl">
                  Mesaj göndərin
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Zəhmət olmasa, bütün xanaları doldurun.
                </p>
              </div>

              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 sm:flex">
                <Mail size={23} />
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Ad və soyad
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Adınız və soyadınız"
                  required
                  disabled={loading}
                  className={`${inputClass} h-[50px]`}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  E-poçt ünvanı
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  required
                  disabled={loading}
                  className={`${inputClass} h-[50px]`}
                />
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Mövzu
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                minLength={2}
                maxLength={150}
                value={formData.subject}
                onChange={handleChange}
                placeholder="Mesajınızın mövzusu"
                required
                disabled={loading}
                className={`${inputClass} h-[50px]`}
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Mesajınız
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                minLength={5}
                maxLength={5000}
                value={formData.message}
                onChange={handleChange}
                placeholder="Mesajınızı buraya yazın..."
                required
                disabled={loading}
                className={`${inputClass} resize-y py-3.5 leading-6`}
              />
              <p className="mt-2 text-right text-xs text-slate-400">
                {formData.message.length}/5000
              </p>
            </div>

            {status.message && (
              <div
                role="status"
                aria-live="polite"
                className={`mt-5 rounded-xl border px-4 py-3.5 text-sm leading-6 ${
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {status.type === "success" ? (
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0"
                    />
                  ) : (
                    <ShieldCheck
                      size={19}
                      className="mt-0.5 shrink-0"
                    />
                  )}
                  <span>{status.message}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#0b172b] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Göndərilir...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Mesajı göndər
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              Mesaj göndərilməsi backend və e-poçt xidmətinin
              düzgün konfiqurasiya edilməsindən asılıdır.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
