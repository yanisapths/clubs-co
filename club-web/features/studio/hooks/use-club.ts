import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClubList,
  getClubById,
  createClub,
  updateClubById,
  deleteClubById,
  CreateClubPayload,
  UpdateClubPayload,
  type Club,
  patchClubById,
  PatchClubPayload,
  getClubMemberListById,
} from "../api/club";
import { useAccountAuth } from "@/hooks/use-account-auth";
import { getStoredToken } from "@/lib/storage";

export const CLUB_KEYS = {
  all: ["clubs"] as const,
  detail: (id: number | string) => ["clubs", Number(id)] as const,
  members: (id: number | string) => ["members", Number(id)] as const,
};

export const useGetOwnerClubs = () => {
  const { isLoggedIn } = useAccountAuth();

  const query = useQuery({
    queryKey: CLUB_KEYS.all,
    queryFn: () => getClubList(getStoredToken()!),
    enabled: isLoggedIn,
    select: (res) => res.data,
  });

  return {
    query,
    clubs: query.data as Club[],
    isLoading: query.isLoading,
  };
};

export const useGetClubById = (id: number) => {
  const { isLoggedIn } = useAccountAuth();

  const query = useQuery({
    queryKey: CLUB_KEYS.detail(id),
    queryFn: () => getClubById(getStoredToken()!, id),
    enabled: isLoggedIn && !!id,
    select: (res) => res.data,
  });

  return {
    query,
    club: query.data?.clubInfo,
    isLoading: query.isLoading,
  };
};

export const useGetClubMemberListById = (id: number) => {
  const { isLoggedIn } = useAccountAuth();

  const query = useQuery({
    queryKey: CLUB_KEYS.members(id),
    queryFn: () => getClubMemberListById(getStoredToken()!, id),
    enabled: isLoggedIn && !!id,
    select: (res) => res.data,
  });

  return {
    query,
    members: query.data?.members,
    isLoading: query.isLoading,
  };
};

export const useCreateClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClubPayload) =>
      createClub(getStoredToken()!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLUB_KEYS.all });
    },
  });
};

export const useUpdateClub = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateClubPayload) =>
      updateClubById(getStoredToken()!, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLUB_KEYS.all });
    },
  });
};

export const usePatchClub = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatchClubPayload) =>
      patchClubById(getStoredToken()!, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLUB_KEYS.all });
    },
  });
};

export const useDeleteClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteClubById(getStoredToken()!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLUB_KEYS.all });
    },
  });
};
