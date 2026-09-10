import { useState, useEffect } from "react";
import {
  Loader2, Users, Stethoscope, Clock, BadgeCheck, Share2,
} from "lucide-react";
import Layout from "@/components/Layout";
import AdminTaxonomy from "@/components/AdminTaxonomy";
import { api, apiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";

const CARDS = [
  { key: "total_patients", label: "stat_patients", icon: Users, tone: "bg-emerald-100 text-emerald-700" },
  { key: "total_doctors", label: "stat_doctors", icon: Stethoscope, tone: "bg-teal-100 text-teal-700" },
  { key: "pending_doctors", label: "stat_pending", icon: Clock, tone: "bg-amber-100 text-amber-700" },
  { key: "verified_doctors", label: "stat_verified", icon: BadgeCheck, tone: "bg-blue-100 text-blue-700" },
  { key: "total_shared_histories", label: "stat_shares", icon: Share2, tone: "bg-purple-100 text-purple-700" },
];

export default function AdminDashboard() {
  const { t } = useLang();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch((e) => setError(apiError(e)));
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">{t("admin_title")}</h1>
        <p className="mt-1.5 text-slate-500">{t("admin_overview")}</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"><p className="text-sm font-medium text-red-700">{error}</p></div>
      ) : !stats ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" data-testid="admin-stats">
          {CARDS.map(({ key, label, icon: Icon, tone }) => (
            <div key={key} className="rounded-2xl border border-emerald-100 bg-white p-5 card-shadow card-shadow-hover" data-testid={`stat-${key}`}>
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
              <p className="mt-3 font-display text-3xl font-bold text-slate-900">{stats[key]}</p>
              <p className="text-sm text-slate-500">{t(label)}</p>
            </div>
          ))}
        </div>
      )}

      <AdminTaxonomy />
    </Layout>
  );
}
