import Link from "next/link";
import { BookOpen } from "lucide-react";

interface GuideCardProps {
  title: string;
  description: string;
  href: string;
}

export function GuideCard({ title, description, href }: GuideCardProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-[180px] flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-950/40 p-6 transition-colors hover:border-neutral-700 hover:bg-neutral-900/60"
    >
      <BookOpen
        className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-neutral-200"
        strokeWidth={1.5}
      />

      <div className="mt-8 space-y-1.5">
        <h3 className="text-lg font-medium text-neutral-100">{title}</h3>
        <p className="text-sm leading-relaxed text-neutral-500">
          {description}
        </p>
      </div>
    </Link>
  );
}
