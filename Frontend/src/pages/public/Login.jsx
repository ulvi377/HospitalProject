import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  HeartPulse,
  ShieldCheck,
  ArrowRight,
  Mail,
  LockKeyhole,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

function getRoleFromToken(token) {
  if (!token) return "";

  try {
    const payload = token.split(".")[1];

    if (!payload) return "";

    const normalized = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );

    const decoded = JSON.parse(
      decodeURIComponent(
        atob(padded)
          .split("")
          .map((char) => {
            return (
              "%" +
              char.charCodeAt(0).toString(16).padStart(2, "0")
            );
          })
          .join("")
      )
    );

    const role =
      decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] ||
      decoded.role ||
      decoded.roles?.[0] ||
      decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/roles"
      ] ||
      "";

    return String(
      Array.isArray(role) ? role[0] || "" : role
    ).toLowerCase().trim();
  } catch (error) {
    console.error("Token rolu oxunmadi:", error);
    return "";
  }
}

function getRedirectPath(role) {
  const normalizedRole = String(role || "")
    .toLowerCase()
    .trim();

  if (normalizedRole === "admin") {
    return "/admin";
  }

  if (normalizedRole === "doctor") {
    return "/doctor";
  }

  if (normalizedRole === "patient") {
    return "/patient";
  }

  return "/";
}

export default function Login() {
  const { login, isAuthenticated, user } = useContext(AuthContext);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Google girisinden qayidan tokeni emal et
  useEffect(() => {
    const googleToken = searchParams.get("token");

    if (!googleToken) return;

    localStorage.setItem("token", googleToken);

    const role =
      searchParams.get("role") ||
      getRoleFromToken(googleToken);

    if (role) {
      localStorage.setItem("role", role.toLowerCase());
    }

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

    window.location.reload();
  }, [searchParams]);

  // Daxil olmus istifadecini roluna gore yonlendir
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem("token");
    const tokenRole = getRoleFromToken(token);

    const role =
      tokenRole ||
      user?.role ||
      localStorage.getItem("role") ||
      "";

    if (role) {
      navigate(getRedirectPath(role), {
        replace: true,
      });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const token =
        response?.token ||
        localStorage.getItem("token");

      const tokenRole = getRoleFromToken(token);

      const responseRole =
        response?.user?.role ||
        response?.role ||
        "";

      const contextRole = user?.role || "";

      const savedRole = localStorage.getItem("role") || "";

      const role = String(
        tokenRole ||
        responseRole ||
        contextRole ||
        savedRole
      ).toLowerCase().trim();

      if (!role) {
        setError(
          "Giris ugurludur, lakin istifadeci rolu tapilmadi. AuthContext.jsx ve backend JWT rol melumatlarini yoxlamaq lazimdir."
        );
        return;
      }

      localStorage.setItem("role", role);

      navigate(getRedirectPath(role), {
        replace: true,
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Email ve ya sifre yanlisdir.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError("");
    setGoogleLoading(true);

    window.location.href =
      "http://localhost:5030/api/Auth/google";
  };

  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f4f7fb] px-4 py-8 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_25px_80px_-25px_rgba(15,23,42,0.20)] lg:min-h-[680px] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-[#0b172b] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div className="pointer-events-none absolute -right-28 top-28 h-80 w-80 rounded-full border border-teal-300/10" />
          <div className="pointer-events-none absolute -right-12 top-44 h-48 w-48 rounded-full border border-teal-300/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300 to-cyan-500 text-[#0b172b] shadow-lg shadow-teal-500/20">
                <HeartPulse size={27} strokeWidth={2.5} />
              </div>

              <div>
                <p className="text-xl font-bold tracking-tight">Hospital</p>
                <p className="text-xs tracking-[0.18em] text-slate-400">
                  HEALTHCARE PLATFORM
                </p>
              </div>
            </Link>

            <div className="mt-16">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-2 text-xs font-medium text-teal-200">
                <span className="h-2 w-2 rounded-full bg-teal-300" />
                Saglamliginiz bizim prioritetimizdir
              </div>

              <h1 className="max-w-lg text-4xl font-bold leading-[1.2] tracking-tight xl:text-5xl">
                Saglam heyata aparan yol{" "}
                <span className="text-teal-300">buradan baslayir.</span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
                Hekimleri kesf edin, qebul proseslerini rahat idare edin
                ve saglamliginiz ucun dogru addimlari daha asan atin.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              {[
                "Hekimler haqqinda etrafli melumat",
                "Rahat ve suretli hesab idareetmesi",
                "Muasir reqemsal sehiyye tecrubesi",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-300/15 text-teal-300">
                    <CheckCircle2 size={15} />
                  </div>
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-teal-300">
                <ShieldCheck size={23} />
              </div>
              <div>
                <p className="font-semibold text-white">
                  Hesabiniza rahat daxil olun
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Melumatlarinizi qorumaq ucun hesab tehlukesizliyine
                  diqqet yetirin.
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 mt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} Hospital. Butun huquqlar qorunur.
          </p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
          <div className="mx-auto w-full max-w-md">
            <Link to="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white">
                <HeartPulse size={24} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">Hospital</p>
                <p className="text-xs text-slate-500">Healthcare Platform</p>
              </div>
            </Link>

            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <Stethoscope size={25} />
              </div>

              <p className="mb-2 text-sm font-semibold tracking-wide text-teal-700">
                Xos gelmisiniz
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-[34px]">
                Hesabiniza daxil olun
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Davam etmek ucun hesab melumatlarinizi daxil edin.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                <span className="font-bold">!</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Email unvani
                </label>

                <div className="group relative">
                  <Mail size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-teal-600" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    required
                    className="h-[54px] w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Sifre
                </label>

                <div className="group relative">
                  <LockKeyhole size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-teal-600" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Sifrenizi daxil edin"
                    required
                    className="h-[54px] w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Sifreni gizlet" : "Sifreni goster"}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="group flex h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-[#0b172b] px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-700/15 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Daxil olunur...
                  </>
                ) : (
                  <>
                    Daxil ol
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">ve ya</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className="flex h-[54px] w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
              ) : (
                <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4)" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.65 5.93c4.47-4.13 7.12-10.2 7.12-17.58Z" />
                  <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.12.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.87l-7.65-5.93c-2.13 1.43-4.85 2.28-8.26 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                </svg>
              )}

              {googleLoading ? "Google-a yonlendirilir..." : "Google ile daxil ol"}
            </button>

            <p className="mt-8 text-center text-sm text-slate-500">
              Hesabiniz yoxdur?{" "}
              <Link to="/register" className="font-semibold text-teal-700 transition hover:text-teal-800 hover:underline">
                Qeydiyyatdan kecin
              </Link>
            </p>

            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={15} />
              <span>Hesab melumatlarinizi tehlukesiz saxlayin</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}