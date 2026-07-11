import type { ReactNode } from "react";

interface ReleaseNoteEntryProps {
  id: string;
  date: string;
  children: ReactNode;
}

export function ReleaseNoteEntry({
  id,
  date,
  children,
}: ReleaseNoteEntryProps) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-2xl font-semibold text-neutral-100">{date}</h2>
      <ul className="mt-4 list-disc space-y-3 pl-5 text-[15px] leading-relaxed text-neutral-300">
        {children}
      </ul>
    </section>
  );
}
