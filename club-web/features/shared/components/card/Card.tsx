import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "cursor-pointer rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
};

export function CardHeader({ title, description, className }: CardHeaderProps) {
  return (
    <div className={cn("border-b border-black px-5 py-4", className)}>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-white/60">{description}</p>
      ) : null}
    </div>
  );
}

type CardRowProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  showChevron?: boolean;
  finished?: boolean;
};

export function CardRow({
  title,
  description,
  trailing,
  showChevron = true,
  className,
  finished,
  ...props
}: CardRowProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors  disabled:cursor-not-allowed disabled:opacity-50",
        {
          "cursor-pointer hover:bg-white/[0.03]": !finished,
        },
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        <p className="font-bold text-white">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-white/60">{description}</p>
        ) : null}
      </div>

      {(!finished && trailing) ?? (
        <>
          {showChevron ? (
            <span className="cursor-pointer flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70">
              <ChevronRight className="h-4 w-4" />
            </span>
          ) : null}
        </>
      )}

      {finished ? (
        <span className="cursor-pointer flex h-8 w-8 shrink-0 items-center bg-[#53FF84]/10 justify-center rounded-full border border-[#53FF84]/15 text-[#53FF84]/70">
          <Check className="h-4 w-4" />
        </span>
      ) : null}
    </button>
  );
}

export function CardDivider({ className }: { className?: string }) {
  return <div className={cn("border-t border-white/5", className)} />;
}
