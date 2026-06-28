const baseApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/membership/user`;

export async function checkUserExist(params: {
  email?: string;
  username?: string;
}): Promise<boolean> {
  const query = new URLSearchParams();

  if (params.email) query.set("email", params.email);
  if (params.username) query.set("username", params.username);

  const res = await fetch(`${baseApi}/exist?${query.toString()}`);

  if (!res.ok) throw new Error("Failed to check");

  const json = await res.json();

  return json.data.exist;
}
