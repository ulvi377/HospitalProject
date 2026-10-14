
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

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );

    const decoded = JSON.parse(
      decodeURIComponent(
        atob(padded)
          .split("")
          .map((char) =>
            "%" + char.charCodeAt(0).toString(16).padStart(2, "0")
          )
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

    return String(Array.isArray(role) ? role[0] || "" : role)
      .toLowerCase()
      .trim();
  } catch (error) {
    console.error("Token rolu oxunmadi:", error);
    return "";
  }
}

function getRedirectPath(role) {
  const normalizedRole = String(role || "").toLowerCase().trim();

  if (normalizedRole === "admin") return "/admin";
  if (normalizedRole === "doctor") return "/doctor";
  if (normalizedRole === "patient") return "/patient";

  return "/";
}

const loginStyles = `
  .login-page {
    background: var(--page-bg, #f4f7fb);
    color: var(--text-primary, #17243b);
    isolation: isolate;
  }

  .login-card {
    background: var(--surface-bg, #ffffff);
    border-color: var(--border-color, #e4eaf3);
    box-shadow: var(--shadow-lg, 0 25px 80px -25px rgba(15,23,42,.2));
  }

  .login-form-panel {
    background: var(--surface-bg, #ffffff);
    color: var(--text-primary, #17243b);
  }

  .login-heading {
    color: var(--text-primary, #17243b);
  }

  .login-description {
    color: var(--text-secondary, #52627a);
  }

  .login-label {
    color: var(--text-secondary, #52627a);
  }

  .login-input {
    width: 100%;
    color: var(--text-primary, #17243b);
    background: var(--input-bg, #ffffff);
    border: 1px solid var(--border-color, #e4eaf3);
    transition: background .2s, border-color .2s, box-shadow .2s;
  }

  .login-input::placeholder {
    color: var(--text-muted, #8290a5);
  }

  .login-input:hover {
    border-color: var(--primary, #2563eb);
  }

  .login-input:focus {
    outline: none;
    border-color: var(--primary, #2563eb);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary, #2563eb) 15%, transparent);
  }

  .login-icon-box {
    background: var(--primary-soft, #eaf1ff);
    color: var(--primary, #2563eb);
  }

  .login-accent {
    color: var(--primary, #2563eb);
  }

  .login-primary-btn {
    background: #0b172b;
    color: #ffffff;
  }

  .login-primary-btn:hover:not(:disabled) {
    background: #0f766e;
  }

  .login-google {
    background: var(--surface-bg, #ffffff);
    color: var(--text-primary, #17243b);
    border-color: var(--border-color, #e4eaf3);
  }

  .login-google:hover:not(:disabled) {
    background: var(--surface-secondary, #f8faff);
    border-color: var(--primary, #2563eb);
  }

  .login-divider {
    background: var(--border-color, #e4eaf3);
  }

  .login-error {
    background: var(--danger-bg, #fff0f0);
    color: var(--danger-text, #c53030);
    border-color: var(--border-color, #e4eaf3);
  }

  .login-muted {
    color: var(--text-muted, #8290a5);
  }

  .login-link {
    color: var(--primary, #2563eb);
  }

  .login-link:hover {
    color: var(--primary-hover, #1d4ed8);
  }

  .login-password-toggle {
    color: var(--text-muted, #8290a5);
  }

  .login-password-toggle:hover {
    background: var(--surface-secondary, #f8faff);
    color: var(--text-primary, #17243b);
  }

  [data-theme="dark"] .login-page {
    background:
      radial-gradient(ellipse at 5% 5%, rgba(20,184,166,.07), transparent 35%),
      var(--page-bg, #0b1120);
  }

  [data-theme="dark"] .login-card {
    background: var(--surface-bg, #131d30);
    border-color: var(--border-color, #293850);
    box-shadow: 0 25px 80px -25px rgba(0,0,0,.65);
  }

  [data-theme="dark"] .login-form-panel {
    background: var(--surface-bg, #131d30);
    color: var(--text-primary, #edf3ff);
  }

  [data-theme="dark"] .login-heading {
    color: var(--text-primary, #edf3ff);
  }

  [data-theme="dark"] .login-description,
  [data-theme="dark"] .login-label {
    color: var(--text-secondary, #c0cce0);
  }

  [data-theme="dark"] .login-input {
    background: var(--input-bg, #101a2b);
    color: var(--text-primary, #edf3ff);
    border-color: var(--border-color, #293850);
  }

  [data-theme="dark"] .login-input::placeholder {
    color: var(--text-muted, #8c9bb3);
  }

  [data-theme="dark"] .login-input:focus {
    background: var(--surface-secondary, #19263b);
    border-color: var(--primary, #6d9eff);
  }

  [data-theme="dark"] .login-icon-box {
    background: var(--primary-soft, #1c3154);
    color: var(--primary, #6d9eff);
  }

  [data-theme="dark"] .login-accent {
    color: #5eead4;
  }

  [data-theme="dark"] .login-primary-btn {
    background: #0f766e;
    color: #ffffff;
  }

  [data-theme="dark"] .login-primary-btn:hover:not(:disabled) {
    background: #0d9488;
  }

  [data-theme="dark"] .login-google {
    background: var(--surface-secondary, #19263b);
    color: var(--text-primary, #edf3ff);
    border-color: var(--border-color, #293850);
  }

  [data-theme="dark"] .login-google:hover:not(:disabled) {
    background: #20304a;
    border-color: var(--primary, #6d9eff);
  }

  [data-theme="dark"] .login-divider {
    background: var(--border-color, #293850);
  }

  [data-theme="dark"] .login-error {
    background: var(--danger-bg, #421f2a);
    color: var(--danger-text, #ff9da8);
    border-color: var(--border-color, #293850);
  }

  [data-theme="dark"] .login-muted {
    color: var(--text-muted, #8c9bb3);
  }

  [data-theme="dark"] .login-link {
    color: #5eead4;
  }

  [data-theme="dark"] .login-link:hover {
    color: #99f6e4;
  }

  [data-theme="dark"] .login-password-toggle {
    color: var(--text-muted, #8c9bb3);
  }

  [data-theme="dark"] .login-password-toggle:hover {
    background: var(--surface-secondary, #19263b);
    color: var(--text-primary, #edf3ff);
  }

  .login-page input:-webkit-autofill,
  .login-page input:-webkit-autofill:hover,
  .login-page input:-webkit-autofill:focus {
    -webkit-text-fill-color: var(--text-primary, #17243b);
    box-shadow: 0 0 0 1000px var(--input-bg, #ffffff) inset;
    transition: background-color 9999s ease-in-out 0s;
  }

  [data-theme="dark"] .login-page input:-webkit-autofill,
  [data-theme="dark"] .login-page input:-webkit-autofill:hover,
  [data-theme="dark"] .login-page input:-webkit-autofill:focus {
    -webkit-text-fill-color: #edf3ff;
    box-shadow: 0 0 0 1000px #101a2b inset;
  }

  @media (prefers-reduced-motion: reduce) {
    .login-page *,
    .login-page *::before,
    .login-page *::after {
      transition: none !important;
      animation-duration: .01ms !important;
    }
  }
`;

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

  useEffect(() => {
    const googleToken = searchParams.get("token");

    if (!googleToken) return;

    localStorage.setItem("token", googleToken);

    const role =
      searchParams.get("role") || getRoleFromToken(googleToken);

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
      navigate(getRedirectPath(role), { replace: true });
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
        response?.token || localStorage.getItem("token");

      const tokenRole = getRoleFromToken(token);
      const responseRole = response?.user?.role || response?.role || "";
      const contextRole = user?.role || "";
      const savedRole = localStorage.getItem("role") || "";

      const role = String(
        tokenRole || responseRole || contextRole || savedRole
      )
        .toLowerCase()
        .trim();

      if (!role) {
        setError(
          "Giris ugurludur, lakin istifadeci rolu tapilmadi. AuthContext.jsx ve backend JWT rol melumatlarini yoxlamaq lazimdir."
        );
        return;
      }

      localStorage.setItem("role", role);
      navigate(getRedirectPath(role), { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.title ||
          "Email ve ya sifre yanlisdir."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError("");
    setGoogleLoading(true);
    window.location.href = "http://localhost:5030/api/Auth/google";
  };

  return (
    <>
      <style>{loginStyles}</style>

      <main className="login-page relative min-h-[calc(100vh-80px)] overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl" />

        <div className="login-card relative mx-auto grid max-w-6xl overflow-hidden rounded-[28px] border lg:min-h-[680px] lg:grid-cols-[0.95fr_1.05fr]">
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
                  <p className="text-xl font-bold tracking-tight text-white">
                    Hospital
                  </p>
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

                
                    <h1
                      className="max-w-lg text-4xl font-bold leading-[1.2] tracking-tight xl:text-5xl"
                      style={{ color: "#ffffff" }}
                    >
                      Saglam heyata aparan yol{" "}
                      <span style={{ color: "#5eead4" }}>
                        buradan baslayir.
                      </span>
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

          <section className="login-form-panel flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
            <div className="mx-auto w-full max-w-md">
              <Link to="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white">
                  <HeartPulse size={24} />
                </div>
                <div>
                  <p className="login-heading text-lg font-bold">Hospital</p>
                  <p className="login-muted text-xs">Healthcare Platform</p>
                </div>
              </Link>

              <div className="mb-8">
                <div className="login-icon-box mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
                  <Stethoscope size={25} />
                </div>

                <p className="login-accent mb-2 text-sm font-semibold tracking-wide">
                  Xos gelmisiniz
                </p>

                <h2 className="login-heading text-3xl font-bold tracking-tight sm:text-[34px]">
                  Hesabiniza daxil olun
                </h2>

                <p className="login-description mt-3 text-sm leading-6">
                  Davam etmek ucun hesab melumatlarinizi daxil edin.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="login-error mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6"
                >
                  <span className="font-bold">!</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="login-label mb-2 block text-sm font-semibold"
                  >
                    Email unvani
                  </label>

                  <div className="group relative">
                    <Mail
                      size={19}
                      className="login-muted absolute left-4 top-1/2 -translate-y-1/2 transition group-focus-within:text-teal-500"
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@gmail.com"
                      required
                      className="login-input h-[54px] rounded-xl py-3 pl-12 pr-4 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="login-label mb-2 block text-sm font-semibold"
                  >
                    Sifre
                  </label>

                  <div className="group relative">
                    <LockKeyhole
                      size={19}
                      className="login-muted absolute left-4 top-1/2 -translate-y-1/2 transition group-focus-within:text-teal-500"
                    />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Sifrenizi daxil edin"
                      required
                      className="login-input h-[54px] rounded-xl py-3 pl-12 pr-12 text-sm outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Sifreni gizlet" : "Sifreni goster"}
                      className="login-password-toggle absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition"
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="login-primary-btn group flex h-[54px] w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Daxil olunur...
                    </>
                  ) : (
                    <>
                      Daxil ol
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <div className="login-divider h-px flex-1" />
                <span className="login-muted text-xs font-medium">ve ya</span>
                <div className="login-divider h-px flex-1" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="login-google flex h-[54px] w-full items-center justify-center gap-3 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {googleLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                ) : (
                  <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                      transform="translate(0 4)"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.65 5.93c4.47-4.13 7.12-10.2 7.12-17.58Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.12.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.91-5.87l-7.65-5.93c-2.13 1.43-4.85 2.28-8.26 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                    />
                  </svg>
                )}

                {googleLoading
                  ? "Google-a yonlendirilir..."
                  : "Google ile daxil ol"}
              </button>

              <p className="login-description mt-8 text-center text-sm">
                Hesabiniz yoxdur?{" "}
                <Link
                  to="/register"
                  className="login-link font-semibold transition hover:underline"
                >
                  Qeydiyyatdan kecin
                </Link>
              </p>

              <div className="login-muted mt-7 flex items-center justify-center gap-2 text-xs">
                <ShieldCheck size={15} />
                <span>Hesab melumatlarinizi tehlukesiz saxlayin</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
