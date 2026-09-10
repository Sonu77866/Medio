import { useState, useEffect, useMemo } from "react";
import { Loader2, Search, Inbox, Clock, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CaseSummary from "@/components/CaseSummary";
import { MetaField, FollowupList } from "@/components/RecordMeta";
import { api, apiError } from "@/lib/api";
import { fmtDateTime } from "@/lib/format";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

const ALL = "__all__";

function StatusBanner({ status }) {
  const { t } = useLang();
  const isRejected = status === "REJECTED";
  return (
    <div className={`rounded-2xl border p-6 ${isRejected ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`} data-testid="doctor-status-banner">
      <div className="flex items-start gap-3">
        <AlertCircle className={`mt-0.5 h-6 w-6 ${isRejected ? "text-red-600" : "text-amber-600"}`} />
        <div>
          <Badge className={isRejected ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>{status}</Badge>
          <p className={`mt-2 text-sm font-medium ${isRejected ? "text-red-800" : "text-amber-800"}`}>
            {isRejected ? t("rejected_banner") : t("pending_banner")}
          </p>
        </div>
      </div>
    </div>
  );
}

function Filters({ q, setQ, severity, setSeverity }) {
  const { t } = useLang();
  return (
    <div className="mb-6 grid gap-3 rounded-2xl border border-emerald-100 bg-white p-4 card-shadow sm:grid-cols-3">
      <div className="relative sm:col-span-2">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search_patient")} className="pl-9" data-testid="doctor-search-patient" />
      </div>
      <Select value={severity} onValueChange={setSeverity}>
        <SelectTrigger data-testid="doctor-filter-severity"><SelectValue placeholder={t("filter_severity")} /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("filter_severity")}</SelectItem>
          <SelectItem value="Mild">{t("sev_mild")}</SelectItem>
          <SelectItem value="Moderate">{t("sev_moderate")}</SelectItem>
          <SelectItem value="Severe">{t("sev_severe")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function SharedRecordItem({ r }) {
  const { t } = useLang();
  const problems = [...(r.problems || []), r.other_problem].filter(Boolean).join(", ");
  return (
    <AccordionItem value={r.id} className="overflow-hidden rounded-2xl border border-emerald-100 bg-white card-shadow" data-testid={`doctor-record-${r.id}`}>
      <AccordionTrigger className="px-5 py-4 hover:no-underline">
        <div className="flex flex-1 flex-wrap items-center justify-between gap-2 pr-3 text-left">
          <div>
            <p className="font-display text-lg font-semibold text-slate-900">{r.patient_name}</p>
            <p className="text-sm text-slate-500">{problems || "—"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {r.severity ? <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">{r.severity}</Badge> : null}
            <Badge className="gap-1 bg-blue-100 text-blue-700">{t("status_active")}</Badge>
            <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3.5 w-3.5" /> {fmtDateTime(r.shared_at)}</span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="border-t border-emerald-50 px-5 pb-6 pt-4">
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <MetaField label={t("allergies")} value={r.allergies} />
          <MetaField label={t("current_medicines")} value={r.current_medicines} />
          <MetaField label={t("notes")} value={r.notes} pre />
        </div>
        <FollowupList followups={r.followups} className="mb-4 rounded-xl border border-emerald-50 bg-emerald-50/40 p-3" />
        <CaseSummary summary={r.ai_summary} />
      </AccordionContent>
    </AccordionItem>
  );
}

function EmptyState() {
  const { t } = useLang();
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-12 text-center card-shadow" data-testid="doctor-empty">
      <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"><Inbox className="h-7 w-7" /></span>
      <h3 className="font-display text-lg font-semibold text-slate-800">{t("no_shared")}</h3>
      <p className="mt-1 text-sm text-slate-500">{t("no_shared_sub")}</p>
    </div>
  );
}

function RecordList({ records, error, filtered }) {
  if (records === null) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"><p className="text-sm font-medium text-red-700">{error}</p></div>;
  if (filtered.length === 0) return <EmptyState />;
  return (
    <Accordion type="single" collapsible className="space-y-3" data-testid="doctor-shared-list">
      {filtered.map((r) => <SharedRecordItem key={r.id} r={r} />)}
    </Accordion>
  );
}

export default function DoctorDashboard() {
  const { t } = useLang();
  const { user } = useAuth();
  const [records, setRecords] = useState(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [severity, setSeverity] = useState(ALL);

  const status = user?.doctor_status;
  const verified = !status || status === "VERIFIED";

  useEffect(() => {
    if (!verified) {
      setRecords([]);
      return;
    }
    api.get("/shares/doctor/shared")
      .then((r) => setRecords(r.data))
      .catch((e) => { setError(apiError(e)); setRecords([]); });
  }, [verified]);

  const filtered = useMemo(() => {
    if (!records) return [];
    const needle = q.trim().toLowerCase();
    return records.filter((r) =>
      (!needle || r.patient_name?.toLowerCase().includes(needle)) &&
      (severity === ALL || r.severity === severity)
    );
  }, [records, q, severity]);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">{t("doctor_dash_title")}</h1>
        {verified ? <p className="mt-1.5 text-slate-500">{t("doctor_dash_sub")}</p> : null}
      </div>
      {!verified ? (
        <StatusBanner status={status} />
      ) : (
        <>
          <Filters q={q} setQ={setQ} severity={severity} setSeverity={setSeverity} />
          <RecordList records={records} error={error} filtered={filtered} />
        </>
      )}
    </Layout>
  );
}
