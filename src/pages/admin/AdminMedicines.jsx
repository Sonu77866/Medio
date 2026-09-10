import { useState, useEffect, useCallback } from "react";
import { Loader2, Search, Pill, Plus, Trash2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api, apiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { toast } from "sonner";

const EMPTY = {
  generic_name: "", brand_names: "", medicine_class: "", uses: "", mechanism: "",
  forms: "", strengths: "", side_effects: "", serious_warnings: "", precautions: "",
  interactions: "", prescription_status: "", symptom_categories: "", source: "",
};

const toList = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

export default function AdminMedicines() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [meds, setMeds] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/medicines", { params: q.trim() ? { q: q.trim() } : {} });
      setMeds(data);
    } catch (e) { toast.error(apiError(e)); setMeds([]); }
  }, [q]);

  useEffect(() => { const timer = setTimeout(load, 300); return () => clearTimeout(timer); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = async () => {
    if (!form.generic_name.trim()) return toast.error("Generic name is required.");
    setBusy(true);
    try {
      await api.post("/admin/medicines", {
        generic_name: form.generic_name.trim(),
        brand_names: toList(form.brand_names),
        medicine_class: form.medicine_class,
        uses: form.uses,
        mechanism: form.mechanism,
        forms: toList(form.forms),
        strengths: toList(form.strengths),
        side_effects: toList(form.side_effects),
        serious_warnings: toList(form.serious_warnings),
        precautions: toList(form.precautions),
        interactions: toList(form.interactions),
        prescription_status: form.prescription_status,
        symptom_categories: toList(form.symptom_categories),
        source: form.source || "Administrator entry",
        verification_status: "verified-reference",
      });
      toast.success(t("save"));
      setOpen(false);
      setForm(EMPTY);
      load();
    } catch (e) { toast.error(apiError(e)); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    try { await api.delete(`/admin/medicines/${id}`); toast.success("Deleted"); load(); }
    catch (e) { toast.error(apiError(e)); }
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-slate-900">{t("admin_medicines")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" data-testid="admin-add-medicine"><Plus className="h-4 w-4" /> {t("add")}</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto" data-testid="admin-medicine-dialog">
            <DialogHeader><DialogTitle>{t("add")} — {t("admin_medicines")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <F label={t("uses").replace(t("uses"), "Generic name")} v={form.generic_name} on={set("generic_name")} testid="med-generic" />
              <F label="Brand names (comma separated)" v={form.brand_names} on={set("brand_names")} />
              <F label={t("prescription_status")} v={form.prescription_status} on={set("prescription_status")} />
              <div className="space-y-1.5"><Label>Medicine class</Label><Input value={form.medicine_class} onChange={set("medicine_class")} /></div>
              <div className="space-y-1.5"><Label>{t("uses")}</Label><Textarea value={form.uses} onChange={set("uses")} rows={2} /></div>
              <div className="space-y-1.5"><Label>{t("mechanism")}</Label><Textarea value={form.mechanism} onChange={set("mechanism")} rows={2} /></div>
              <F label={`${t("forms")} (comma separated)`} v={form.forms} on={set("forms")} />
              <F label={`${t("strengths")} (comma separated)`} v={form.strengths} on={set("strengths")} />
              <F label={`${t("side_effects")} (comma separated)`} v={form.side_effects} on={set("side_effects")} />
              <F label={`${t("serious_warnings")} (comma separated)`} v={form.serious_warnings} on={set("serious_warnings")} />
              <F label={`${t("precautions")} (comma separated)`} v={form.precautions} on={set("precautions")} />
              <F label={`${t("interactions")} (comma separated)`} v={form.interactions} on={set("interactions")} />
              <F label="Symptom categories (comma separated)" v={form.symptom_categories} on={set("symptom_categories")} />
              <F label={t("source")} v={form.source} on={set("source")} />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>{t("cancel")}</Button>
              <Button onClick={create} disabled={busy} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" data-testid="med-save">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{t("save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search_medicine")} className="pl-9" data-testid="admin-medicine-search" />
      </div>

      {meds === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
      ) : meds.length === 0 ? (
        <div className="rounded-2xl border border-emerald-100 bg-white p-12 text-center card-shadow"><Pill className="mx-auto mb-3 h-8 w-8 text-emerald-500" /><p className="text-slate-500">{t("no_medicines")}</p></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="admin-medicines-list">
          {meds.map((m) => (
            <div key={m.id} className="rounded-2xl border border-emerald-100 bg-white p-4 card-shadow" data-testid={`admin-medicine-${m.id}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display font-semibold text-slate-900">{m.generic_name}</p>
                  <p className="text-xs text-slate-500">{m.medicine_class}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" data-testid={`admin-medicine-delete-${m.id}`}><Trash2 className="h-4 w-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete {m.generic_name}?</AlertDialogTitle><AlertDialogDescription>This will remove the medicine record.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(m.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              {m.prescription_status ? <Badge variant="outline" className="mt-2 border-emerald-200 text-emerald-700">{m.prescription_status}</Badge> : null}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

function F({ label, v, on, testid }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={v} onChange={on} data-testid={testid} />
    </div>
  );
}
