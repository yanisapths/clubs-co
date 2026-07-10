import { ReactNode } from "react";

export interface Category {
  id: number;
  category: string;
  icon: ReactNode;
  colorVariant:
    | "sports"
    | "art"
    | "culture"
    | "esport"
    | "education"
    | "tech"
    | "world"
    | "other";
  slug: string;
  caption: string;
}

interface CategoryCardProps extends Category {
  onClick?: () => void;
}

const iconColors: Record<Category["colorVariant"], string> = {
  sports: "bg-emerald-500/15 text-emerald-400",
  art: "bg-purple-500/15 text-purple-400",
  culture: "bg-orange-500/15 text-orange-400",
  esport: "bg-blue-500/15 text-blue-400",
  education: "bg-yellow-500/15 text-yellow-400",
  tech: "bg-cyan-500/15 text-cyan-400",
  world: "bg-rose-500/15 text-rose-400",
  other: "bg-white/10 text-white/50",
};

export const CategoryCard = ({
  category,
  icon,
  colorVariant = "other",
  onClick,
}: CategoryCardProps) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col sm:min-w-60 gap-2.5 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-white/30 hover:bg-white/10 transition-colors h-full"
    >
      <div
        className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${iconColors[colorVariant]}`}
      >
        {icon}
      </div>
      <p className="text-[13px] font-medium text-white/90 leading-snug">
        {category}
      </p>
    </div>
  );
};
