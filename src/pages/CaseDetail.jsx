import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Printer, Share2, RefreshCw, Search } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CaseSummary from "@/components/CaseSummary";
import ShareDialog from "@/components/ShareDialog";
import { MetaField, FollowupList } from "@/components/RecordMeta";
import { api, apiError } from "@/lib/api";
import { fmtDateTime } from "@/lib/format";
import { useLang } from "@/context/LanguageContext";
import { toast } from "sonner";

function CaseActions({ record, regenerating, onRegenerate }) {
  const { t } = useLang();
  const navigate = useNavigate();
  return (
    <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 text-slate-600" data-testid="case-back">
        <ArrowLeft className="h-4 w-4" /> {t("nav_history")}
      </Button>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onRegenerate} disabled={regenerating} className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50" data-testid="case-regenerate">
          {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} {t("regenerate")}
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50" data-testid="case-print">
          <Printer className="h-4 w-4" /> {t("print_summary")}
        </Button>
        <ShareDialog recordId={record.id} trigger={
          <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" data-testid="case-share"><Share2 className="h-4 w-4" /> {t("share")}</Button>
        } />
      </div>
    </div>
  );
}

function CaseHeader({ record }) {
  const { t } = useLang();
  const problems = [...(record.problems || []), record.other_problem].filter(Boolean).join(", ");
  const hasMeta = record.allergies || record.current_medicines || record.notes;
  return (
    <div className="mb-5 rounded-2xl border border-emerald-100 bg-white p-5 card-shadow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">{record.patient_name}</h1>
          <p className="text-sm text-slate-500">{problems || "—"}</p>
          <p className="mt-1 text-xs text-slate-400">{fmtDateTime(record.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {record.relation ? <Badge variant="outline" className="border-emerald-200 text-emerald-700">{record.relation}</Badge> : null}
          {record.severity ? <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">{record.severity}</Badge> : null}
          {record.duration ? <Badge variant="outline">{record.duration}</Badge> : null}
        </div>
      </div>
      {hasMeta ? (
        <div className="mt-4 grid gap-3 border-t border-emerald-50 pt-4 sm:grid-cols-3">
          <MetaField label={t("allergies")} value={record.allergies} />
          <MetaField label={t("current_medicines")} value={record.current_medicines} />
          <MetaField label={t("notes")} value={record.notes} pre />
        </div>
      ) : null}
      <FollowupList followups={record.followups} className="mt-4 border-t border-emerald-50 pt-4" />
    </div>
  );
}

export default function CaseDetail() {
  const { id } = useParams();
  const { t } = useLang();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await api.get(`/cases/${id}`);
      setRecord(data);
    } catch (e) {
      setError(apiError(e, "Could not load this case."));
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const regenerate = async () => {
    setRegenerating(true);
    try {
      const { data } = await api.post(`/cases/${id}/regenerate`, {}, { timeout: 90000 });
      setRecord(data);
      toast.success(t("regenerate"));
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setRegenerating(false);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center" data-testid="case-error">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <Button asChild variant="outline" className="mt-4"><Link to="/history">{t("nav_history")}</Link></Button>
        </div>
      </Layout>
    );
  }
  if (!record) {
    return <Layout><div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl" data-testid="case-detail">
        <CaseActions record={record} regenerating={regenerating} onRegenerate={regenerate} />
        <CaseHeader record={record} />
        <CaseSummary summary={record.ai_summary} />
        <div className="no-print mt-6 flex justify-center">
          <Button asChild variant="outline" className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            <Link to="/doctors" data-testid="case-find-doctor"><Search className="h-4 w-4" /> {t("find_doctor_for")}</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
