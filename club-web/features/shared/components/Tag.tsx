import { cn } from "@/lib/utils";

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export const Tag = ({ children, className }: TagProps) => {
  return (
    <span
      className={cn(
        "w-fit inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/10 px-2 py-1 text-sm text-white/70 backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </span>
  );
};
