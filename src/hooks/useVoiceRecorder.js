import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";

const MAX_SECONDS = 120;

export const voiceSupported = () =>
  typeof navigator !== "undefined" &&
  !!navigator.mediaDevices &&
  typeof window !== "undefined" &&
  typeof window.MediaRecorder !== "undefined";

export function useVoiceRecorder() {
  const [state, setState] = useState("idle"); // idle | recording | transcribing | review
  const [transcript, setTranscript] = useState("");
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const transcribe = useCallback(async () => {
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    if (!blob.size) {
      setState("idle");
      toast.error("No audio was recorded. Please try again.");
      return;
    }
    const fd = new FormData();
    fd.append("audio", blob, "recording.webm");
    try {
      const { data } = await api.post("/voice/transcribe", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
      setTranscript(data.text || "");
      setState("review");
    } catch (e) {
      setState("idle");
      toast.error(apiError(e, "Transcription failed. Please type your text or try again."));
    }
  }, []);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    if (mediaRef.current?.state === "recording") {
      setState("transcribing");
      mediaRef.current.stop();
    }
  }, []);

  const start = useCallback(async () => {
    if (!voiceSupported()) {
      toast.error("Voice input is not supported in this browser. Please type instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        transcribe();
      };
      mediaRef.current = mr;
      mr.start();
      setState("recording");
      timerRef.current = setTimeout(stop, MAX_SECONDS * 1000);
    } catch (e) {
      console.warn("Microphone access failed:", e);
      toast.error("Microphone permission was denied. Please allow access or type instead.");
    }
  }, [transcribe, stop]);

  const reset = useCallback(() => {
    setTranscript("");
    setState("idle");
  }, []);

  return { state, transcript, setTranscript, start, stop, reset };
}
