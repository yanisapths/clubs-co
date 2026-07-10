const baseApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/studio/club`;

function url(clubId: number, path: string): string {
  return `${baseApi}/${clubId}/member/invite/${path}`;
}

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

export async function acceptClubInvite(clubId: number): Promise<void> {
  const res = await fetch(url(clubId, "accept"), {
    method: "PATCH",
    credentials: "include",
  });
  await parseOrThrow(res, "Failed to accept invitation");
}

export async function declineClubInvite(clubId: number): Promise<void> {
  const res = await fetch(url(clubId, "decline"), {
    method: "PATCH",
    credentials: "include",
  });
  await parseOrThrow(res, "Failed to decline invitation");
}
