import { Club } from "@/features/studio/api/club";
import { getGradient } from "@/features/studio/utils/utils";

export function ClubBanner({ club }: { club: Club }) {
  const [from, to] = getGradient(String(club.id));
  const bannerUrl = club.bannerUrl;

  return (
    <div
      className={`${bannerUrl ? "h-84" : "blur-3xl h-40 opacity-90 sm:h-48 lg:h-56"} relative w-full z-0 overflow-hidden rounded-none lg:rounded-xl`}
      style={
        bannerUrl
          ? {
              backgroundImage: `url(${bannerUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              maskImage:
                "linear-gradient(to bottom, black 45%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 45%, transparent 100%)",
            }
          : { background: `linear-gradient(135deg, ${from}, ${to})` }
      }
    >
      {!bannerUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none px-4 blur-3xl opacity-90">
          <h1 className="max-w-full truncate text-3xl font-bold text-white/20 tracking-tight sm:text-4xl lg:text-5xl">
            {club.name}
          </h1>
        </div>
      )}

      {bannerUrl && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-transparent" />
      )}
    </div>
  );
}
