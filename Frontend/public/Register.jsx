import { useState } from "react";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Register = () => {
  const { register } = useContext(AuthContext);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

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

    if (password !== confirmPassword) {
      setError("Şifrələr eyni deyil.");
      return;
    }

    try {
      setLoading(true);

      const result = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      setSuccess(
        result?.message || "Qeydiyyat uğurla tamamlandı.",
      );

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("REGISTER ERROR:", err);

      const data = err?.response?.data;

      if (data?.errors) {
        setError(data.errors.join(", "));
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError("Qeydiyyat zamanı xəta baş verdi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">

        <div className="hidden bg-gradient-to-br from-blue-600 to-cyan-500 p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
              <UserRound size={24} />
            </div>

            <h1 className="mt-8 text-4xl font-bold leading-tight text-white">
              Avropa Hospital
            </h1>

            <p className="mt-5 max-w-md leading-7 text-blue-50">
              Hesabınızı yaradın və görüşlərinizi, tibbi
              məlumatlarınızı və reseptlərinizi vahid
              platformadan idarə edin.
            </p>
          </div>

          <p className="text-sm text-blue-100">
            Sağlamlığınız bizim üçün önəmlidir.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mx-auto max-w-md">

            <span className="text-sm font-semibold text-blue-600">
              Avropa Hospital
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Hesab yaradın
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Qeydiyyatdan keçərək xəstəxana xidmətlərindən
              istifadə etməyə başlayın.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Ad və soyad
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="name"
                    type="text"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    placeholder="Ad Soyad"
                    autoComplete="name"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  E-poçt
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="example@mail.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Şifrə
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Şifrənizi daxil edin"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Şifrəni təsdiqlə
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Şifrəni yenidən daxil edin"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Qeydiyyatdan keçirilir..."
                  : "Qeydiyyatdan keç"}

                {!loading && <ArrowRight size={18} />}
              </button>

            </form>

            <div className="mt-7 text-center text-sm text-slate-500">
              Artıq hesabınız var?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Daxil olun
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;