"use client";
import { Button } from "@/design-system/components/button";
import { Tag } from "@/features/shared/components/Tag";
import { useAccountAuth } from "@/hooks/use-account-auth";
import { Clock3Icon, LockIcon, LogOut, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useJoinClub, useLeaveClub } from "../../hooks/use-club";
import { toast } from "@heroui/react";
import { Club } from "../../api/club";
import { formatUnixDate } from "@/lib/utils";

interface JoinFooterProps {
  club: Club;
  clubSlug: string;
}

export const JoinFooter = ({ club, clubSlug }: JoinFooterProps) => {
  const { isLoggedIn } = useAccountAuth();
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const router = useRouter();
  const leaveClub = useLeaveClub();
  const joinClub = useJoinClub();
  const isOwner = club.isOwner;
  const isJoined = club.isMember || isOwner ? true : false;
  const isPrivate = club.clubType == "Private";

  const toggleMenu = () => {
    setOpenMenu((prev) => (prev === false ? true : false));
  };

  const handleJoinClub = () => {
    if (!isLoggedIn) {
      toast.info("Login to join club.");

      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          window.location.pathname + window.location.search,
        )}`,
      );

      return;
    }

    joinClub.mutate(
      { clubId: club.id, clubName: clubSlug },
      {
        onSuccess: () => {
          toast.success("Joined club successfully!");
        },
        onError: (error) => {
          toast.danger(
            error instanceof Error ? error.message : "Failed to join club.",
          );
        },
      },
    );
  };

  const handleLeaveClub = ({ cancelRequest }: { cancelRequest: boolean }) => {
    leaveClub.mutate(
      { clubId: club.id, clubName: clubSlug },
      {
        onSuccess: () => {
          toast.success(
            cancelRequest ? "Request cancelled." : "Left club successfully. 😢",
          );
          setOpenMenu(false);
        },
        onError: (error) => {
          toast.danger(
            error instanceof Error
              ? error.message
              : cancelRequest
                ? "Failed to cancel request."
                : "Failed to leave club.",
          );
        },
      },
    );
  };

  return (
    <div className="border-t border-white/20 bg-black py-4 shadow-xl text-white">
      {isOwner || isJoined ? (
        <div className="flex justify-between items-center">
          <div className="flex justify-start text-sm px-6 text-white/70">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              You&apos;re a member of this club
              <Tag>
                Joined {club.joinedAt ? formatUnixDate(club.joinedAt) : "-"}
              </Tag>
            </div>
          </div>
          <div className="flex justify-end px-6">
            <button
              onClick={() => toggleMenu()}
              disabled={leaveClub.isPending}
              className={`${openMenu ? "bg-white/10" : ""} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors`}
            >
              <MoreHorizontal className="h-6 w-6" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {renderJoinButton()}
        </div>
      )}

      {openMenu && (
        <div className="shadow-2xl absolute right-6 bottom-14 z-50 w-44 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
          <button
            onClick={() => handleLeaveClub({ cancelRequest: false })}
            disabled={isOwner || leaveClub.isPending}
            className="disabled:hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-base flex w-full items-center gap-2 px-4 py-4 disabled:text-gray-700 text-red-400 hover:bg-white/5 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {leaveClub.isPending ? "Leaving..." : "Leave club"}
          </button>
        </div>
      )}
    </div>
  );

  function renderJoinButton() {
    if (isPrivate) {
      if (club.isPending) {
        return (
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-[#FDFF73]">
              <Clock3Icon />
              Pending Approval
            </div>
            <Button
              onClick={() => handleLeaveClub({ cancelRequest: true })}
              variant="outline"
              isDisabled={isOwner || leaveClub.isPending}
              className="disabled:hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-white/30 text-white/60 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">Cancel request</div>
            </Button>
          </div>
        );
      }
      return (
        <Button
          onClick={handleJoinClub}
          color="accent"
          isPending={joinClub.isPending}
          isDisabled={joinClub.isPending}
        >
          {/* start content Locked  icon */}
          <div className="flex items-center gap-2">
            <LockIcon />
            Request to join
          </div>
        </Button>
      );
    }
    return (
      <Button
        onClick={handleJoinClub}
        color="primary"
        isPending={joinClub.isPending}
        isDisabled={joinClub.isPending}
      >
        Join now
      </Button>
    );
  }
};
