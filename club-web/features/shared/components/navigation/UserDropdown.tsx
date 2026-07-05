/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAccountAuth } from "@/hooks/use-account-auth";
import { Avatar } from "../Avatar";
import { useGetUserProfile } from "@/features/studio/hooks/use-profile";

export const UserDropdown = () => {
  const { isLoggedIn, user, logout } = useAccountAuth();
  const { profile } = useGetUserProfile();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isLoggedIn || !user) return null;

  const username = (user as any).username ?? user.email ?? "";
  const usernameInitials = (user.username ?? "?").slice(0, 2).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="backdrop-blur-md  cursor-pointer flex items-center gap-2 rounded-full border border-white/10 bg-white/10 py-2 pl-3 pr-3 text-sm text-white/80 transition-colors hover:bg-white/15"
      >
        <Avatar
          userId={user.id}
          imageUrl={profile?.imageUrl}
          initials={usernameInitials}
        />
        <span className="text-[13px]">{username}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-16 z-50 w-64 rounded-2xl border border-white/10 bg-[#1c1c1c] p-5 shadow-xl">
          <div className="mb-5 flex items-start gap-2">
            <Avatar
              userId={user.id}
              imageUrl={profile?.imageUrl}
              initials={usernameInitials}
              size={48}
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-[17px] font-medium text-white">
                {user.displayName}
              </p>
              <p className="truncate text-[13px] text-white/40">@{username}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="cursor-pointer mt-0.5 text-white/30 transition-colors hover:text-white/60"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <p className="mb-2 text-[11px] uppercase tracking-wide text-white/30">
            account
          </p>
          <nav className="mb-4 flex flex-col ">
            {[{ href: `/${username}`, label: "Profile and Account" }].map(
              ({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="hover:bg-white/5 -mx-4 py-2 text-[15px] text-white/60 hover:text-white transition-all duration-300 hover:cursor-pointer hover:rounded-lg"
                >
                  <div className="px-4">{label}</div>
                </Link>
              ),
            )}
          </nav>

          <p className="mb-2 text-[11px] uppercase tracking-wide text-white/30">
            clubs
          </p>
          <nav className="mb-4 flex flex-col">
            {[
              {
                href: `/${username}/studio/club`,
                label: "Club Creator Studio",
              },
              { href: "/", label: "Find Clubs" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="hover:bg-white/5 -mx-4 py-2 text-[15px] text-white/60 hover:text-white transition-all duration-300 hover:cursor-pointer hover:rounded-lg"
              >
                <div className="px-4">{label}</div>
              </Link>
            ))}
          </nav>

          <div className="border-t w-full border-white/8 pt-3">
            <div className="cursor-pointer hover:bg-white/5 -mx-4 py-2 text-white/60 hover:text-white transition-all duration-300 hover:rounded-lg">
              <div onClick={logout} className="px-4">
                Sign out
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
