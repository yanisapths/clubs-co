import type { ReactNode } from "react";
import { Lightbulb } from "lucide-react";

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
      <Lightbulb
        className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
        strokeWidth={1.5}
      />
      <div className="space-y-2 text-[15px] leading-relaxed text-neutral-300">
        {children}
      </div>
    </div>
  );
}
