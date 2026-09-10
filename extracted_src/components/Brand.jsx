import { HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_6px_16px_rgba(5,150,105,0.35)]",
        className
      )}
    >
      <HeartPulse className="h-5 w-5" strokeWidth={2.4} />
    </span>
  );
}

export function BrandLogo({ tagline }) {
  return (
    <div className="flex items-center gap-2.5" data-testid="brand-logo">
      <BrandMark />
      <div className="leading-none">
        <span className="font-display text-xl font-extrabold tracking-tight text-slate-900">
          Ayucore
        </span>
        {tagline ? (
          <span className="block text-[11px] font-medium text-emerald-700">{tagline}</span>
        ) : null}
      </div>
    </div>
  );
}
