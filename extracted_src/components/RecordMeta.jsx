import { useLang } from "@/context/LanguageContext";

export function MetaField({ label, value, pre = false }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className={`text-sm text-slate-700${pre ? " whitespace-pre-line" : ""}`}>{value}</p>
    </div>
  );
}

export function FollowupList({ followups, className }) {
  const { t } = useLang();
  if (!Array.isArray(followups) || followups.length === 0) return null;
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-semibold uppercase text-slate-400">{t("sec_followups")}</p>
      <div className="space-y-1.5">
        {followups.map((f) => (
          <div key={f.question} className="text-sm">
            <span className="text-slate-500">{f.question}</span>{" "}
            <span className="font-medium text-slate-800">{f.answer || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
