"use client";

import { GlobalSearchTrigger } from "@/features/shared/components/GlobalSearchTrigger";
import { UserDropdown } from "@/features/shared/components/navigation/UserDropdown";

export const StudioHeader = () => {
  return (
    <div className="relative p-6">
      <header className="flex w-full items-center justify-between bg-transparent">
        <div className="w-full lg:w-[350px]">
          <GlobalSearchTrigger />
        </div>

        <UserDropdown />
      </header>
    </div>
  );
};
