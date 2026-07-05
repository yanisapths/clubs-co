import { Profile, ProfileClub } from "@/features/studio/api/profile";
import { useAccountAuth } from "@/hooks/use-account-auth";
import { useQuery } from "@tanstack/react-query";
import { getPublicUserClub, getPublicUserProfile } from "../../api/profile";

const PROFILE_KEYS = {
  all: ["profile"] as const,
  profile: ["profile"] as const,
  clubs: ["profile", "clubs"] as const,
};

export const useGetPublicProfile = (username: string) => {
  const query = useQuery({
    queryKey: PROFILE_KEYS.profile,
    queryFn: () => getPublicUserProfile(username),

    select: (res) => res.data,
  });

  return {
    query,
    profile: query.data as Profile | undefined,
    isLoading: query.isLoading,
  };
};

export const useGetPublicUserClubs = (username: string) => {
  const query = useQuery({
    queryKey: PROFILE_KEYS.clubs,
    queryFn: () => getPublicUserClub(username),

    select: (res) => res.data,
  });

  return {
    query,
    userClubs: query.data as ProfileClub | undefined,
    isLoading: query.isLoading,
  };
};
