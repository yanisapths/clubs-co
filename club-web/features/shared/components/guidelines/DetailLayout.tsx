"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

export interface GuideSection {
  id: string;
  label: string;
}

interface GuidelineDetailLayoutProps {
  title: string;
  description: string;
  sections: GuideSection[];
  children: ReactNode;
}

export function GuidelineDetailLayout({
  title,
  description,
  sections,
  children,
}: GuidelineDetailLayoutProps) {
  const [activeId, setActiveId] = useState<string | undefined>(sections[0]?.id);
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
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [sections]);

  return (
    <main className="relative mx-auto max-w-7xl px-6 pb-24 pt-10">
      <Link
        href={`/guidelines`}
        className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
      >
        ← Guidelines
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-12 md:grid-cols-[1fr_220px]">
        <div>
          <header>
            <h1 className="text-4xl font-medium text-neutral-100">{title}</h1>
            <p className="mt-3 max-w-xl text-neutral-500">{description}</p>
          </header>

          <div className="mt-14 space-y-16">{children}</div>
        </div>

        <nav className="hidden md:block">
          <ul className="sticky top-24 space-y-5 border-l border-neutral-800 pl-5">
            {sections.map((section) => {
              const isActive = section.id === activeId;
              return (
                <li key={section.id} className="relative">
                  {isActive && (
                    <span className="absolute -left-5 top-0.5 h-4 w-px bg-neutral-100" />
                  )}
                  <a
                    href={`#${section.id}`}
                    className={
                      isActive
                        ? "text-neutral-100"
                        : "text-neutral-500 transition-colors hover:text-neutral-300"
                    }
                  >
                    {section.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </main>
  );
}
