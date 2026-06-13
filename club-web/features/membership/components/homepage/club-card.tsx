import Image from "next/image";
import { Users, Globe, Lock, Gem } from "lucide-react";

type ClubType = "public" | "private" | "exclusive";

export interface Club {
  id: number;
  title: string;
  image: string;
  description: string;
  tags: string[];
  members: number;
  type: "public" | "private";
}

interface ClubCardProps {
  title: string;
  image: string;
  description?: string;
  tags?: string[];
  members?: number;
  type?: ClubType;
  onClick?: () => void;
}

const variants = {
  public: {
    label: "Public",
    icon: Globe,
    badge: "bg-green-50 text-green-700 border-green-300",
    button: "text-green-700 border-green-300 hover:bg-green-50",
    action: "Join now",
  },
  private: {
    label: "Private",
    icon: Lock,
    badge: "bg-amber-50 text-amber-700 border-amber-300",
    button: "text-amber-700 border-amber-300 hover:bg-amber-50",
    action: "Request to join",
  },
  exclusive: {
    label: "Exclusive",
    icon: Gem,
    badge: "bg-violet-50 text-violet-700 border-violet-300",
    button: "text-violet-700 border-violet-300 hover:bg-violet-50",
    action: "Request invite",
  },
};

export function ClubCard({
  title,
  image,
  description,
  tags = [],
  members,
  type = "public",
  onClick,
}: ClubCardProps) {
  const variant = variants[type];
  const Icon = variant.icon;

  return (
    <div
      onClick={onClick}
      className="min-w-40 cursor-pointer overflow-hidden rounded-2xl bg-black p-1 lg:p-2 hover:bg-white/10 cursor-pointer transition-discrete duration-200"
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover rounded-2xl"
        />

        <div
          className={`absolute top-3 right-3 flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${variant.badge}`}
        >
          <Icon size={12} />
          {variant.label}
        </div>
      </div>

      <div className="p-2">
        <div className="mb-3 flex items-center gap-3">
          <div>
            <h3 className="font-semibold h-12 max-w-72 line-clamp-2 text-white">
              {title}
            </h3>
          </div>
        </div>

        {description && (
          <p className="mb-3 text-sm text-default-500">{description}</p>
        )}

        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full border px-3 py-1 text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-1 text-xs text-default-500">
            <Users size={14} />
            {members ? `${members} members` : "Members only"}
          </div>
        </div>
      </div>
    </div>
  );
}
