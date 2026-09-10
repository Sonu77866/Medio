import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Loader2, FileText, Share2, Ban, Clock, ChevronRight, Inbox, ShieldCheck } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ShareDialog from "@/components/ShareDialog";
import { api, apiError } from "@/lib/api";
import { fmtDateTime } from "@/lib/format";
import { useLang } from "@/context/LanguageContext";
import { toast } from "sonner";

function ShareRow({ share, onRevoke }) {
  const { t } = useLang();
  return (
    <div className="flex items-center justify-between gap-2" data-testid={`share-row-${share.id}`}>
      <div className="text-sm">
        <span className="font-medium text-slate-700">{share.doctor_name}</span>
        <span className="ml-2 text-xs text-slate-400">{t("shared_on")} {fmtDateTime(share.shared_at)}</span>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="ghost" className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700" data-testid={`revoke-${share.id}`}><Ban className="h-4 w-4" /> {t("revoke")}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent data-testid="revoke-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("revoke_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("revoke_confirm_body")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="revoke-cancel">{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => onRevoke(share.id)} className="bg-red-600 hover:bg-red-700" data-testid="revoke-confirm-button">{t("revoke")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ActiveShares({ shares, onRevoke }) {
  const { t } = useLang();
  if (shares.length === 0) return null;
  return (
    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-800">{t("shares_title")}</p>
      <div className="space-y-2">
        {shares.map((s) => <ShareRow key={s.id} share={s} onRevoke={onRevoke} />)}
      </div>
    </div>
  );
}

function HistoryCard({ record: c, shared, onShared, onRevoke }) {
  const { t } = useLang();
  const problems = [...(c.problems || []), c.other_problem].filter(Boolean).join(", ");
  return (
    <li className="relative">
      <span className="absolute -left-[31px] top-4 h-4 w-4 rounded-full border-4 border-white bg-emerald-500" />
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 card-shadow" data-testid={`history-card-${c.id}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400"><Clock className="h-3.5 w-3.5" /> {fmtDateTime(c.created_at)}</div>
            <h3 className="mt-1 font-display text-lg font-semibold text-slate-900">{c.patient_name}</h3>
            <p className="text-sm text-slate-500">{problems || "—"}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {c.severity ? <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">{c.severity}</Badge> : null}
              {c.ai_summary?.possible_department ? <Badge variant="outline" className="border-emerald-200 text-emerald-700">{c.ai_summary.possible_department}</Badge> : null}
              {shared.length > 0 ? <Badge className="gap-1 bg-blue-100 text-blue-700"><ShieldCheck className="h-3 w-3" />{shared.length}</Badge> : null}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button asChild size="sm" variant="outline" className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <Link to={`/case/${c.id}`} data-testid={`view-case-${c.id}`}><FileText className="h-4 w-4" /> {t("view_case")} <ChevronRight className="h-3.5 w-3.5" /></Link>
            </Button>
            <ShareDialog recordId={c.id} onShared={onShared} trigger={
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" data-testid={`share-case-${c.id}`}><Share2 className="h-4 w-4" /> {t("share")}</Button>
            } />
          </div>
        </div>
        <ActiveShares shares={shared} onRevoke={onRevoke} />
      </div>
    </li>
  );
}

function EmptyHistory() {
  const { t } = useLang();
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-12 text-center card-shadow" data-testid="history-empty">
      <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"><Inbox className="h-7 w-7" /></span>
      <h3 className="font-display text-lg font-semibold text-slate-800">{t("no_history")}</h3>
      <p className="mt-1 text-sm text-slate-500">{t("no_history_sub")}</p>
      <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700"><Link to="/patient" data-testid="history-new-case">{t("nav_intake")}</Link></Button>
    </div>
  );
}

export default function History() {
  const { t } = useLang();
  const [cases, setCases] = useState(null);
  const [shares, setShares] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [c, s] = await Promise.all([api.get("/cases"), api.get("/shares/mine")]);
      setCases(c.data);
      setShares(s.data);
    } catch (e) {
      setError(apiError(e));
      setCases([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const revoke = async (shareId) => {
    try {
      await api.post(`/shares/${shareId}/revoke`);
      toast.success(t("status_revoked"));
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const activeShares = shares.filter((s) => s.status === "active");

  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-slate-900">{t("history_title")}</h1>
          <p className="mt-1.5 text-slate-500">{t("history_sub")}</p>
        </div>

        {cases === null ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <Button variant="outline" className="mt-3" onClick={load} data-testid="history-retry">{t("retry")}</Button>
          </div>
        ) : cases.length === 0 ? (
          <EmptyHistory />
        ) : (
          <ol className="relative space-y-4 border-l-2 border-emerald-100 pl-6" data-testid="history-timeline">
            {cases.map((c) => (
              <HistoryCard key={c.id} record={c} shared={activeShares.filter((s) => s.record_id === c.id)} onShared={load} onRevoke={revoke} />
            ))}
          </ol>
        )}
      </div>
    </Layout>
  );
}
