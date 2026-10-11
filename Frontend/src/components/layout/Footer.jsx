
import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="mb-5 flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                <span className="text-xl font-bold">
                  A
                </span>
              </div>

              <div>
                <div className="text-lg font-bold text-white">
                  Avropa Hospital
                </div>

                <div className="text-xs text-slate-400">
                  Sağlamlığınız bizim üçün önəmlidir
                </div>
              </div>
            </Link>

            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Müasir tibbi xidmət, peşəkar həkimlər və
              pasiyentlər üçün rahat rəqəmsal xəstəxana
              təcrübəsi.
            </p>

            {/* Social */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold transition hover:bg-blue-600 hover:text-white"
              >
                f
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold transition hover:bg-blue-600 hover:text-white"
              >
                ig
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold transition hover:bg-blue-600 hover:text-white"
              >
                in
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold transition hover:bg-blue-600 hover:text-white"
              >
                X
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
              Sürətli keçidlər
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="transition hover:text-white"
                >
                  Ana səhifə
                </Link>
              </li>

              <li>
                <Link
                  to="/doctors"
                  className="transition hover:text-white"
                >
                  Həkimlər
                </Link>
              </li>

              <li>
                <Link
                  to="/specialties"
                  className="transition hover:text-white"
                >
                  İxtisaslar
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="transition hover:text-white"
                >
                  Haqqımızda
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="transition hover:text-white"
                >
                  Əlaqə
                </Link>
              </li>
            </ul>
          </div>

          {/* Patient */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
              Pasiyentlər üçün
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/login"
                  className="transition hover:text-white"
                >
                  Daxil ol
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="transition hover:text-white"
                >
                  Qeydiyyatdan keç
                </Link>
              </li>

              <li>
                <Link
                  to="/doctors"
                  className="transition hover:text-white"
                >
                  Həkim seç
                </Link>
              </li>

              <li>
                <Link
                  to="/login"
                  className="transition hover:text-white"
                >
                  Görüş təyin et
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
              Əlaqə məlumatları
            </h3>

            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-500"
                />

                <span>Bakı, Azərbaycan</span>
              </li>

              <li className="flex items-center gap-3">
                <Phone
                  size={18}
                  className="shrink-0 text-blue-500"
                />

                <span>+994 12 000 00 00</span>
              </li>

              <li className="flex items-center gap-3">
                <Mail
                  size={18}
                  className="shrink-0 text-blue-500"
                />

                <span>info@avropahospital.az</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Avropa Hospital.
            Bütün hüquqlar qorunur.
          </p>

          <div className="flex gap-5">
            <span className="cursor-pointer transition hover:text-slate-300">
              Məxfilik siyasəti
            </span>

            <span className="cursor-pointer transition hover:text-slate-300">
              İstifadə şərtləri
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
