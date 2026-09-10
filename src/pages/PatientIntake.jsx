import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Thermometer, Wind, Activity, Utensils, BatteryLow, Pill, Baby,
  Stethoscope, Sparkles, Loader2, Plus, ClipboardPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import VoiceInput from "@/components/VoiceInput";
import { AiDisclaimer } from "@/components/Disclaimers";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { api, apiError } from "@/lib/api";
import { TEMPLATES, PROBLEM_OPTIONS, categoryFor, followupQuestions } from "@/lib/templates";
import { cn } from "@/lib/utils";

const ICONS = { Thermometer, Wind, Activity, Utensils, BatteryLow, Pill, Baby, Stethoscope };

const emptyForm = (name = "") => ({
  patient_name: name,
  relation: "Self",
  problems: [],
  other_problem: "",
  duration: "",
  severity: "Mild",
  allergies: "",
  current_medicines: "",
  notes: "",
});

export default function PatientIntake() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => emptyForm(user?.name || ""));
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const problemOptions = PROBLEM_OPTIONS[lang] || PROBLEM_OPTIONS.en;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const category = useMemo(
    () => categoryFor(form.problems, form.other_problem),
    [form.problems, form.other_problem]
  );

  const applyTemplate = (tpl) => {
    setActiveTemplate(tpl.key);
    const vals = tpl.values;
    const next = {
      ...form,
      problems: vals.problems?.[lang] || vals.problems?.en || [],
      duration: vals.duration?.[lang] ?? vals.duration?.en ?? "",
      severity: vals.severity || "Mild",
      relation: vals.relation || form.relation,
      other_problem: "",
    };
    setForm(next);
    const cat = categoryFor(next.problems, "") === "other" ? tpl.category : categoryFor(next.problems, "");
    setFollowups(followupQuestions(tpl.category || cat, lang));
    toast.success(t("template_applied"));
  };

  const customEntry = () => {
    setActiveTemplate("custom");
    setForm(emptyForm(form.patient_name));
    setFollowups([]);
    toast.success(t("custom_applied"));
  };

  const toggleProblem = (p) => {
    setForm((f) => {
      const has = f.problems.includes(p);
      const problems = has ? f.problems.filter((x) => x !== p) : [...f.problems, p];
      return { ...f, problems };
    });
  };

  const loadFollowups = () => {
    setFollowups(followupQuestions(category, lang));
  };

  const setAnswer = (i, val) => {
    setFollowups((fs) => fs.map((f, idx) => (idx === i ? { ...f, answer: val } : f)));
  };

  const appendNote = (text) => {
    set("notes", form.notes ? `${form.notes}\n${text}` : text);
  };

  const submit = async () => {
    if (!form.patient_name.trim()) {
      toast.error(t("patient_name") + " " + t("required").toLowerCase());
      return;
    }
    if (form.problems.length === 0 && !form.other_problem.trim()) {
      toast.error(t("health_problems") + " / " + t("other_problem"));
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(
        "/cases",
        { ...form, language: lang, followups },
        { timeout: 90000 }
      );
      toast.success(t("ai_assisted"));
      navigate(`/case/${data.id}`);
    } catch (e) {
      toast.error(apiError(e, "Could not generate the summary. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-slate-900">{t("intake_title")}</h1>
          <p className="mt-1.5 text-slate-500">{t("intake_sub")}</p>
        </div>

        <AiDisclaimer compact />

        {/* Templates */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">{t("quick_templates")}</h2>
            <Button variant="outline" size="sm" onClick={customEntry} data-testid="template-custom" className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <Plus className="h-4 w-4" /> {t("custom_entry")}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TEMPLATES.map((tpl) => {
              const Icon = ICONS[tpl.icon] || Stethoscope;
              const active = activeTemplate === tpl.key;
              return (
                <button
                  key={tpl.key}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  data-testid={`template-${tpl.key}`}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border bg-white p-4 text-left transition-colors",
                    active
                      ? "border-emerald-500 ring-2 ring-emerald-200"
                      : "border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/40"
                  )}
                >
                  <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl", active ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700")}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{tpl.label[lang] || tpl.label.en}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div className="mt-8 space-y-6 rounded-2xl border border-emerald-100 bg-white p-5 card-shadow sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="patient_name">{t("patient_name")}</Label>
              <Input id="patient_name" value={form.patient_name} onChange={(e) => set("patient_name", e.target.value)} data-testid="intake-name" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("relation")}</Label>
              <Select value={form.relation} onValueChange={(v) => set("relation", v)}>
                <SelectTrigger data-testid="intake-relation"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Self">{t("rel_self")}</SelectItem>
                  <SelectItem value="Child">{t("rel_child")}</SelectItem>
                  <SelectItem value="Parent">{t("rel_parent")}</SelectItem>
                  <SelectItem value="Spouse">{t("rel_spouse")}</SelectItem>
                  <SelectItem value="Other">{t("rel_other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("health_problems")}</Label>
            <div className="flex flex-wrap gap-2" data-testid="intake-problems">
              {problemOptions.map((p) => {
                const active = form.problems.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleProblem(p)}
                    data-testid={`problem-${p}`}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      active ? "border-emerald-500 bg-emerald-600 text-white" : "border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50"
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="other_problem">{t("other_problem")}</Label>
            <Input id="other_problem" value={form.other_problem} onChange={(e) => set("other_problem", e.target.value)} placeholder={t("other_problem_ph")} data-testid="intake-other-problem" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="duration">{t("duration")}</Label>
              <Input id="duration" value={form.duration} onChange={(e) => set("duration", e.target.value)} data-testid="intake-duration" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("severity")}</Label>
              <Select value={form.severity} onValueChange={(v) => set("severity", v)}>
                <SelectTrigger data-testid="intake-severity"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mild">{t("sev_mild")}</SelectItem>
                  <SelectItem value="Moderate">{t("sev_moderate")}</SelectItem>
                  <SelectItem value="Severe">{t("sev_severe")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="allergies">{t("allergies")}</Label>
              <Input id="allergies" value={form.allergies} onChange={(e) => set("allergies", e.target.value)} data-testid="intake-allergies" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="current_medicines">{t("current_medicines")}</Label>
              <Input id="current_medicines" value={form.current_medicines} onChange={(e) => set("current_medicines", e.target.value)} data-testid="intake-medicines" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="notes">{t("notes")}</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">{t("voice_input")}:</span>
                <VoiceInput onResult={appendNote} />
              </div>
            </div>
            <Textarea id="notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} data-testid="intake-notes" />
          </div>

          {/* Adaptive follow-ups */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{t("followup_title")}</h3>
                <p className="text-xs text-slate-500">{t("followup_sub")}</p>
              </div>
              {followups.length === 0 && (
                <Button type="button" variant="outline" size="sm" onClick={loadFollowups} data-testid="load-followups" className="border-emerald-200 text-emerald-700 hover:bg-emerald-100">
                  {t("add")}
                </Button>
              )}
            </div>
            {followups.length > 0 && (
              <div className="mt-3 space-y-3" data-testid="followups">
                {followups.map((f, i) => (
                  <div key={f.question} className="space-y-1">
                    <Label className="text-sm text-slate-600">{f.question}</Label>
                    <Input value={f.answer} onChange={(e) => setAnswer(i, e.target.value)} data-testid={`followup-${i}`} className="bg-white" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button onClick={submit} disabled={submitting} className="w-full gap-2 bg-emerald-600 text-base hover:bg-emerald-700" data-testid="submit-case">
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {submitting ? t("generating") : t("submit_case")}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
