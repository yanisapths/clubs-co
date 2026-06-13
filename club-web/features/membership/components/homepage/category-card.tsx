import {
  IconBallFootball,
  IconPalette,
  IconBooks,
  IconDeviceGamepad2,
  IconSchool,
  IconLayoutGrid,
} from "@tabler/icons-react";
import { CircuitBoardIcon } from "lucide-react";
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
      className="flex flex-col gap-2.5 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-white/30 hover:bg-white/10 transition-colors h-full"
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

export const categories: Category[] = [
  {
    id: 1,
    category: "Sports",
    icon: <IconBallFootball size={20} />,
    colorVariant: "sports",
  },
  {
    id: 2,
    category: "Design & Art",
    icon: <IconPalette size={20} />,
    colorVariant: "art",
  },
  {
    id: 3,
    category: "Culture & Lifestyle",
    icon: <IconBooks size={20} />,
    colorVariant: "culture",
  },
  {
    id: 4,
    category: "e-Sport & Gaming",
    icon: <IconDeviceGamepad2 size={20} />,
    colorVariant: "esport",
  },
  {
    id: 5,
    category: "Education",
    icon: <IconSchool size={20} />,
    colorVariant: "education",
  },
  {
    id: 6,
    category: "Technology",
    icon: <CircuitBoardIcon size={20} />,
    colorVariant: "tech",
  },
  {
    id: 7,
    category: "Other",
    icon: <IconLayoutGrid size={20} />,
    colorVariant: "other",
  },
] as const;
