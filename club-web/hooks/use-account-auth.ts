"use client";

import { useSession, signOut } from "next-auth/react";

interface AccountSession {
  user: { email: string; id: string };
  expires: string;
  username: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken: string;
}

interface UserInfo {
  id?: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export const useAccountAuth = () => {
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const s = session as AccountSession | null;

  const user: UserInfo = {
    id: s?.user.id,
    email: s?.user.email ?? "",
    username: s?.username ?? "",
    firstName: s?.firstName ?? "",
    lastName: s?.lastName ?? "",
    fullName: s ? `${s.firstName} ${s.lastName}`.trim() : "",
  };

  return {
    isLoggedIn,
    logout: () => signOut({ callbackUrl: "/" }),
    user,
    session,
  };
};
