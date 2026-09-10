import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/Brand";
import { useLang } from "@/context/LanguageContext";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Stethoscope, Lock } from "lucide-react";

export default function AuthShell({ title, subtitle, children, footer }) {
  const { t, toggle } = useLang();
  return (
    <div className="ayu-bg min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" data-testid="auth-home-link">
            <BrandLogo />
          </Link>
          <Button variant="ghost" size="sm" onClick={toggle} data-testid="auth-language-toggle" className="gap-1.5">
            <Languages className="h-4 w-4" />
            {t("lang_toggle")}
          </Button>
        </div>

        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-2">
          <div className="hidden lg:block">
            <h2 className="font-display text-3xl font-bold leading-tight text-slate-900">
              {t("hero_title")}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">{t("hero_sub")}</p>
            <div className="mt-8 space-y-4">
              {[
                { icon: Stethoscope, k: "feature_doctors" },
                { icon: ShieldCheck, k: "feature_ai" },
                { icon: Lock, k: "feature_privacy" },
              ].map(({ icon: Icon, k }) => (
                <div key={k} className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-white/70 p-4 card-shadow">
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{t(`${k}_t`)}</p>
                    <p className="text-sm text-slate-500">{t(`${k}_d`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 card-shadow sm:p-8 animate-in-up">
              <h1 className="font-display text-2xl font-bold text-slate-900">{title}</h1>
              {subtitle ? <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p> : null}
              <div className="mt-6">{children}</div>
            </div>
            {footer ? <div className="mt-5 text-center text-sm text-slate-500">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
