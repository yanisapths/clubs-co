"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Breadcrumb, BreadcrumbItem } from "../Breadcrumb";

export interface GuideSection {
  id: string;
  label: string;
}

export interface RelatedArticle {
  label: string;
  href?: string;
  active?: boolean;
}

interface GuidelineDetailLayoutProps {
  title: string;
  description: string;
  sections: GuideSection[];
  children: ReactNode;
  /** Overrides the default "← Guidelines" link with a full breadcrumb trail. */
  breadcrumb?: BreadcrumbItem[];
  /** Small meta line under the description, e.g. "Updated 11 months ago". */
  metaLabel?: string;
  /** Heading shown above the section links in the sidebar. */
  sidebarTitle?: string;
  /** Optional second sidebar block listing sibling articles. */
  relatedArticles?: RelatedArticle[];
}

export function GuidelineDetailLayout({
  title,
  description,
  sections,
  children,
  breadcrumb,
  metaLabel,
  sidebarTitle = "On this page",
  relatedArticles,
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
      {breadcrumb ? (
        <Breadcrumb items={breadcrumb} />
      ) : (
        <Link
          href={`/guidelines`}
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
        >
          ← Guidelines
        </Link>
      )}

      <div className="mt-6 grid grid-cols-1 gap-12 md:grid-cols-[1fr_220px]">
        <div>
          <header>
            <h1 className="text-4xl font-medium text-neutral-100">{title}</h1>
            <p className="mt-3 max-w-xl text-neutral-500">{description}</p>
            {metaLabel && (
              <p className="mt-4 text-sm text-neutral-600">{metaLabel}</p>
            )}
          </header>

          <div className="mt-14 space-y-16">{children}</div>
        </div>

        <nav className="hidden md:block">
          <div className="sticky top-24 space-y-10">
            <div>
              {sidebarTitle && (
                <p className="mb-4 text-sm font-medium text-neutral-200">
                  {sidebarTitle}
                </p>
              )}
              <ul className="space-y-5 border-l border-neutral-800 pl-5">
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
            </div>

            {relatedArticles && relatedArticles.length > 0 && (
              <div>
                <p className="mb-4 text-sm font-medium text-neutral-200">
                  Articles in this section
                </p>
                <ul className="space-y-3 pl-5">
                  {relatedArticles.map((article) =>
                    article.href ? (
                      <li key={article.label}>
                        <Link
                          href={article.href}
                          className={
                            article.active
                              ? "text-neutral-100"
                              : "text-neutral-500 transition-colors hover:text-neutral-300"
                          }
                        >
                          {article.label}
                        </Link>
                      </li>
                    ) : (
                      <li
                        key={article.label}
                        className="flex items-center gap-2 text-neutral-600"
                      >
                        <span>{article.label}</span>
                        <span className="rounded-full border border-neutral-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-600">
                          Soon
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </div>
        </nav>
      </div>
    </main>
  );
}
