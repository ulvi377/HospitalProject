
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  ShieldCheck,
  HeartPulse,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";
import authService from "../../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName.trim()) {
      setError("Ad və soyad daxil edin.");
      return;
    }

    if (!email.trim()) {
      setError("Email daxil edin.");
      return;
    }

    if (!password) {
      setError("Şifrə daxil edin.");
      return;
    }

    if (password.length < 6) {
      setError("Şifrə ən azı 6 simvoldan ibarət olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifrələr uyğun gəlmir.");
      return;
    }

    try {
      setLoading(true);

      const response = await authService.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      setSuccess(
        response?.data?.message ||
        response?.message ||
        "Qeydiyyat uğurla tamamlandı."
      );

      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const data = err?.response?.data;

      if (data?.errors && Array.isArray(data.errors)) {
        setError(data.errors.join(" "));
      } else if (data?.errors && typeof data.errors === "object") {
        setError(
          Object.values(data.errors)
            .flat()
            .join(" ")
        );
      } else if (data?.message) {
        setError(data.message);
      } else if (data?.title) {
        setError(data.title);
      } else {
        setError(
          "Qeydiyyat zamanı xəta baş verdi. Yenidən cəhd edin."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:opacity-60";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  const passwordStrength = [
    formData.password.length >= 6,
    /[A-Z]/.test(formData.password) &&
      /[a-z]/.test(formData.password),
    /[0-9]/.test(formData.password),
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[#f4f7fa] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[650px] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_80px_-28px_rgba(15,35,60,0.22)] lg:grid-cols-[0.92fr_1.08fr]">

          {/* LEFT BRAND PANEL */}
          <aside className="relative hidden overflow-hidden bg-[#102b3f] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
            <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="absolute right-0 top-0 h-full w-px bg-white/10" />

            <div className="relative z-10">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400 text-[#102b3f] shadow-lg shadow-teal-950/20">
                  <HeartPulse size={26} strokeWidth={2.4} />
                </div>

                <div>
                  <p className="text-xl font-bold tracking-tight">
                    Hospital
                  </p>
                  <p className="text-xs tracking-[0.18em] text-slate-400">
                    HEALTHCARE SYSTEM
                  </p>
                </div>
              </Link>

              <div className="mt-20">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-xs font-medium text-teal-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                  Sağlamlığınız bizim prioritetimizdir
                </div>

   
                  <h1
                  className="max-w-sm text-4xl font-semibold leading-[1.2] tracking-tight text-white xl:text-[42px]"
                  style={{ color: "#fffafa" }}
                >
                  Sağlam həyata
                  <span
                    className="block"
                    style={{ color: "#5eead4" }}
                  >
                    birlikdə addım ataq.
                  </span>
                </h1>

                <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
                  Şəxsi hesabınızı yaradın, mütəxəssislərimizi
                  kəşf edin və tibbi xidmətlərə daha rahat
                  çıxış əldə edin.
                </p>
              </div>

              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-teal-300 ring-1 ring-white/10">
                    <Stethoscope size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Peşəkar mütəxəssislər
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Həkimlər haqqında ətraflı məlumat
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-teal-300 ring-1 ring-white/10">
                    <ShieldCheck size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Rahat hesab idarəetməsi
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Şəxsi hesabınıza rahat giriş
                    </p>
                  </div>
                </div>
              </div>
            </div>

           <div className="relative z-10 mt-12 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white">
  <span>© 2026 Hospital</span>

  <span className="flex items-center gap-1.5 text-white">
    <HeartPulse size={14} className="text-teal-300" />
    Sağlamlığınız üçün
  </span>
</div>
          </aside>

          {/* REGISTER FORM */}
          <section className="p-6 sm:p-10 lg:p-10 xl:p-12">
            <div className="mx-auto max-w-md">
              {/* Mobile logo */}
              <Link to="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102b3f] text-teal-300">
                  <HeartPulse size={23} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Hospital</p>
                  <p className="text-[10px] tracking-[0.15em] text-slate-500">
                    HEALTHCARE SYSTEM
                  </p>
                </div>
              </Link>

              <div className="mb-7">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                  <UserPlus size={21} />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                  Yeni hesabınız
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  Qeydiyyatdan keç
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Başlamaq üçün məlumatlarınızı daxil edin.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                >
                  <span className="mt-0.5 shrink-0 font-bold">!</span>
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                >
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <p>{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* FULL NAME */}
                <div>
                  <label htmlFor="fullName" className={labelClass}>
                    Ad və soyad
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Məsələn, Əli Məmmədov"
                    autoComplete="name"
                    disabled={loading}
                    required
                    className={inputClass}
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Elektron poçt
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    autoComplete="email"
                    disabled={loading}
                    required
                    className={inputClass}
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label htmlFor="password" className={labelClass}>
                    Şifrə
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Ən azı 6 simvol"
                      autoComplete="new-password"
                      disabled={loading}
                      required
                      minLength={6}
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${
                              passwordStrength >= level
                                ? "bg-teal-500"
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-500">
                        {formData.password.length < 6
                          ? "Şifrə ən azı 6 simvol olmalıdır."
                          : passwordStrength === 3
                            ? "Şifrə tələblərə uyğundur."
                            : "Daha güclü şifrə seçə bilərsiniz."}
                      </p>
                    </div>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label htmlFor="confirmPassword" className={labelClass}>
                    Şifrəni təsdiqlə
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Şifrəni yenidən daxil edin"
                      autoComplete="new-password"
                      disabled={loading}
                      required
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Təsdiq şifrəsini gizlət"
                          : "Təsdiq şifrəsini göstər"
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#102b3f] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:bg-teal-700 hover:shadow-teal-700/15 focus:outline-none focus:ring-4 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Qeydiyyat aparılır...
                    </>
                  ) : (
                    <>
                      Hesab yarat
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">və ya</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <p className="text-center text-sm text-slate-500">
                Artıq hesabınız var?{" "}
                <Link
                  to="/login"
                  className="font-bold text-teal-700 transition hover:text-teal-900"
                >
                  Daxil olun
                </Link>
              </p>

              <div className="mt-7 flex items-start justify-center gap-2 text-center text-xs leading-5 text-slate-400">
                <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                <p>
                  Hesab məlumatlarınızı qoruyun və şifrənizi
                  başqaları ilə paylaşmayın.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Register;
