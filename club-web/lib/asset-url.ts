const GCS_BUCKET = "club-space-bucket";
const GCS_PREFIX = `https://storage.googleapis.com/${GCS_BUCKET}/`;

function assetBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "";
  // Strip a mistaken `/**` (next/image remotePatterns glob) and trailing slashes.
  return raw.replace(/\/\*\*$/, "").replace(/\/+$/, "");
}

function isGcsOrigin(url: string): boolean {
  return url.includes("storage.googleapis.com");
}

/**
 * Rewrites persisted GCS public URLs onto the CDN origin.
 * Passes through blob:, data:, already-CDN, and non-GCS URLs unchanged.
 * Does not mutate API payloads — gallery deletes match DB URLs exactly.
 */
export function toAssetUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;

  const base = assetBaseUrl();
  if (!base || isGcsOrigin(base)) return url;
  if (!url.startsWith(GCS_PREFIX)) return url;

  return `${base}/${url.slice(GCS_PREFIX.length)}`;
}
