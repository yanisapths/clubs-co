import {
  IconBallFootball,
  IconPalette,
  IconBooks,
  IconDeviceGamepad2,
  IconSchool,
  IconLayoutGrid,
} from "@tabler/icons-react";
import { CircuitBoardIcon, Globe } from "lucide-react";
import { Category } from "../membership/components/homepage/CategoryCard";
import { SiInstagram, SiFacebook, SiX } from "@icons-pack/react-simple-icons";
import { SocialPlatform } from "../studio/api/common";

export const categories: Category[] = [
  {
    id: 1,
    category: "Sports",
    icon: <IconBallFootball size={20} />,
    colorVariant: "sports",
    slug: "sports",
    caption: "Train, compete, and stay active.",
  },
  {
    id: 2,
    category: "Art & Design",
    icon: <IconPalette size={20} />,
    colorVariant: "art",
    slug: "art",
    caption: "Create, design, and express ideas.",
  },
  {
    id: 3,
    category: "Culture & Lifestyle",
    icon: <IconBooks size={20} />,
    colorVariant: "culture",
    slug: "culture",
    caption: "Share interests, hobbies, and experiences.",
  },
  {
    id: 4,
    category: "e-Sport & Gaming",
    icon: <IconDeviceGamepad2 size={20} />,
    colorVariant: "esport",
    slug: "esport",
    caption: "Play, compete, and level up together.",
  },
  {
    id: 5,
    category: "Education",
    icon: <IconSchool size={20} />,
    colorVariant: "education",
    slug: "education",
    caption: "Learn new skills and grow knowledge.",
  },
  {
    id: 6,
    category: "Technology",
    icon: <CircuitBoardIcon size={20} />,
    colorVariant: "tech",
    slug: "technology",
    caption: "Build, innovate, and explore technology.",
  },
  {
    id: 7,
    category: "Other",
    icon: <IconLayoutGrid size={20} />,
    colorVariant: "other",
    slug: "other",
    caption: "Discover unique communities and interests.",
  },
] as const;

export const PLATFORM_CONFIG: Record<
  SocialPlatform,
  {
    apiKey: string;
    label: string;
    placeholder: string;
    Icon: React.FC<{ className?: string }>;
  }
> = {
  Website: {
    apiKey: "website",
    label: "Website",
    placeholder: "https://yourwebsite.com",
    Icon: ({ className }) => <Globe className={className} />,
  },
  Instagram: {
    apiKey: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/yourhandle",
    Icon: ({ className }) => <SiInstagram className={className} />,
  },
  Meta: {
    apiKey: "meta",
    label: "Facebook",
    placeholder: "https://facebook.com/yourprofile",
    Icon: ({ className }) => <SiFacebook className={className} />,
  },
  X: {
    apiKey: "x",
    label: "X",
    placeholder: "https://x.com/yourhandle",
    Icon: ({ className }) => <SiX className={className} />,
  },
};

export const ALL_PLATFORMS: SocialPlatform[] = [
  "Website",
  "Instagram",
  "Meta",
  "X",
];

export const platformDisplayMap: Record<string, SocialPlatform> = {
  website: "Website",
  x: "X",
  meta: "Meta",
  instagram: "Instagram",
};

export const platformApiKeyMap: Record<SocialPlatform, string> = {
  Website: "website",
  X: "x",
  Meta: "meta",
  Instagram: "instagram",
};
