import { useState, useEffect } from "react";
import { Loader2, Search, Share2, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, apiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { toast } from "sonner";

export default function ShareDialog({ recordId, trigger, onShared }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sharingId, setSharingId] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .get("/doctors", { params: { q } })
        .then((r) => setDoctors(r.data))
        .catch(() => setDoctors([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [q, open]);

  const share = async (doctorId) => {
    setSharingId(doctorId);
    try {
      await api.post("/shares", { record_id: recordId, doctor_id: doctorId });
      toast.success(t("share"));
      setOpen(false);
      onShared && onShared();
    } catch (e) {
      toast.error(apiError(e, "Could not share this record."));
    } finally {
      setSharingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg" data-testid="share-dialog">
        <DialogHeader>
          <DialogTitle>{t("share")}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search_name")} className="pl-9" data-testid="share-search" />
        </div>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
          ) : doctors.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500" data-testid="share-empty">{t("no_doctors")}</p>
          ) : (
            doctors.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white p-3" data-testid={`share-doctor-${d.id}`}>
                <div>
                  <p className="font-semibold text-slate-800">{d.full_name}</p>
                  <p className="text-xs text-slate-500">{d.specialization} · {d.hospital}</p>
                </div>
                <Button size="sm" onClick={() => share(d.id)} disabled={sharingId === d.id} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" data-testid={`share-confirm-${d.id}`}>
                  {sharingId === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                  {t("share")}
                </Button>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>{t("close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
