
import { ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-4xl font-bold text-blue-600">
          404
        </div>

        <span className="mt-8 block text-sm font-semibold text-blue-600">
          Avropa Hospital
        </span>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Səhifə tapılmadı
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-600">
          Axtardığınız səhifə mövcud deyil və ya ünvan
          dəyişdirilmiş ola bilər.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Home size={18} />
            Ana səhifə
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            Geri qayıt
          </button>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
