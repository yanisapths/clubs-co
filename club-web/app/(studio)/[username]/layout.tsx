// app/(studio)/[username]/layout.tsx
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

interface Props {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

export default async function UsernameLayout({ params, children }: Props) {
  const { username } = await params;
  const session = await getSession();

  if (!session) redirect("/login");

  if (session.username !== username) notFound();

  return <>{children}</>;
}
