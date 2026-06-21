import { formatUnixDate } from "@/lib/utils";
import { Button } from "@heroui/react";
import { UserPlus, MoreHorizontal, LogOut, RefreshCw } from "lucide-react";
import { useState } from "react";
import { ClubMember, MemberAvatar } from "./member-avatar";
import { NOW_SECONDS, SEVEN_DAYS } from "../constants";

export function MembersTab({
  members,
  isOwner,
  onInvite,
}: {
  members: ClubMember[];
  isOwner: boolean;
  onInvite: () => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleMenu = (id: string) =>
    setOpenMenuId((prev) => (prev === id ? null : id));

  const isPending = (m: ClubMember) =>
    !m.joinedAt || m.role.toLowerCase().includes("pending");

  return (
    <div className="px-6 py-6">
      {isOwner && (
        <div className="flex justify-end mb-5">
          <Button
            onClick={onInvite}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            <UserPlus className="h-4 w-4" />+ Invite member
          </Button>
        </div>
      )}

      <div className="grid grid-cols-[1fr_120px_120px_48px] items-center border-b border-white/10 pb-2 text-xs uppercase tracking-wider text-white/40">
        <span>Member</span>
        <span className="text-right">Type</span>
        <span className="text-right">Joined</span>
        <span />
      </div>

      <ul className="divide-y divide-white/5">
        {members.map((member) => {
          const pending = isPending(member);
          const menuOpen = openMenuId === member.id;

          return (
            <li key={member.id} className="relative">
              <div className="grid grid-cols-[1fr_120px_120px_48px] items-center py-3">
                <div className="flex items-center gap-3">
                  <MemberAvatar username={member.username} />
                  <span className="text-sm font-medium text-white">
                    {member.username}
                  </span>

                  {!pending &&
                    member.joinedAt &&
                    NOW_SECONDS - member.joinedAt < SEVEN_DAYS && (
                      <span className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/60">
                        New Member
                      </span>
                    )}
                </div>

                <span
                  className={`text-right text-sm ${pending ? "text-white/30 italic" : "text-white/60"}`}
                >
                  {pending ? "Pending Invitation" : member.role}
                </span>

                <span className="text-right text-sm text-white/40">
                  {member.joinedAt ? formatUnixDate(member.joinedAt) : "—"}
                </span>

                <div className="flex justify-end">
                  {isOwner && (
                    <button
                      onClick={() => toggleMenu(member.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {menuOpen && (
                <div className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-xl">
                  <button
                    onClick={() => setOpenMenuId(null)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Leave club
                  </button>
                  {!pending && (
                    <button
                      onClick={() => setOpenMenuId(null)}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-white/70 hover:bg-white/5 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Change role
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
