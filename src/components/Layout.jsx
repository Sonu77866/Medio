import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu, LogOut, Languages, Stethoscope, Search, ClipboardPlus,
  History as HistoryIcon, Pill, ShieldCheck, LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { BrandLogo } from "@/components/Brand";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

function navForRole(role, t) {
  if (role === "patient") {
    return [
      { to: "/patient", label: t("nav_intake"), icon: ClipboardPlus },
      { to: "/doctors", label: t("nav_doctors"), icon: Search },
      { to: "/medicines", label: t("nav_medicines"), icon: Pill },
      { to: "/history", label: t("nav_history"), icon: HistoryIcon },
    ];
  }
  if (role === "doctor") {
    return [
      { to: "/doctor", label: t("nav_doctor_dash"), icon: LayoutDashboard },
      { to: "/doctors", label: t("nav_doctors"), icon: Search },
      { to: "/medicines", label: t("nav_medicines"), icon: Pill },
    ];
  }
  if (role === "admin") {
    return [
      { to: "/admin", label: t("admin_overview"), icon: LayoutDashboard },
      { to: "/admin/doctors", label: t("admin_doctors"), icon: Stethoscope },
      { to: "/admin/medicines", label: t("admin_medicines"), icon: Pill },
      { to: "/admin/audit", label: t("admin_audit"), icon: ShieldCheck },
    ];
  }
  return [];
}

const linkClass = ({ isActive }) =>
  cn(
    "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
  );

function LangButton() {
  const { toggle, t } = useLang();
  return (
    <Button type="button" variant="ghost" size="sm" onClick={toggle} data-testid="language-toggle" className="gap-1.5 text-slate-600 hover:text-emerald-700">
      <Languages className="h-4 w-4" />
      {t("lang_toggle")}
    </Button>
  );
}

function NavItems({ items, prefix, onNavigate }) {
  return items.map((it) => (
    <NavLink key={it.to} to={it.to} end={it.to === "/admin"} onClick={onNavigate} className={linkClass} data-testid={`${prefix}${it.to.replace(/\//g, "-")}`}>
      <it.icon className="h-4 w-4" />
      {it.label}
    </NavLink>
  ));
}

function DesktopActions({ user, onLogout }) {
  const { t } = useLang();
  if (user) {
    return (
      <>
        <span className="max-w-[160px] truncate text-sm font-medium text-slate-500" data-testid="current-user-name">{user.name}</span>
        <Button variant="outline" size="sm" onClick={onLogout} data-testid="logout-button" className="gap-1.5">
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </Button>
      </>
    );
  }
  return (
    <>
      <Button variant="ghost" size="sm" asChild data-testid="header-login"><Link to="/login">{t("login")}</Link></Button>
      <Button size="sm" asChild data-testid="header-register" className="bg-emerald-600 hover:bg-emerald-700"><Link to="/register">{t("register")}</Link></Button>
    </>
  );
}

function MobileMenu({ items, user, onLogout }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="mobile-menu-button"><Menu className="h-5 w-5" /></Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px]">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="mb-6 mt-2"><BrandLogo tagline={t("brand_tag")} /></div>
        <div className="flex flex-col gap-1"><NavItems items={items} prefix="mobile-nav-" onNavigate={close} /></div>
        <div className="mt-6 border-t border-emerald-100 pt-4">
          {user ? (
            <Button variant="outline" className="w-full gap-2" onClick={onLogout} data-testid="mobile-logout">
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full" onClick={close}><Link to="/login">{t("login")}</Link></Button>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={close}><Link to="/register">{t("register")}</Link></Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const items = user ? navForRole(user.role, t) : [];
  const homeTo = user ? `/${user.role === "admin" ? "admin" : user.role}` : "/";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="ayu-bg">
      <header className="sticky top-0 z-50 border-b border-emerald-100/70 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={homeTo} data-testid="home-link"><BrandLogo /></Link>
          <nav className="hidden items-center gap-1 lg:flex"><NavItems items={items} prefix="nav-" /></nav>
          <div className="hidden items-center gap-2 lg:flex">
            <LangButton />
            <DesktopActions user={user} onLogout={handleLogout} />
          </div>
          <div className="flex items-center gap-1 lg:hidden">
            <LangButton />
            <MobileMenu items={items} user={user} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>

      <footer className="no-print mt-8 border-t border-emerald-100/70 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-400 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Ayucore. General health information — not a substitute for professional medical advice.
        </div>
      </footer>
    </div>
  );
}
