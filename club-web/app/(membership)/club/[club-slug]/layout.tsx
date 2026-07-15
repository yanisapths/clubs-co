// app/.../club/[club-slug]/layout.tsx
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ "club-slug": string }> | { "club-slug": string };
  children: React.ReactNode;
};
const NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9090";
const MEMBERSHIP_CLUB_BASE = `${NEXT_PUBLIC_API_BASE_URL}/api/v1/membership/club`;

type Club = {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  memberCount?: number;
};

type MembershipClubDetailResponse = {
  clubInfo: Club;
  members: {
    displayName: string;
    username: string;
    id: string;
    role: string;
    joinedAt: number;
  }[];
};

async function fetchPublicClub(
  slug: string,
): Promise<MembershipClubDetailResponse | null> {
  const url = `${MEMBERSHIP_CLUB_BASE}/${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        `[generateMetadata] ${url} returned ${res.status} ${res.statusText}`,
      );
      return null;
    }

    const json = await res.json();
    return (json?.data ?? null) as MembershipClubDetailResponse | null;
  } catch (err) {
    console.error(`[generateMetadata] fetch failed for ${url}:`, err);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { "club-slug": slug } = await params;
  const data = await fetchPublicClub(slug);
  const previousImages = (await parent).openGraph?.images ?? [];

  if (!data?.clubInfo) {
    return {
      title: "Club not found — Clubspace",
      description: "This club doesn't exist or is unavailable.",
    };
  }

  const { clubInfo: club } = data;

  const title = `${club.name} - Clubspace`;
  const description = club.description
    ? club.description.slice(0, 160)
    : club.memberCount
      ? `Join ${club.name} and ${club.memberCount} other members on Clubspace.`
      : `Join ${club.name} on Clubspace.`;

  const image = club.bannerUrl ?? club.imageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: club.name }]
        : previousImages,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function ClubDetailLayout({ children }: Props) {
  return <>{children}</>;
}
