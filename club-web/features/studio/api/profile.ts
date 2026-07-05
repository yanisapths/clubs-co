import { apiFetch } from "@/lib/api-types";
import { SocialLink } from "./common";

const baseApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/profile`;

export interface Profile {
  id?: string;
  displayName: string;
  username: string;
  socialLinks: SocialLink[];
  joinedAt: number; // epoch seconds
  imageUrl?: string;
  bio: string;
  bannerUrl: string;
  email: string;
}

export interface ProfileClubStats {
  clubFounded: number;
  clubMembership: number;
  clubJoined: number;
}

export interface ProfileClubItem {
  id: number;
  imageUrl: string;
  name: string;
  role: "Founder" | "Co-Founder" | "Member" | string;
  memberSince: number; // epoch seconds
  category: string;
}

export interface ProfileClub {
  stats: ProfileClubStats;
  clubs: ProfileClubItem[];
}

export interface PatchProfilePayload {
  displayName?: string;
  socialLinks?: SocialLink[];
  imageUrl?: string;
  bio?: string;
  bannerUrl?: string;
}

// --- API Functions ---

export const getUserProfile = (token: string) =>
  apiFetch<Profile>(baseApi, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getUserClub = (token: string) =>
  apiFetch<ProfileClub>(`${baseApi}/club`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const patchUserProfile = (token: string, payload: PatchProfilePayload) =>
  apiFetch<string>(baseApi, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

export const deleteUser = (token: string) =>
  apiFetch(`${baseApi}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
