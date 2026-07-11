import Link from "next/link";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm">
      {items.map((item, idx) => (
        <Fragment key={item.label}>
          {item.href ? (
            <Link
              href={item.href}
              className="text-neutral-500 underline decoration-neutral-700 underline-offset-4 transition-colors hover:text-neutral-300 hover:decoration-neutral-500"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-500">{item.label}</span>
          )}
          {idx < items.length - 1 && (
            <span className="text-neutral-700">/</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
