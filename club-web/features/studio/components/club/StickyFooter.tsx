"use client";
import { Button } from "@/design-system/components/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface StickyFooterProps {
  pathToCreateClub: string;
}
export const StickyFooter = ({ pathToCreateClub }: StickyFooterProps) => {
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 py-4 w-full bg-black border border-t-white/20 shadow-xl text-white">
      <div className="flex items-center px-20">
        <Button
          onClick={() => router.push(pathToCreateClub)}
          className=" rounded-full bg-white px-6 text-black hover:bg-white/90"
        >
          <Plus /> Join
        </Button>
      </div>
    </div>
  );
};
