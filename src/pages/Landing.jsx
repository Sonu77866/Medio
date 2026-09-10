import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardPlus, Sparkles, Stethoscope, Lock, ArrowRight, ShieldCheck, Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/Brand";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { HOME_BY_ROLE } from "@/components/ProtectedRoute";

export default function Landing() {
  const { t, toggle } = useLang();
  const { user } = useAuth();

  const features = [
    { icon: ClipboardPlus, k: "feature_intake" },
    { icon: Sparkles, k: "feature_ai" },
    { icon: Stethoscope, k: "feature_doctors" },
    { icon: Lock, k: "feature_privacy" },
  ];

  return (
    <div className="ayu-bg min-h-screen">
      <header className="sticky top-0 z-50 border-b border-emerald-100/70 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggle} className="gap-1.5" data-testid="landing-language-toggle">
              <Languages className="h-4 w-4" /> {t("lang_toggle")}
            </Button>
            {user ? (
              <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700" data-testid="landing-dashboard">
                <Link to={HOME_BY_ROLE[user.role] || "/"}>{t("nav_home")}</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild data-testid="landing-login"><Link to="/login">{t("login")}</Link></Button>
                <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700" data-testid="landing-register"><Link to="/register">{t("register")}</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" /> Ayucore · {t("brand_tag")}
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {t("hero_title")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">{t("hero_sub")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2 bg-emerald-600 text-base hover:bg-emerald-700" data-testid="cta-patient">
                <Link to={user ? "/patient" : "/register"}>{t("hero_cta_patient")} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 border-emerald-200 text-base text-emerald-700 hover:bg-emerald-50" data-testid="cta-doctor">
                <Link to="/register/doctor">{t("hero_cta_doctor")}</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }} className="relative">
            <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white card-shadow">
              <img
                src="https://images.unsplash.com/photo-1659353888906-adb3e0041693?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
                alt="Healthcare consultation"
                className="h-[360px] w-full object-cover lg:h-[440px]"
              />
            </div>
            <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-emerald-100 bg-white/95 p-4 card-shadow sm:block">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Sparkles className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t("ai_assisted")}</p>
                  <p className="text-xs text-slate-500">{t("requires_verification")}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, k }, i) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-emerald-100 bg-white p-6 card-shadow card-shadow-hover"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">{t(`${k}_t`)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{t(`${k}_d`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="mt-6 border-t border-emerald-100/70 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-400 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Ayucore. General health information — not a substitute for professional medical advice.
        </div>
      </footer>
    </div>
  );
}
