import { getStoredToken } from "@/lib/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveMemberRequest,
  cancelRequest,
  removeClubMember,
} from "../api/member";
import { CLUB_KEYS } from "./use-club";

export const useCancelRequest = (clubId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clubId,
      memberId,
    }: {
      clubId: number | string;
      memberId: string;
    }) => cancelRequest(getStoredToken()!, clubId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLUB_KEYS.members(clubId) });
    },
  });
};

export const useRemoveMember = (clubId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clubId,
      memberId,
    }: {
      clubId: number | string;
      memberId: string;
    }) => removeClubMember(getStoredToken()!, clubId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLUB_KEYS.members(clubId) });
    },
  });
};

export const useApproveMemberRequest = (clubId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clubId,
      memberId,
    }: {
      clubId: number | string;
      memberId: string;
    }) => approveMemberRequest(getStoredToken()!, clubId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLUB_KEYS.members(clubId) });
    },
  });
};
