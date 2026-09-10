import {
  Stethoscope, ClipboardList, Building2, UserCog, AlertTriangle,
  GraduationCap, ListChecks, MessageCircleQuestion, Pill, HelpCircle,
} from "lucide-react";
import { AiDisclaimer, EmergencyNote } from "@/components/Disclaimers";
import { useLang } from "@/context/LanguageContext";

function Section({ icon: Icon, title, children, testid, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 card-shadow" data-testid={testid}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="font-display text-base font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={`${it}-${i}`} className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export default function CaseSummary({ summary }) {
  const { t } = useLang();
  if (!summary) return null;
  const s = summary;

  return (
    <div className="space-y-5" data-testid="case-summary">
      <AiDisclaimer />
      {s.ai_generated === false ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-sm font-medium text-blue-800" data-testid="ai-fallback-notice">
          {t("fallback_notice")}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Section icon={ClipboardList} title={t("sec_summary")} testid="summary-problem">
          {s.problem_summary}
        </Section>
        <Section icon={ClipboardList} title={t("sec_history")} testid="summary-history">
          {s.clinical_history}
        </Section>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Section icon={Building2} title={t("sec_department")} testid="summary-department" tone="blue">
          <span className="font-semibold text-slate-800">{s.possible_department}</span>
        </Section>
        <Section icon={UserCog} title={t("sec_specialist")} testid="summary-specialist" tone="blue">
          <span className="font-semibold text-slate-800">{s.specialist_type}</span>
        </Section>
      </div>

      {Array.isArray(s.followup_questions) && s.followup_questions.length > 0 && (
        <Section icon={MessageCircleQuestion} title={t("sec_followups")} testid="summary-followups">
          <BulletList items={s.followup_questions} />
        </Section>
      )}

      <Section icon={AlertTriangle} title={t("sec_warnings")} testid="summary-warnings" tone="red">
        <BulletList items={s.warning_signs || []} />
        <div className="mt-3">
          <EmergencyNote />
        </div>
      </Section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section icon={GraduationCap} title={t("sec_education")} testid="summary-education" tone="amber">
          {s.health_education}
        </Section>
        <Section icon={ListChecks} title={t("sec_next")} testid="summary-next">
          <BulletList items={s.next_steps || []} />
        </Section>
      </div>

      <Section icon={HelpCircle} title={t("sec_questions")} testid="summary-questions">
        <BulletList items={s.questions_for_doctor || []} />
      </Section>

      {/* Medicine information is ALWAYS the final section */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5" data-testid="summary-medicine">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
            <Pill className="h-4 w-4" />
          </span>
          <h3 className="font-display text-base font-semibold text-slate-900">{t("sec_medicine")}</h3>
        </div>
        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800" data-testid="medicine-disclaimer">
          {t("med_disclaimer")}
        </div>
        {Array.isArray(s.medicine_information) && s.medicine_information.length > 0 ? (
          <ul className="space-y-2">
            {s.medicine_information.map((m, i) => (
              <li key={`${m.name}-${i}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                <span className="font-semibold text-slate-800">{m.name}</span>
                {m.note ? <span className="block text-sm text-slate-500">{m.note}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500" data-testid="medicine-empty">
            No verified medicine information to show for this case. Please consult a verified doctor.
          </p>
        )}
      </div>
    </div>
  );
}
