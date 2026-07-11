import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-neutral-800 border-t border-neutral-800">
      {items.map((item) => (
        <details
          key={item.question}
          className="group py-4 [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] text-neutral-200 underline decoration-neutral-700 underline-offset-4 transition-colors hover:decoration-neutral-500">
            <span>{item.question}</span>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 group-open:rotate-180"
              strokeWidth={1.5}
            />
          </summary>
          <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-neutral-400">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
