import { useState, useEffect, useCallback } from "react";
import { Loader2, ShieldCheck, User, Stethoscope, Share2, Ban, LogIn, LogOut } from "lucide-react";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { api, apiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";

const EVENT_META = {
  login: { icon: LogIn, tone: "bg-blue-100 text-blue-700" },
  logout: { icon: LogOut, tone: "bg-slate-100 text-slate-600" },
  register: { icon: User, tone: "bg-emerald-100 text-emerald-700" },
  doctor_approved: { icon: Stethoscope, tone: "bg-emerald-100 text-emerald-700" },
  doctor_rejected: { icon: Ban, tone: "bg-red-100 text-red-700" },
  doctor_status_changed: { icon: Stethoscope, tone: "bg-amber-100 text-amber-700" },
  history_shared: { icon: Share2, tone: "bg-purple-100 text-purple-700" },
  access_revoked: { icon: Ban, tone: "bg-red-100 text-red-700" },
  doctor_record_access: { icon: ShieldCheck, tone: "bg-blue-100 text-blue-700" },
};

function fmt(d) {
  try { return new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); }
  catch { return d; }
}

export default function AdminAudit() {
  const { t } = useLang();
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/audit");
      setEvents(data);
    } catch (e) { setError(apiError(e)); setEvents([]); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">{t("admin_audit")}</h1>
      </div>

      {events === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"><p className="text-sm font-medium text-red-700">{error}</p></div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-emerald-100 bg-white p-12 text-center card-shadow"><p className="text-slate-500">No audit events yet.</p></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white card-shadow" data-testid="audit-list">
          <table className="w-full text-sm">
            <thead className="border-b border-emerald-50 bg-emerald-50/40 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="hidden px-4 py-3 sm:table-cell">Actor</th>
                <th className="hidden px-4 py-3 md:table-cell">Target</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const meta = EVENT_META[e.event_type] || { icon: ShieldCheck, tone: "bg-slate-100 text-slate-600" };
                const Icon = meta.icon;
                return (
                  <tr key={e.id} className="border-b border-emerald-50 last:border-0" data-testid={`audit-row-${e.id}`}>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${meta.tone}`}><Icon className="h-3.5 w-3.5" /></span>
                        <span className="font-medium text-slate-700">{e.event_type.replace(/_/g, " ")}</span>
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">{e.actor_role ? <Badge variant="outline" className="border-emerald-200 text-emerald-700">{e.actor_role}</Badge> : "—"}</td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-slate-400 md:table-cell">{e.target_id || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{fmt(e.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
