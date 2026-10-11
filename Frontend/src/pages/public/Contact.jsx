
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
} from "lucide-react";

const contactDetails = [
  {
    icon: MapPin,
    title: "Ünvanımız",
    value: "Bakı, Azərbaycan",
    description: "Bizi tapmaq üçün xəritədən istifadə edin.",
    color: "bg-teal-50 text-teal-700",
    href: "https://www.google.com/maps/search/?api=1&query=Baku+Azerbaijan",
    action: "Xəritədə bax",
  },
  {
    icon: Phone,
    title: "Telefon",
    value: "+994 12 000 00 00",
    description: "Suallarınız üçün bizimlə əlaqə saxlayın.",
    color: "bg-blue-50 text-blue-700",
    href: "tel:+994120000000",
    action: "Zəng et",
  },
  {
    icon: Mail,
    title: "E-poçt",
    value: "ulviehmedli8500@gmail.com",
    description: "Bizə e-poçt vasitəsilə yaza bilərsiniz.",
    color: "bg-violet-50 text-violet-700",
    href: "mailto:ulviehmedli8500@gmail.com",
    action: "E-poçt yaz",
  },
];

const initialFormData = {
  fullName: "",
  email: "",
  subject: "",
  message: "",
};

const Contact = () => {
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
          "Mesajınız uğurla göndərildi!",
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
          "Daxil etdiyiniz məlumatları yoxlayın və yenidən cəhd edin.";
      } else if (error.response.status === 500) {
        errorMessage =
          "Server mesajı göndərə bilmədi. SMTP və Gmail App Password parametrlərini yoxlayın.";
      }

      setStatus({
        type: "error",
        message: error.response?.data?.message || errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="overflow-hidden bg-white text-slate-900">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#0b172b]">
        <div className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full border border-teal-300/10" />
        <div className="pointer-events-none absolute -right-8 top-12 h-64 w-64 rounded-full border border-teal-300/10" />
        <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-4 py-2 text-sm font-medium text-teal-200">
              <HeartPulse size={17} />
              Avropa Hospital
            </div>

            <h1 className="mt-7 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Sizinlə əlaqədə olmaq{" "}
              <span className="text-teal-300">istəyirik.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Suallarınız, təklifləriniz və məlumat
              sorğularınız üçün bizimlə əlaqə saxlayın.
              Sizə uyğun əlaqə kanalını seçin.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="mailto:ulviehmedli8500@gmail.com"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-teal-300 px-6 py-3.5 text-sm font-bold text-[#0b172b] transition hover:-translate-y-0.5 hover:bg-teal-200"
              >
                Bizə yazın
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>

              <a
                href="#contact-details"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Əlaqə məlumatları
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-teal-300" />
                Rahat əlaqə
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-teal-300" />
                Müxtəlif əlaqə kanalları
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
            <div className="absolute -inset-5 rounded-[32px] bg-teal-300/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#152b43] to-[#0e1b30] p-6 shadow-2xl sm:p-8">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-teal-400/10 blur-3xl" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-300 text-[#0b172b]">
                  <Headphones size={28} />
                </div>

                <div>
                  <p className="text-sm text-teal-200">
                    Əlaqə mərkəzi
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-white">
                    Sizə kömək etməyə hazırıq
                  </h2>
                </div>
              </div>

              <div className="relative mt-7 space-y-3">
                <a
                  href="tel:+994120000000"
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                    <Phone size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400">Telefon</p>
                    <p className="mt-1 break-words text-sm font-semibold text-white">
                      +994 12 000 00 00
                    </p>
                  </div>

                  <ArrowRight size={17} className="text-slate-400" />
                </a>

                <a
                  href="mailto:ulviehmedli8500@gmail.com"
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]"
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

                  <ArrowRight size={17} className="text-slate-400" />
                </a>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                    <Clock3 size={21} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Əlaqə məlumatları
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Sizə uyğun kanalı seçin
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative mt-5 flex items-start gap-3 rounded-xl bg-teal-300/10 p-4">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-teal-300"
                />
                <p className="text-sm leading-6 text-teal-100">
                  Şəxsi və tibbi məlumatları adi əlaqə
                  mesajlarında paylaşmamağınızı tövsiyə edirik.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ƏLAQƏ KARTLARI */}
      <section
        id="contact-details"
        className="bg-[#f7f9fc] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
              Əlaqə məlumatları
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Bizimlə əlaqə saxlamağın yolları
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Sizə uyğun əlaqə üsulunu seçin və məlumat
              almaq üçün bizimlə əlaqə saxlayın.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {contactDetails.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-900/5 sm:p-8"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.color} transition duration-300 group-hover:scale-105`}
                  >
                    <Icon size={26} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 break-words text-base font-semibold text-slate-800">
                    {item.value}
                  </p>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
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
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-700 transition hover:text-teal-800"
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
      <section className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="lg:sticky lg:top-24">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
              Bizə yazın
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Fikirləriniz bizim üçün önəmlidir
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600">
              Sualınızı və ya təklifinizi bizə çatdırmaq
              üçün formadan istifadə edə bilərsiniz.
              Mesajınız e-poçt vasitəsilə göndəriləcək.
            </p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-[#f7f9fc] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <MessageSquareText size={22} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Əlaqə forması
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Formanı doldurun və mesajınızı birbaşa
                    əlaqə e-poçtuna göndərin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.25)] sm:p-9"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-950">
                Mesaj göndərin
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Bütün xanaları doldurun.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
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
                  className={`${inputClass} h-[52px]`}
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
                  className={`${inputClass} h-[52px]`}
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
                className={`${inputClass} h-[52px]`}
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
            </div>

            {status.message && (
              <div
                role="status"
                aria-live="polite"
                className={`mt-5 rounded-xl border px-4 py-3 text-sm leading-6 ${
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-start gap-2">
                  {status.type === "success" ? (
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0"
                    />
                  ) : (
                    <ShieldCheck
                      size={18}
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
              className="group mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#0b172b] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
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
              Mesajınız təhlükəsiz şəkildə backend vasitəsilə
              göndərilmək üçün nəzərdə tutulub.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Contact;
