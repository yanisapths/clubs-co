"use client";

import { SearchModal } from "@/features/membership/components/homepage/search-club-modal";
import { Input } from "@/features/shared/components/input/Input";
import { UserDropdown } from "@/features/shared/components/navigation/user-dropdown";

import { useModal } from "@/hooks/use-modal";
import { Search } from "lucide-react";

export const StudioHeader = () => {
  const { close, visible, show } = useModal();

  return (
    <header className="absolute z-30 flex h-20 inset-x-0 pl-6 pr-6 w-full items-center justify-between bg-transparent">
      <div className="w-full lg:w-[350px]">
        <Input
          onClick={show}
          placeholder="Search clubs, spaces, communities"
          leftSection={<Search size={24} className="text-white/50" />}
        />
        <SearchModal isOpen={visible} onClose={close} />
      </div>

      <UserDropdown />
    </header>
  );
};
