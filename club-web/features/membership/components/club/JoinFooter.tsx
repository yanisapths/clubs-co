"use client";
import { Button } from "@/design-system/components/button";
import { Tag } from "@/features/shared/components/Tag";
import { useAccountAuth } from "@/hooks/use-account-auth";
import {
  Clock3Icon,
  LockIcon,
  LogOut,
  Mail,
  MoreHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useJoinClub, useLeaveClub } from "../../hooks/use-club";
import { useClubInviteResponse } from "../../hooks/use-invite-response";
import { toast } from "@heroui/react";
import { Club } from "../../api/club";
import { formatUnixDate } from "@/lib/utils";
import { InviteLetterCard } from "./InviteLetterCard";
import { ConfirmationModal } from "@/features/shared/components/modal/ConfirmationModal";
import { useModal } from "@/hooks/use-modal";
import { getMemberRoleLabel } from "@/features/shared/constants";

interface JoinFooterProps {
  club: Club;
  clubSlug: string;
  onInviteResponded?: () => void;
}

export const JoinFooter = ({
  club,
  clubSlug,
  onInviteResponded,
}: JoinFooterProps) => {
  const { isLoggedIn, user } = useAccountAuth();
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const router = useRouter();
  const leaveClub = useLeaveClub();
  const joinClub = useJoinClub();
  const { respond, pendingAction } = useClubInviteResponse(club.id, clubSlug);
  const {
    show: showLeaveConfirm,
    visible: leaveConfirmVisible,
    close: closeLeaveConfirm,
  } = useModal();
  const isOwner = club.isOwner;
  const isJoined = club.isMember || isOwner ? true : false;
  const isPrivate = club.clubType == "Private";
  const hasInvite = !isJoined && !isOwner && !!club.invite?.isInvited;

  const [isLetterOpen, setIsLetterOpen] = useState<boolean>(hasInvite);

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
          closeLeaveConfirm();
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

  const handleAcceptInvite = async () => {
    const result = await respond("accept");
    if (result.ok) {
      toast.success(`Welcome to ${club.name}!`);
      setIsLetterOpen(false);
      onInviteResponded?.();
    } else {
      toast.danger(result.error ?? "Failed to accept invitation.");
    }
  };

  const handleDeclineInvite = async () => {
    const result = await respond("decline");
    if (result.ok) {
      toast.info("Invitation declined.");
      setIsLetterOpen(false);
      onInviteResponded?.();
    } else {
      toast.danger(result.error ?? "Failed to decline invitation.");
    }
  };

  return (
    <div className="border-t border-white/20 bg-black py-4 shadow-xl text-white">
      {hasInvite ? (
        <div className="flex sm:flex-row flex-col gap-3 items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Mail className="h-4 w-4 text-[#FFB7F9]" />
            You have an invitation to join this club
          </div>
          <Button
            onClick={() => setIsLetterOpen(true)}
            className="bg-[#FFB7F9] text-[#560530] hover:bg-[#FFB7F9] hover:text-[#560530] hover:opacity-90"
          >
            View invitation
          </Button>
        </div>
      ) : isOwner || isJoined ? (
        <div className="flex justify-between items-center">
          <div className="flex justify-start text-sm px-6 text-white/70">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              You&apos;re a{" "}
              {getMemberRoleLabel(club?.memberRole ?? "Member").toLowerCase()}{" "}
              of this club
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
            onClick={() => {
              setOpenMenu(false);
              showLeaveConfirm();
            }}
            disabled={isOwner || leaveClub.isPending}
            className="disabled:hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-base flex w-full items-center gap-2 px-4 py-4 disabled:text-gray-700 text-red-400 hover:bg-white/5 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Leave club
          </button>
        </div>
      )}

      {leaveConfirmVisible && (
        <ConfirmationModal
          title="Leave this club"
          description={
            isPrivate
              ? "Are you sure you want to leave this club? Once you leave, you'll have to be invited or request to join again later."
              : "Are you sure you want to leave this club? Once you leave, you can join again later."
          }
          isPending={leaveClub.isPending}
          onConfirm={() => handleLeaveClub({ cancelRequest: false })}
          onClose={closeLeaveConfirm}
          variant="danger"
        />
      )}

      {hasInvite && club.invite && (
        <InviteLetterCard
          open={isLetterOpen}
          onClose={() => setIsLetterOpen(false)}
          clubName={club.name}
          recipientName={user?.displayName || user?.username || "there"}
          invite={club.invite}
          onAccept={handleAcceptInvite}
          onDecline={handleDeclineInvite}
          pendingAction={pendingAction}
        />
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
