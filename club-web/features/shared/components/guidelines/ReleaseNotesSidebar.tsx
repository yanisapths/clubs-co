"use client";

import { useEffect, useRef, useState } from "react";

export interface ReleaseDate {
  id: string;
  label: string;
}

export function ReleaseNotesSidebar({ dates }: { dates: ReleaseDate[] }) {
  const [activeId, setActiveId] = useState<string | undefined>(dates[0]?.id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-10% 0px -75% 0px", threshold: 0 },
    );

    dates.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [dates]);

  return (
    <nav className="hidden md:block">
      <ul className="sticky top-24 space-y-4 border-l border-neutral-800 pl-5">
        {dates.map((date) => {
          const isActive = date.id === activeId;
          return (
            <li key={date.id} className="relative">
              {isActive && (
                <span className="absolute -left-5 top-0.5 h-4 w-px bg-neutral-100" />
              )}
              <a
                href={`#${date.id}`}
                className={
                  isActive
                    ? "text-sm text-neutral-100"
                    : "text-sm text-neutral-500 transition-colors hover:text-neutral-300"
                }
              >
                {date.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
