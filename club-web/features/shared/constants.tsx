import {
  IconBallFootball,
  IconPalette,
  IconBooks,
  IconDeviceGamepad2,
  IconSchool,
  IconLayoutGrid,
} from "@tabler/icons-react";
import { CircuitBoardIcon } from "lucide-react";
import { Category } from "../membership/components/homepage/category-card";

export const categories: Category[] = [
  {
    id: 1,
    category: "Sports",
    icon: <IconBallFootball size={20} />,
    colorVariant: "sports",
  },
  {
    id: 2,
    category: "Art & Design",
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
