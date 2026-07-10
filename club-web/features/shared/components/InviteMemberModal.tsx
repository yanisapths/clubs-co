"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, JSX, MouseEvent as ReactMouseEvent } from "react";
import { Search, X } from "lucide-react";
import { useMembershipSearch } from "@/hooks/use-membership-search";
import type { SearchMember } from "@/features/shared/api/api";
import {
  inviteClubMember,
  InviteMemberError,
  MEMBER_ROLE,
  type MemberRoleId,
} from "@/features/studio/api/member";
import {
  MemberAvatar,
  type ClubMember,
} from "@/features/studio/components/club/detail/MemberAvatar";
import { FormSelect } from "./input/FormInput";
import { getStoredToken } from "@/lib/storage";

type InviteStatus = "idle" | "loading" | "invited" | "error";

interface Invitee {
  member: SearchMember;
  roleId: MemberRoleId;
  status: InviteStatus;
  error?: string;
}

type BlockedReason = "founder" | "member" | "pending" | "invited";

const BLOCKED_LABEL: Record<BlockedReason, string> = {
  founder: "Founder",
  member: "Already a member",
  pending: "Pending request",
  invited: "Already invited",
};

const ROLE_OPTIONS: { value: MemberRoleId; label: string }[] = [
  { value: MEMBER_ROLE.MEMBER, label: "Member" },
  { value: MEMBER_ROLE.COFOUNDER, label: "Co-Founder" },
];

export interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: number | string;
  existingMembers: ClubMember[];
  onInvited?: (member: SearchMember, roleId: MemberRoleId) => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  clubId,
  existingMembers,
  onInvited,
}: InviteMemberModalProps): JSX.Element | null {
  const [query, setQuery] = useState<string>("");
  const [invitees, setInvitees] = useState<Record<string, Invitee>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const q: string = query.trim();
  const { data, isLoading } = useMembershipSearch(query, {
    enabled: isOpen && q.length > 0,
    minLength: 1,
    limit: 5,
  });

  const blockedById = useMemo((): Map<string, BlockedReason> => {
    const map = new Map<string, BlockedReason>();
    for (const m of existingMembers) {
      if (m.role === "Founder") {
        map.set(m.id, "founder");
      } else if (m.isInvited) {
        map.set(m.id, "invited");
      } else if (m.isPending) {
        map.set(m.id, "pending");
      } else {
        map.set(m.id, "member");
      }
    }
    return map;
  }, [existingMembers]);

  const candidates: SearchMember[] = data.members.filter(
    (m) => !invitees[m.id],
  );

  useEffect((): void => {
    if (isOpen) {
      setTimeout((): void => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  const wasOpenRef = useRef<boolean>(false);
  useEffect((): void => {
    if (wasOpenRef.current && !isOpen) {
      setQuery("");
      setInvitees({});
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect((): (() => void) | void => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return (): void => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const addInvitee = useCallback(
    (member: SearchMember): void => {
      if (blockedById.has(member.id)) return;
      setInvitees((prev) => ({
        ...prev,
        [member.id]: { member, roleId: MEMBER_ROLE.MEMBER, status: "idle" },
      }));
      setQuery("");
      setTimeout((): void => inputRef.current?.focus(), 0);
    },
    [blockedById],
  );

  const setRole = useCallback(
    (memberId: string, roleId: MemberRoleId): void => {
      setInvitees((prev) => ({
        ...prev,
        [memberId]: { ...prev[memberId], roleId },
      }));
    },
    [],
  );

  const sendInvite = useCallback(
    async (memberId: string): Promise<void> => {
      const invitee = invitees[memberId];
      if (
        !invitee ||
        invitee.status === "loading" ||
        invitee.status === "invited"
      ) {
        return;
      }

      setInvitees((prev) => ({
        ...prev,
        [memberId]: { ...prev[memberId], status: "loading", error: undefined },
      }));

      try {
        await inviteClubMember(
          clubId,
          {
            recipientId: memberId,

            roleId: invitee.roleId,
          },
          getStoredToken()!,
        );
        setInvitees((prev) => ({
          ...prev,
          [memberId]: { ...prev[memberId], status: "invited" },
        }));
        onInvited?.(invitee.member, invitee.roleId);
      } catch (err) {
        const message =
          err instanceof InviteMemberError
            ? err.message
            : "Failed to send invitation";
        setInvitees((prev) => ({
          ...prev,
          [memberId]: { ...prev[memberId], status: "error", error: message },
        }));
      }
    },
    [clubId, invitees, onInvited],
  );

  if (!isOpen) return null;

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>): void =>
    setQuery(e.target.value);

  const handleBackdropClick = (e: ReactMouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) onClose();
  };

  const invitedList: Invitee[] = Object.values(invitees);
  const showSearchResults: boolean = q.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-60"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-[560px] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 96px rgba(0,0,0,0.95)",
          maxHeight: "calc(100vh - 120px)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-lg font-bold text-white">Invite member</h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/15 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pb-4">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <Search size={18} style={{ color: "rgba(255,255,255,0.45)" }} />
            <input
              ref={inputRef}
              value={query}
              onChange={handleQueryChange}
              placeholder="Search name or username"
              className="bg-transparent text-white text-[15px] outline-none flex-1 placeholder:text-white/35"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-2 pb-4">
          {showSearchResults ? (
            isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
              </div>
            ) : candidates.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-white/35">
                No members match &quot;{query}&quot;
              </p>
            ) : (
              candidates.map((member: SearchMember): JSX.Element => {
                const blockedReason = blockedById.get(member.id);
                const isBlocked = blockedReason !== undefined;

                return (
                  <button
                    key={member.id}
                    type="button"
                    disabled={isBlocked}
                    onClick={(): void => addInvitee(member)}
                    className="cursor-pointer w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors enabled:hover:bg-white/5 disabled:cursor-not-allowed"
                    style={isBlocked ? { opacity: 0.4 } : undefined}
                  >
                    <MemberAvatar
                      displayName={member.displayName || member.username}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[15px] font-bold text-white truncate">
                        {member.displayName || member.username}
                      </span>
                      <span className="text-xs text-white/40 truncate">
                        @{member.username}
                      </span>
                    </div>
                    {isBlocked ? (
                      <span className="text-xs text-white/40 italic shrink-0">
                        {BLOCKED_LABEL[blockedReason]}
                      </span>
                    ) : null}
                  </button>
                );
              })
            )
          ) : invitedList.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-white/35">
              Search for a name or username to invite them.
            </p>
          ) : (
            invitedList.map(
              ({ member, roleId, status, error }: Invitee): JSX.Element => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 px-3 py-3"
                >
                  <MemberAvatar
                    displayName={member.displayName || member.username}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[15px] font-bold text-white truncate">
                      {member.displayName || member.username}
                    </span>
                    <span className="text-xs text-white/40 truncate">
                      @{member.username}
                    </span>
                    {status === "error" && error ? (
                      <span className="text-xs text-red-400 mt-0.5">
                        {error}
                      </span>
                    ) : null}
                  </div>

                  {status === "invited" ? (
                    <span className="text-sm font-semibold text-emerald-400 shrink-0">
                      {roleId == 2 ? "Co-Founder" : "Member"} Invited!
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <FormSelect
                        id={`role-${member.id}`}
                        variant="sm"
                        value={roleId}
                        onChange={(v) =>
                          setRole(member.id, Number(v) as MemberRoleId)
                        }
                        options={ROLE_OPTIONS.map((opt) => ({
                          value: opt.value,
                          label: opt.label,
                        }))}
                        disabled={status === "loading"}
                      />
                      <button
                        type="button"
                        onClick={(): void => void sendInvite(member.id)}
                        disabled={status === "loading"}
                        className="cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60 transition-colors"
                      >
                        {status === "loading" ? "Inviting…" : "Invite"}
                      </button>
                    </div>
                  )}
                </div>
              ),
            )
          )}
        </div>
      </div>
    </div>
  );
}
