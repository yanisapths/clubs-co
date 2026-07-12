"use client";

import { useSession, signOut } from "next-auth/react";
interface AccountSession {
  user: { email: string; id: string };
  expires: string;
  username: string;
  displayName: string;
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  profileImage?: string;
  bannerUrl?: string;
}

export const useAccountAuth = () => {
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const s = session as AccountSession | null;

  const user: UserInfo = {
    id: s?.user.id ?? "",
    email: s?.user.email ?? "",
    username: s?.username ?? "",
    displayName: s?.displayName ?? "",
  };

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/",
    });
    sessionStorage.removeItem("accessToken");
  };

  return {
    isLoggedIn,
    logout: handleLogout,
    user,
    session,
  };
};
