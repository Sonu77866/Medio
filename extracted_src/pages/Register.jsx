import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, UserPlus, Check, X } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, apiError } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { validatePassword, passwordChecklist } from "@/lib/validation";
import { cn } from "@/lib/utils";

export default function Register() {
  const { t } = useLang();
  const { registerPatient } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", password: "", confirm_password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const checklist = passwordChecklist(form.password);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.full_name.trim()) return setError("Full name is required.");
    const pwErr = validatePassword(form.password);
    if (pwErr) return setError(pwErr);
    if (form.password !== form.confirm_password) return setError("Passwords do not match.");
    setBusy(true);
    try {
      await registerPatient({
        full_name: form.full_name.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
      });
      navigate("/patient", { replace: true });
    } catch (err) {
      setError(apiError(err, "Registration failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={t("create_patient_account")}
      subtitle={t("hero_sub")}
      footer={
        <>
          {t("have_account")}{" "}
          <Link to="/login" className="font-semibold text-emerald-700 hover:underline" data-testid="go-login">
            {t("login")}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" data-testid="register-form">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">{t("full_name")}</Label>
          <Input id="full_name" data-testid="register-name" value={form.full_name} onChange={set("full_name")} required />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input id="phone" data-testid="register-phone" value={form.phone} onChange={set("phone")} inputMode="tel" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" data-testid="register-email" value={form.email} onChange={set("email")} type="email" autoComplete="email" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("password")}</Label>
          <Input id="password" type="password" data-testid="register-password" value={form.password} onChange={set("password")} autoComplete="new-password" required />
          <div className="mt-1.5 flex flex-wrap gap-1.5" data-testid="password-checklist">
            {checklist.map((c) => (
              <span
                key={c.label}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  c.ok ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}
              >
                {c.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {c.label}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm_password">{t("confirm_password")}</Label>
          <Input id="confirm_password" type="password" data-testid="register-confirm" value={form.confirm_password} onChange={set("confirm_password")} autoComplete="new-password" required />
        </div>
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" data-testid="register-error">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={busy} data-testid="register-submit">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {t("register")}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm text-slate-500">
        {t("register_as_doctor")}?{" "}
        <Link to="/register/doctor" className="font-semibold text-emerald-700 hover:underline" data-testid="go-register-doctor">
          {t("doctor_register_title")}
        </Link>
      </div>
    </AuthShell>
  );
}
