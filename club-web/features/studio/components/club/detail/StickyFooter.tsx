"use client";
import { Button } from "@/design-system/components/button";
import { Edit3Icon } from "lucide-react";
import { useRouter } from "next/navigation";

interface StickyFooterProps {
  pathToEdit: string;
}
export const StickyFooter = ({ pathToEdit }: StickyFooterProps) => {
  const router = useRouter();

  return (
    <div className="fixed z-30 bottom-0 left-0 py-4 w-full bg-black border border-t-white/20 shadow-xl text-white">
      <div className="flex items-center px-20">
        <Button
          onClick={() => router.push(pathToEdit)}
          className="rounded-full bg-white px-6 text-black hover:bg-white/90"
        >
          <Edit3Icon /> Edit club
        </Button>
      </div>
    </div>
  );
};
