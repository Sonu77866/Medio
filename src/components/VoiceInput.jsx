import { Mic, Square, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/context/LanguageContext";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

function VoiceReview({ transcript, onChange, onConfirm, onCancel }) {
  const { t } = useLang();
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3" data-testid="voice-review">
      <p className="mb-2 text-xs font-medium text-emerald-800">{t("voice_edit_hint")}</p>
      <Textarea
        value={transcript}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        data-testid="voice-transcript"
        className="bg-white"
      />
      <div className="mt-2 flex gap-2">
        <Button type="button" size="sm" onClick={onConfirm} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" data-testid="voice-confirm">
          <Check className="h-4 w-4" /> {t("voice_add")}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} data-testid="voice-cancel">
          <X className="h-4 w-4" /> {t("cancel")}
        </Button>
      </div>
    </div>
  );
}

function RecordControls({ state, onStart, onStop }) {
  const { t } = useLang();
  const transcribing = state === "transcribing";
  return (
    <div className="flex items-center gap-3">
      {state === "recording" ? (
        <Button type="button" variant="destructive" size="sm" onClick={onStop} className="gap-1.5 pulse-ring" data-testid="voice-stop">
          <Square className="h-4 w-4" /> {t("voice_stop")}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onStart}
          disabled={transcribing}
          className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          data-testid="voice-start"
        >
          {transcribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
          {transcribing ? t("voice_transcribing") : t("voice_start")}
        </Button>
      )}
      <span className="text-xs text-slate-500">
        {state === "recording" ? t("voice_recording") : transcribing ? t("voice_transcribing") : ""}
      </span>
    </div>
  );
}

export default function VoiceInput({ onResult }) {
  const { state, transcript, setTranscript, start, stop, reset } = useVoiceRecorder();

  const confirm = () => {
    const text = transcript.trim();
    if (text) onResult(text);
    reset();
  };

  if (state === "review") {
    return <VoiceReview transcript={transcript} onChange={setTranscript} onConfirm={confirm} onCancel={reset} />;
  }
  return <RecordControls state={state} onStart={start} onStop={stop} />;
}
