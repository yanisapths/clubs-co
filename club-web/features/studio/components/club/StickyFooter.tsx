"use client";
import { Button } from "@/design-system/components/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface StickyFooterProps {
  pathToCreateClub: string;
  ownedClubs: number;
}
export const StickyFooter = ({
  pathToCreateClub,
  ownedClubs,
}: StickyFooterProps) => {
  const router = useRouter();
  const quotaExceeded = ownedClubs >= 5;

  return (
    <div className="fixed bottom-0 left-4 sm:left-0 py-4 w-full bg-black border border-t-white/20 shadow-xl text-white">
      <div className="flex md:flex-row flex-col gap-4 items-center">
        <div className="flex items-center md:pl-20 justify-center">
          <Button
            isDisabled={quotaExceeded}
            onClick={() => router.push(pathToCreateClub)}
            className="rounded-full bg-white px-6 text-black hover:bg-white/90"
          >
            <Plus /> Create a club
          </Button>
        </div>
        {quotaExceeded ? (
          <p className="text-red-500 text-xs sm:text-sm text-center max-w-60 md:max-w-full">
            Quata exceeded club creation limit. Only 5 clubs can be created.
          </p>
        ) : null}
      </div>
    </div>
  );
};
