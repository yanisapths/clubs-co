// club-web/features/membership/api/invite.ts

import { getStoredToken } from "@/lib/storage";

const membershipApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/membership`;

async function parseOrThrow(
  res: Response,
  fallbackMessage: string,
): Promise<void> {
  if (res.ok) return;

  let message = fallbackMessage;
  try {
    const json = await res.json();
    if (json?.error) message = json.error;
  } catch {}
  throw new Error(message);
}

export async function respondToClubInvite(
  clubId: number,
  isAccept: boolean,
): Promise<void> {
  const res = await fetch(`${membershipApi}/club/${clubId}/invite/response`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getStoredToken()}`,
    },
    body: JSON.stringify({ isAccept }),
  });
  await parseOrThrow(
    res,
    isAccept ? "Failed to accept invitation" : "Failed to decline invitation",
  );
}
