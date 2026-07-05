"use client";

import { GlobalSearchTrigger } from "@/features/shared/components/GlobalSearchTrigger";
import { UserDropdown } from "@/features/shared/components/navigation/UserDropdown";

export const StudioHeader = ({ overlay = false }: { overlay?: boolean }) => {
  return (
    <div className="relative sm:p-6 p-4">
      <header
        className={`flex gap-2 w-full items-center justify-between transition-colors ${
          overlay ? "rounded-2xl" : "bg-transparent"
        }`}
      >
        <div className="lg:w-[350px]">
          <GlobalSearchTrigger />
        </div>

        <UserDropdown />
      </header>
    </div>
  );
};
