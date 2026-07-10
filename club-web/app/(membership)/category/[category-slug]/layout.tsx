// app/.../category/[category-slug]/layout.tsx
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ "category-slug": string }> | { "category-slug": string };
  children: React.ReactNode;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9090";
const MEMBERSHIP_CLUB_BASE = `${API_BASE_URL}/api/v1/membership/club/category`;

interface CategoryMetadataResponse {
  category?: {
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
  };
  pagination?: {
    totalRecords: number;
  };
}

async function fetchCategory(
  slug: string,
): Promise<CategoryMetadataResponse | null> {
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
    return json?.data ?? null;
  } catch (err) {
    console.error(`[generateMetadata] fetch failed for ${url}:`, err);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { "category-slug": slug } = await params;
  const data = await fetchCategory(slug);
  const previousImages = (await parent).openGraph?.images ?? [];

  if (!data?.category) {
    return {
      title: "Category not found — Clubspace",
      description: "This category doesn't exist or is unavailable.",
    };
  }

  const { category } = data;

  const title = `${category.name} - Clubspace`;
  const description = category.description
    ? category.description.slice(0, 160)
    : data.pagination?.totalRecords
      ? `Discover ${data.pagination.totalRecords} ${category.name} clubs on Clubspace.`
      : `Discover ${category.name} clubs on Clubspace.`;

  const image = category.imageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: category.name }]
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

export default function CategoryLayout({ children }: Props) {
  return <>{children}</>;
}
