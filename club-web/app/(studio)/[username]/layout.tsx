import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardLayout } from "@/features/studio/components/layout/DashboardLayout";
interface Props {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

export const metadata = {
  title: "My Profile | Creator Studio",
  description: "Create and customize your profile on Clubspace.",
};

export default async function UsernameLayout({ params, children }: Props) {
  const { username } = await params;

  const session = await getSession();

  if (!session) redirect("/login");

  if (session.username !== username) notFound();

  return <DashboardLayout>{children}</DashboardLayout>;
}
