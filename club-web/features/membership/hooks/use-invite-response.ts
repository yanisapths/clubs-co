"use client";

import { useCallback, useState } from "react";
import { acceptClubInvite, declineClubInvite } from "../api/invite";
type Action = "accept" | "decline" | null;

interface UseClubInviteResponseResult {
  respond: (action: "accept" | "decline") => Promise<boolean>;
  pendingAction: Action;
  error: string | null;
}

export function useClubInviteResponse(
  clubId: number,
): UseClubInviteResponseResult {
  const [pendingAction, setPendingAction] = useState<Action>(null);
  const [error, setError] = useState<string | null>(null);

  const respond = useCallback(
    async (action: "accept" | "decline"): Promise<boolean> => {
      setPendingAction(action);
      setError(null);
      try {
        if (action === "accept") {
          await acceptClubInvite(clubId);
        } else {
          await declineClubInvite(clubId);
        }
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return false;
      } finally {
        setPendingAction(null);
      }
    },
    [clubId],
  );

  return { respond, pendingAction, error };
}
