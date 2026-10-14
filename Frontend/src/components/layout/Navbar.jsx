import { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  LogIn,
  Menu,
  UserRound,
  LogOut,
  LayoutDashboard,
  Languages,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language.startsWith("en") ? "en" : "az";

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const navLinkClass = ({ isActive }) =>
    `transition-colors duration-200 ${
      isActive
        ? "text-blue-600 font-semibold"
        : "text-slate-600 hover:text-blue-600"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <span className="text-xl font-bold">A</span>
          </div>

          <div className="hidden sm:block">
            <div className="text-lg font-bold tracking-tight text-slate-900">
              {t("brand")}
            </div>
            <div className="text-xs text-slate-500">
              {t("footerText")}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          <NavLink to="/" className={navLinkClass}>
            {t("home")}
          </NavLink>

          <NavLink to="/doctors" className={navLinkClass}>
            {t("doctors")}
          </NavLink>

          <NavLink to="/specialties" className={navLinkClass}>
            {t("specialties")}
          </NavLink>

          <NavLink to="/about" className={navLinkClass}>
            {t("about")}
          </NavLink>

          <NavLink to="/contact" className={navLinkClass}>
            {t("contact")}
          </NavLink>
        </nav>

        {/* Right Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Language Selector */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1">
            <Languages size={17} className="ml-2 text-slate-500" />

            <button
              type="button"
              onClick={() => changeLanguage("az")}
              aria-label="Azərbaycan dili"
              aria-pressed={currentLanguage === "az"}
              className={`rounded-lg px-2.5 py-2 text-xs font-bold transition ${
                currentLanguage === "az"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              AZ
            </button>

            <button
              type="button"
              onClick={() => changeLanguage("en")}
              aria-label="English"
              aria-pressed={currentLanguage === "en"}
              className={`rounded-lg px-2.5 py-2 text-xs font-bold transition ${
                currentLanguage === "en"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              EN
            </button>
          </div>

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <LogIn size={18} />
                {t("login")}
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <UserRound size={18} />
                {t("register")}
              </Link>

              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <CalendarDays size={18} />
                {t("bookAppointment")}
              </Link>
            </>
          ) : (
            <>
              {user?.role === "Admin" && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <LayoutDashboard size={18} />
                  {t("adminPanel")}
                </Link>
              )}

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {user?.name?.charAt(0) || "U"}
                </div>

                <div className="hidden xl:block">
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.name || user?.email || "User"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user?.role || "User"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
                {t("logout")}
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 lg:hidden"
          aria-label={t("openMenu")}
        >
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;