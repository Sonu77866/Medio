import { ShieldCheck, AlertTriangle } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export function AiDisclaimer({ compact }) {
  const { t } = useLang();
  const chips = [
    t("ai_assisted"),
    t("requires_verification"),
    t("not_diagnosis"),
    t("not_replacement"),
  ];
  return (
    <div
      data-testid="ai-disclaimer"
      className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3"
    >
      <div className="flex items-start gap-2.5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-900">{t("ai_assisted")}</p>
          {!compact && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-800"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmergencyNote() {
  const { t } = useLang();
  return (
    <div
      data-testid="emergency-note"
      className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
      <p className="text-sm font-medium text-red-800">{t("emergency_note")}</p>
    </div>
  );
}
