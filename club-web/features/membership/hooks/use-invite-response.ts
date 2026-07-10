"use client";

import { useCallback, useState } from "react";
import { respondToClubInvite } from "@/features/membership/api/invite";
import { useQueryClient } from "@tanstack/react-query";
import { CLUB_KEYS } from "./use-club";

type Action = "accept" | "decline" | null;

interface RespondResult {
  ok: boolean;
  error?: string;
}

interface UseClubInviteResponseResult {
  respond: (action: "accept" | "decline") => Promise<RespondResult>;
  pendingAction: Action;
  error: string | null;
}

export function useClubInviteResponse(
  clubId: number,
  clubName: string,
): UseClubInviteResponseResult {
  const [pendingAction, setPendingAction] = useState<Action>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const respond = useCallback(
    async (action: "accept" | "decline"): Promise<RespondResult> => {
      setPendingAction(action);
      setError(null);
      try {
        await respondToClubInvite(clubId, action === "accept");
        return { ok: true };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setPendingAction(null);
        queryClient.invalidateQueries({
          queryKey: CLUB_KEYS.members(clubName),
        });
        queryClient.invalidateQueries({
          queryKey: CLUB_KEYS.detailByName(clubName),
        });
      }
    },
    [clubId],
  );

  return { respond, pendingAction, error };
}
