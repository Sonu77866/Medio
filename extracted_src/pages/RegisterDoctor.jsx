import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Stethoscope, Upload, Check, X } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, apiError } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { validatePassword, passwordChecklist } from "@/lib/validation";
import { cn } from "@/lib/utils";

const EMPTY = {
  full_name: "", email: "", phone: "", password: "", confirm_password: "",
  specialization: "", department: "", experience: "", qualification: "",
  college: "", registration_number: "", registration_authority: "",
  hospital: "", branch: "", bio: "", consultation_info: "",
};

export default function RegisterDoctor() {
  const { t } = useLang();
  const { registerDoctor } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [photo, setPhoto] = useState(null);
  const [depts, setDepts] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/departments").then((r) => setDepts(r.data)).catch(() => {});
    api.get("/specializations").then((r) => setSpecs(r.data)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setVal = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const checklist = passwordChecklist(form.password);

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Profile photo must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const required = ["full_name", "email", "phone", "specialization", "department", "experience", "qualification", "college", "registration_number", "registration_authority", "hospital"];
    for (const r of required) {
      if (!String(form[r]).trim()) return setError(`${t(mapLabel(r))} ${t("required").toLowerCase()}.`);
    }
    const pwErr = validatePassword(form.password);
    if (pwErr) return setError(pwErr);
    if (form.password !== form.confirm_password) return setError("Passwords do not match.");
    setBusy(true);
    try {
      await registerDoctor({ ...form, photo });
      navigate("/doctor", { replace: true });
    } catch (err) {
      setError(apiError(err, "Registration failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title={t("doctor_register_title")} subtitle={t("doctor_register_sub")}
      footer={<>{t("have_account")} <Link to="/login" className="font-semibold text-emerald-700 hover:underline" data-testid="go-login">{t("login")}</Link></>}>
      <form onSubmit={submit} className="space-y-4" data-testid="doctor-register-form">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50">
            {photo ? <img src={photo} alt="preview" className="h-full w-full object-cover" /> : <Stethoscope className="h-6 w-6 text-emerald-500" />}
          </div>
          <div>
            <Label className="mb-1 block">{t("profile_photo")}</Label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50" data-testid="doctor-photo-label">
              <Upload className="h-4 w-4" /> {t("upload_photo")}
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} data-testid="doctor-photo-input" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("full_name")} id="full_name" value={form.full_name} onChange={set("full_name")} testid="doctor-name" />
          <Field label={t("email")} id="email" type="email" value={form.email} onChange={set("email")} testid="doctor-email" />
          <Field label={t("phone")} id="phone" value={form.phone} onChange={set("phone")} testid="doctor-phone" />
          <Field label={t("experience")} id="experience" value={form.experience} onChange={set("experience")} testid="doctor-experience" placeholder="e.g. 8 years" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("department")}</Label>
            <Select value={form.department} onValueChange={setVal("department")}>
              <SelectTrigger data-testid="doctor-department"><SelectValue placeholder={t("select")} /></SelectTrigger>
              <SelectContent>{depts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("specialization")}</Label>
            <Select value={form.specialization} onValueChange={setVal("specialization")}>
              <SelectTrigger data-testid="doctor-specialization"><SelectValue placeholder={t("select")} /></SelectTrigger>
              <SelectContent>{specs.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("qualification")} id="qualification" value={form.qualification} onChange={set("qualification")} testid="doctor-qualification" placeholder="MBBS, MD" />
          <Field label={t("college")} id="college" value={form.college} onChange={set("college")} testid="doctor-college" />
          <Field label={t("reg_number")} id="registration_number" value={form.registration_number} onChange={set("registration_number")} testid="doctor-reg-number" />
          <Field label={t("reg_authority")} id="registration_authority" value={form.registration_authority} onChange={set("registration_authority")} testid="doctor-reg-authority" />
          <Field label={t("hospital")} id="hospital" value={form.hospital} onChange={set("hospital")} testid="doctor-hospital" />
          <Field label={t("branch")} id="branch" value={form.branch} onChange={set("branch")} testid="doctor-branch" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">{t("bio")}</Label>
          <Textarea id="bio" value={form.bio} onChange={set("bio")} data-testid="doctor-bio" rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="consultation_info">{t("consultation_info")}</Label>
          <Textarea id="consultation_info" value={form.consultation_info} onChange={set("consultation_info")} data-testid="doctor-consultation" rows={2} placeholder="e.g. Mon-Fri, 10am-4pm" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" value={form.password} onChange={set("password")} data-testid="doctor-password" autoComplete="new-password" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">{t("confirm_password")}</Label>
            <Input id="confirm_password" type="password" value={form.confirm_password} onChange={set("confirm_password")} data-testid="doctor-confirm" autoComplete="new-password" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {checklist.map((c) => (
            <span key={c.label} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", c.ok ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
              {c.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}{c.label}
            </span>
          ))}
        </div>

        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" data-testid="doctor-register-error">{error}</p> : null}
        <Button type="submit" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={busy} data-testid="doctor-register-submit">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stethoscope className="h-4 w-4" />}
          {t("submit_for_verification")}
        </Button>
      </form>
    </AuthShell>
  );
}

function Field({ label, id, value, onChange, type = "text", testid, placeholder }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={onChange} data-testid={testid} placeholder={placeholder} />
    </div>
  );
}

function mapLabel(key) {
  const m = {
    full_name: "full_name", email: "email", phone: "phone",
    specialization: "specialization", department: "department", experience: "experience",
    qualification: "qualification", college: "college", registration_number: "reg_number",
    registration_authority: "reg_authority", hospital: "hospital",
  };
  return m[key] || key;
}
