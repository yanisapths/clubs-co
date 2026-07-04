
"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/features/shared/components/input/Input";
import { useModal } from "@/hooks/use-modal";
import { SearchModal } from "@/features/membership/components/homepage/SearchClubModal";
import type {
  SearchClub,
  SearchMember,
  SearchSpace,
  SearchCategory,
} from "@/features/shared/api/api";

interface GlobalSearchTriggerProps {
  placeholder?: string;
  containerClassName?: string;
}

/**
 * Drop-in search input that opens the global search modal.
 * Handles navigation on selection so consuming pages don't repeat that wiring.
 *
 * Usage:
 *   <GlobalSearchTrigger />
 *   <GlobalSearchTrigger placeholder="Search clubs, spaces, communities" containerClassName="w-full lg:w-[700px]" />
 */
export function GlobalSearchTrigger({
  placeholder = "Search clubs, spaces, communities",
  containerClassName,
}: GlobalSearchTriggerProps) {
  const router = useRouter();
  const { close, visible, show } = useModal();

  const goToClub = (club: SearchClub) => {
    close();
    router.push(`/club/${club.name}`);
  };
  const goToMember = (member: SearchMember) => {
    close();
    router.push(`/profile/${member.username}`);
  };
  const goToSpace = (space: SearchSpace) => {
    close();
    router.push(`/space/${space.slug}`);
  };
  const goToCategory = (category: SearchCategory) => {
    close();
    router.push(`/club?category=${encodeURIComponent(category.name)}`);
  };

  return (
    <>
      <Input
        onClick={show}
        readOnly
        placeholder={placeholder}
        leftSection={<Search size={24} className="text-white/50" />}
        containerClassName={containerClassName}
      />
      <SearchModal
        isOpen={visible}
        onClose={close}
        onSelectClub={goToClub}
        onSelectMember={goToMember}
        onSelectSpace={goToSpace}
        onSelectCategory={goToCategory}
      />
    </>
  );
}