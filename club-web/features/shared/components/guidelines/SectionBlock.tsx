import type { ReactNode } from "react";

interface GuideSectionBlockProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function GuideSectionBlock({
  id,
  title,
  children,
}: GuideSectionBlockProps) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-xl font-medium text-neutral-100">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-neutral-400">
        {children}
      </div>
    </section>
  );
}
