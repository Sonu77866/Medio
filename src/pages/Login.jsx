import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, apiError } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { HOME_BY_ROLE } from "@/components/ProtectedRoute";

export default function Login() {
  const { t } = useLang();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(identifier.trim(), password);
      const dest = location.state?.from || HOME_BY_ROLE[user.role] || "/";
      navigate(dest, { replace: true });
    } catch (err) {
      setError(apiError(err, "Invalid credentials. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={t("signin_title")}
      subtitle={t("signin_sub")}
      footer={
        <>
          {t("no_account")}{" "}
          <Link to="/register" className="font-semibold text-emerald-700 hover:underline" data-testid="go-register">
            {t("register")}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" data-testid="login-form">
        <div className="space-y-1.5">
          <Label htmlFor="identifier">{t("identifier")}</Label>
          <Input
            id="identifier"
            data-testid="login-identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            data-testid="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" data-testid="login-error">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={busy} data-testid="login-submit">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {t("login")}
        </Button>
      </form>

      {/* 1-Click Quick Demo Access */}
      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          ⚡ Quick Demo Accounts (1-Click)
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          Click any role below to instantly populate credentials and test:
        </p>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setIdentifier("patient@ayucore.com");
              setPassword("patient123");
            }}
            className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-white py-2 px-1 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            <span className="text-xs font-semibold text-emerald-800">Patient</span>
            <span className="text-[10px] text-slate-500">Intake & History</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIdentifier("doctor@ayucore.com");
              setPassword("doctor123");
            }}
            className="flex flex-col items-center justify-center rounded-xl border border-teal-200 bg-white py-2 px-1 text-center transition hover:border-teal-400 hover:bg-teal-50"
          >
            <span className="text-xs font-semibold text-teal-800">Doctor</span>
            <span className="text-[10px] text-slate-500">Review Cases</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIdentifier("admin@ayucore.com");
              setPassword("admin123");
            }}
            className="flex flex-col items-center justify-center rounded-xl border border-purple-200 bg-white py-2 px-1 text-center transition hover:border-purple-400 hover:bg-purple-50"
          >
            <span className="text-xs font-semibold text-purple-800">Admin</span>
            <span className="text-[10px] text-slate-500">Audit & Verify</span>
          </button>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-slate-500">
        {t("register_as_doctor")}?{" "}
        <Link to="/register/doctor" className="font-semibold text-emerald-700 hover:underline" data-testid="go-register-doctor">
          {t("doctor_register_title")}
        </Link>
      </div>
    </AuthShell>
  );
}
