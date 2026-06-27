"use client";
import { useAccountAuth } from "@/hooks/use-account-auth";
import { getStoredToken } from "@/lib/storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteUser,
  getUserClub,
  getUserProfile,
  PatchProfilePayload,
  patchUserProfile,
  Profile,
  ProfileClub,
} from "../api/profile";
import { useRouter } from "next/navigation";

const PROFILE_KEYS = {
  all: ["profile"] as const,
  profile: ["profile", "me"] as const,
  clubs: ["profile", "clubs"] as const,
};

export const useGetUserProfile = () => {
  const { isLoggedIn } = useAccountAuth();

  const query = useQuery({
    queryKey: PROFILE_KEYS.profile,
    queryFn: () => getUserProfile(getStoredToken()!),
    enabled: isLoggedIn,
    select: (res) => res.data,
  });

  return {
    query,
    profile: query.data as Profile | undefined,
    isLoading: query.isLoading,
  };
};

export const useGetUserClubs = () => {
  const { isLoggedIn } = useAccountAuth();

  const query = useQuery({
    queryKey: PROFILE_KEYS.clubs,
    queryFn: () => getUserClub(getStoredToken()!),
    enabled: isLoggedIn,
    select: (res) => res.data,
  });

  return {
    query,
    userClubs: query.data as ProfileClub | undefined,
    isLoading: query.isLoading,
  };
};

export const usePatchProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatchProfilePayload) =>
      patchUserProfile(getStoredToken()!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.profile });
    },
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: () => deleteUser(getStoredToken()!),
  });
};
