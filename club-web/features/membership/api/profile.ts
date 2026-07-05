import { Profile, ProfileClub } from "@/features/studio/api/profile";
import { apiFetch } from "@/lib/api-types";

const baseApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/membership/user`;

export const getPublicUserProfile = (username: string) =>
  apiFetch<Profile>(`${baseApi}/${username}`, {
    method: "GET",
  });

export const getPublicUserClub = (username: string) =>
  apiFetch<ProfileClub>(`${baseApi}/${username}/club`, {
    method: "GET",
  });
