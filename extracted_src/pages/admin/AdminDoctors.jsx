import { useState, useEffect, useCallback } from "react";
import {
  Loader2, Stethoscope, Check, X, Building2, GraduationCap, MapPin, Award, ShieldCheck, Inbox,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { api, apiError } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { toast } from "sonner";

const STATUS_STYLE = {
  PENDING: "bg-amber-100 text-amber-700",
  VERIFIED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function AdminDoctors() {
  const { t } = useLang();
  const [status, setStatus] = useState("PENDING");
  const [doctors, setDoctors] = useState(null);
  const [selected, setSelected] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setDoctors(null);
    try {
      const { data } = await api.get("/admin/doctors", { params: { status } });
      setDoctors(data);
    } catch (e) {
      toast.error(apiError(e));
      setDoctors([]);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    setBusy(true);
    try {
      await api.post(`/admin/doctors/${id}/approve`);
      toast.success(t("approve"));
      setSelected(null);
      load();
    } catch (e) { toast.error(apiError(e)); }
    finally { setBusy(false); }
  };

  const reject = async (id) => {
    if (!reason.trim()) return toast.error(t("rejection_reason"));
    setBusy(true);
    try {
      await api.post(`/admin/doctors/${id}/reject`, { reason: reason.trim() });
      toast.success(t("reject"));
      setRejecting(null);
      setSelected(null);
      setReason("");
      load();
    } catch (e) { toast.error(apiError(e)); }
    finally { setBusy(false); }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">{t("admin_doctors")}</h1>
      </div>

      <Tabs value={status} onValueChange={setStatus} className="mb-6">
        <TabsList data-testid="doctor-status-tabs">
          <TabsTrigger value="PENDING" data-testid="tab-pending">{t("tab_pending")}</TabsTrigger>
          <TabsTrigger value="VERIFIED" data-testid="tab-verified">{t("tab_verified")}</TabsTrigger>
          <TabsTrigger value="REJECTED" data-testid="tab-rejected">{t("tab_rejected")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {doctors === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
      ) : doctors.length === 0 ? (
        <div className="rounded-2xl border border-emerald-100 bg-white p-12 text-center card-shadow" data-testid="admin-doctors-empty">
          <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"><Inbox className="h-7 w-7" /></span>
          <p className="font-display text-lg font-semibold text-slate-800">No {status.toLowerCase()} doctors</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2" data-testid="admin-doctors-list">
          {doctors.map((d) => (
            <div key={d.id} className="rounded-2xl border border-emerald-100 bg-white p-5 card-shadow" data-testid={`admin-doctor-${d.id}`}>
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 border border-emerald-100">
                  <AvatarImage src={d.photo || undefined} alt={d.full_name} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700"><Stethoscope className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-display text-lg font-semibold text-slate-900">{d.full_name}</h3>
                    <Badge className={STATUS_STYLE[d.status]}>{d.status}</Badge>
                  </div>
                  <p className="text-sm text-emerald-700">{d.specialization} · {d.department}</p>
                  <p className="text-xs text-slate-400">{d.email} · {d.phone}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelected(d)} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" data-testid={`admin-doctor-view-${d.id}`}>{t("view_profile")}</Button>
                {d.status !== "VERIFIED" && (
                  <Button size="sm" onClick={() => approve(d.id)} disabled={busy} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" data-testid={`admin-approve-${d.id}`}><Check className="h-4 w-4" /> {t("approve")}</Button>
                )}
                {d.status !== "REJECTED" && (
                  <Button size="sm" variant="outline" onClick={() => { setRejecting(d); setReason(""); }} className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50" data-testid={`admin-reject-${d.id}`}><X className="h-4 w-4" /> {t("reject")}</Button>
                )}
              </div>
              {d.status === "REJECTED" && d.rejection_reason ? (
                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"><span className="font-semibold">{t("rejection_reason")}:</span> {d.rejection_reason}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto" data-testid="admin-doctor-dialog">
          {selected && (
            <>
              <DialogHeader><DialogTitle>{selected.full_name}</DialogTitle></DialogHeader>
              <div className="space-y-2 text-sm">
                <Detail icon={Stethoscope} label={t("specialization")} value={selected.specialization} />
                <Detail icon={Building2} label={t("department")} value={selected.department} />
                <Detail icon={Award} label={t("experience")} value={selected.experience} />
                <Detail icon={GraduationCap} label={t("qualification")} value={selected.qualification} />
                <Detail icon={GraduationCap} label={t("college")} value={selected.college} />
                <Detail icon={ShieldCheck} label={t("reg_number")} value={selected.registration_number} />
                <Detail icon={ShieldCheck} label={t("reg_authority")} value={selected.registration_authority} />
                <Detail icon={MapPin} label={t("hospital")} value={selected.hospital} />
                <Detail icon={MapPin} label={t("branch")} value={selected.branch} />
                {selected.bio ? <div className="pt-2"><p className="text-xs font-semibold uppercase text-slate-400">{t("bio")}</p><p className="text-slate-600">{selected.bio}</p></div> : null}
                {selected.consultation_info ? <div><p className="text-xs font-semibold uppercase text-slate-400">{t("consultation_info")}</p><p className="text-slate-600">{selected.consultation_info}</p></div> : null}
              </div>
              <DialogFooter className="gap-2">
                {selected.status !== "VERIFIED" && <Button onClick={() => approve(selected.id)} disabled={busy} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"><Check className="h-4 w-4" /> {t("approve")}</Button>}
                {selected.status !== "REJECTED" && <Button variant="outline" onClick={() => { setRejecting(selected); setReason(""); }} className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"><X className="h-4 w-4" /> {t("reject")}</Button>}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject reason dialog */}
      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent data-testid="admin-reject-dialog">
          <DialogHeader><DialogTitle>{t("reject")} — {rejecting?.full_name}</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{t("rejection_reason")}</label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} data-testid="reject-reason-input" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejecting(null)}>{t("cancel")}</Button>
            <Button onClick={() => reject(rejecting.id)} disabled={busy} className="bg-red-600 hover:bg-red-700" data-testid="reject-confirm">{t("reject")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function Detail({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-emerald-500" />
      <span className="text-slate-400">{label}:</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
