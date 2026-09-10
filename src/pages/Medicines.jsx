import { useState, useEffect, useCallback } from "react";
import { Loader2, Search, Pill, AlertTriangle, Info } from "lucide-react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { api, apiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";

function Field({ label, items }) {
  if (!items || (Array.isArray(items) && items.length === 0)) return null;
  const list = Array.isArray(items) ? items : [items];
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <ul className="mt-1 space-y-1 text-sm text-slate-600">
        {list.map((x, i) => (
          <li key={`${x}-${i}`} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />{x}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Medicines() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [meds, setMeds] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await api.get("/medicines", { params: q.trim() ? { q: q.trim() } : {} });
      setMeds(data);
    } catch (e) {
      setError(apiError(e));
      setMeds([]);
    }
  }, [q]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">{t("medicines_title")}</h1>
        <p className="mt-1.5 text-slate-500">{t("medicines_sub")}</p>
      </div>

      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3" data-testid="medicine-page-warning">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-sm font-medium text-amber-800">{t("med_disclaimer")}</p>
      </div>

      <div className="relative mb-6 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search_medicine")} className="pl-9" data-testid="medicine-search" />
      </div>

      {meds === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"><p className="text-sm font-medium text-red-700">{error}</p><Button variant="outline" className="mt-3" onClick={load}>{t("retry")}</Button></div>
      ) : meds.length === 0 ? (
        <div className="rounded-2xl border border-emerald-100 bg-white p-12 text-center card-shadow" data-testid="medicines-empty">
          <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"><Pill className="h-7 w-7" /></span>
          <h3 className="font-display text-lg font-semibold text-slate-800">{t("no_medicines")}</h3>
          <p className="mt-1 text-sm text-slate-500">{t("no_medicines_sub")}</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-3" data-testid="medicines-list">
          {meds.map((m) => (
            <AccordionItem key={m.id} value={m.id} className="overflow-hidden rounded-2xl border border-emerald-100 bg-white card-shadow" data-testid={`medicine-${m.id}`}>
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex flex-1 flex-wrap items-center justify-between gap-2 pr-3 text-left">
                  <div>
                    <p className="font-display text-lg font-semibold text-slate-900">{m.generic_name}</p>
                    {m.brand_names?.length ? <p className="text-sm text-slate-500">{m.brand_names.join(", ")}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.medicine_class ? <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">{m.medicine_class}</Badge> : null}
                    {m.prescription_status ? <Badge variant="outline" className="border-emerald-200 text-emerald-700">{m.prescription_status}</Badge> : null}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t border-emerald-50 px-5 pb-6 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t("uses")} items={m.uses} />
                  <Field label={t("mechanism")} items={m.mechanism} />
                  <Field label={t("forms")} items={m.forms} />
                  <Field label={t("strengths")} items={m.strengths} />
                  <Field label={t("side_effects")} items={m.side_effects} />
                  <Field label={t("precautions")} items={m.precautions} />
                  <Field label={t("interactions")} items={m.interactions} />
                </div>
                {m.serious_warnings?.length ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50/70 p-3">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-red-700"><AlertTriangle className="h-3.5 w-3.5" /> {t("serious_warnings")}</p>
                    <ul className="space-y-1 text-sm text-red-800">
                      {m.serious_warnings.map((w, i) => <li key={`${w}-${i}`} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />{w}</li>)}
                    </ul>
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-emerald-50 pt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Info className="h-3.5 w-3.5" /> {t("source")}: {m.source}</span>
                  {m.verification_status ? <Badge variant="outline" className="border-emerald-200 text-emerald-700">{m.verification_status}</Badge> : null}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </Layout>
  );
}
