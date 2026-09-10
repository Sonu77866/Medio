import { useState, useEffect, useCallback } from "react";
import { Plus, X, Building2, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, apiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { toast } from "sonner";

function Panel({ title, icon: Icon, listPath, adminBase, testid }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(listPath);
      setItems(data);
    } catch {
      setItems([]);
    }
  }, [listPath]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    const name = value.trim();
    if (!name) return;
    setBusy(true);
    try {
      await api.post(adminBase, { name });
      setValue("");
      toast.success(t("add"));
      load();
    } catch (e) { toast.error(apiError(e)); }
    finally { setBusy(false); }
  };

  const remove = async (name) => {
    try {
      await api.delete(`${adminBase}/${encodeURIComponent(name)}`);
      load();
    } catch (e) { toast.error(apiError(e)); }
  };

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 card-shadow" data-testid={testid}>
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><Icon className="h-4 w-4" /></span>
        <h3 className="font-display text-base font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="mb-3 flex gap-2">
        <Input value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder={title} data-testid={`${testid}-input`} />
        <Button onClick={add} disabled={busy} size="icon" className="shrink-0 bg-emerald-600 hover:bg-emerald-700" data-testid={`${testid}-add`}><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((name) => (
          <span key={name} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-800" data-testid={`${testid}-item-${name}`}>
            {name}
            <button type="button" onClick={() => remove(name)} className="text-emerald-500 hover:text-red-500" aria-label={`Remove ${name}`}><X className="h-3.5 w-3.5" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminTaxonomy() {
  const { t } = useLang();
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <Panel title={t("manage_departments")} icon={Building2} listPath="/departments" adminBase="/admin/departments" testid="admin-departments" />
      <Panel title={t("manage_specializations")} icon={Stethoscope} listPath="/specializations" adminBase="/admin/specializations" testid="admin-specializations" />
    </div>
  );
}
