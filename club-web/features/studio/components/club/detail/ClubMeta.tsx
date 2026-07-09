import { getGradient } from "@/features/shared/components/Avatar";
import { Tag } from "@/features/shared/components/Tag";
import { categories } from "@/features/shared/constants";
import { Club, ClubMember } from "@/features/studio/api/club";
import { formatUnixDate } from "@/lib/utils";
import { ClubThumbnail } from "../ClubThumbnail";
import { getCategory } from "../constants";
import { Button } from "@/design-system/components/button";
import { Edit3Icon } from "lucide-react";
import { useModal } from "@/hooks/use-modal";
import { usePatchClub } from "@/features/studio/hooks/use-club";
import { toast } from "@heroui/react";
import { EditBannerModal, EditBannerModalResult } from "./EditBannerModal";

export function ClubBanner({
  club,
  isOwner,
  onEdit,
}: {
  club: Club;
  isOwner: boolean;
  onEdit?: () => void;
}) {
  const [from, to] = getGradient(String(club.id));
  const categoryDef = categories.find((c) => c.id === club.category?.id);
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

export function ClubMeta({
  club,
  members,
  isStudio,
}: {
  club: Club;
  members?: ClubMember[];
  isStudio?: boolean;
}) {
  const category = getCategory(club.category.name);
  const { visible, show, close } = useModal();
  const patchClub = usePatchClub(club.id);

  const handleBannerSave = ({
    tempUrl,
    removeBanner,
  }: EditBannerModalResult) => {
    if (!tempUrl && !removeBanner) return;

    patchClub.mutate(
      { bannerUrl: removeBanner ? null : tempUrl },
      {
        onError: () => {
          toast.danger("Couldn't update the banner. Please try again.");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div
        className={`${isStudio ? "" : "-mt-10"} flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left`}
      >
        <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl bg-white/10 border border-white/15 overflow-hidden">
          <ClubThumbnail
            imageUrl={club.imageUrl}
            name={club.name}
            category={club.category.name}
            colorVariant={category?.colorVariant}
            size="square"
            className="h-full w-full"
          />
        </div>
        <div className="relative z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {club.name}
          </h2>
          <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <Tag>By {club.ownerDisplayName}</Tag>
            <Tag>Est. {formatUnixDate(club.createdAt)}</Tag>
            <div
              className={`flex gap-1 items-center ${club.activate ? "text-[#53FF84]" : "text-zinc-500"}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${club.activate ? "bg-[#53FF84]" : "bg-zinc-500"}`}
              />
              <span className="text-sm">
                {club.activate ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 sm:gap-6 lg:items-end">
        {isStudio ? (
          <Button
            onClick={show}
            className="rounded-full bg-white/10 text-white/70 px-4 py-1.5 text-sm font-medium hover:bg-white/20 transition-colors"
          >
            <Edit3Icon className="h-4 w-4" /> Edit banner
          </Button>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-center lg:justify-end lg:text-right">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40">
              Type
            </p>
            <p className="mt-0.5 text-white">{club.clubType}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40">
              Events
            </p>
            <p className="mt-0.5 font-semibold text-white">—</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40">
              Members
            </p>
            <p className="mt-0.5 font-semibold text-white">
              {club.memberCount} <span>/</span> {club?.maxSeats}
            </p>
          </div>
        </div>
      </div>

      {visible && (
        <EditBannerModal
          currentBannerUrl={club.bannerUrl}
          onSave={handleBannerSave}
          onClose={close}
        />
      )}
    </div>
  );
}
