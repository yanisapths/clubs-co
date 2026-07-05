import { BackgroundCover } from "@/features/studio/components/layout/BackgroundCover";
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  // Next.js 15+ passes params as a Promise. `await` on a plain object is a
  // no-op, so this stays safe on older Next versions too.
  params: Promise<{ username: string }> | { username: string };
  children: React.ReactNode;
};

// NOTE: swap this for however your app already reaches the API from the
// server (e.g. a shared `serverFetch` helper). Kept plain here so the
// assumption is obvious and easy to replace.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9090";

type PublicProfile = {
  displayName?: string;
  bio?: string;
  imageUrl?: string;
  username: string;
};

async function fetchPublicProfile(
  username: string,
): Promise<PublicProfile | null> {
  const url = `${API_BASE_URL}/api/v1/membership/user/${encodeURIComponent(username)}`;

  try {
    // Metadata is generated at request time; tune this to `force-cache`
    // or a `next: { revalidate }` value if profiles don't change often.
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.error(
        `[generateMetadata] ${url} returned ${res.status} ${res.statusText}`,
      );
      return null;
    }

    const json = await res.json();
    return json?.data ?? null;
  } catch (err) {
    // NOTE: this logs to the server terminal (or your host's server logs),
    // not the browser console — generateMetadata always runs on the server.
    console.error(`[generateMetadata] fetch failed for ${url}:`, err);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchPublicProfile(username);
  const previousImages = (await parent).openGraph?.images ?? [];

  if (!profile) {
    return {
      title: "Member not found — Clubspace",
      description: "This member profile doesn't exist or is unavailable.",
    };
  }

  const name = profile.displayName || `@${profile.username}`;
  const title = `${name} (@${profile.username}) - Clubspace`;
  const description = profile.bio
    ? profile.bio.slice(0, 160)
    : `View ${name}'s clubs and profile on Clubspace.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      username: profile.username,
      images: profile.imageUrl
        ? [{ url: profile.imageUrl, width: 400, height: 400, alt: name }]
        : previousImages,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: profile.imageUrl ? [profile.imageUrl] : undefined,
    },
  };
}

export default function MemberProfileLayout({ children }: Props) {
  return <>{children}</>;
}
