import { categories } from "@/features/shared/constants";
import { ClubFormData, ClubSpace, ClubVisibility } from "./create/types";

export const MAX_TAGS = 5; // validate max 50 characters per tag, English only, allow space, not allow any special characters.
export const MAX_SPACES = 3; // validate max 100 characters per space, English only.
export const MAX_SEATS = 200;

export const NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 250;

export const TAG_REGEX = /^[a-zA-Z0-9 ]+$/;
export const isValidTag = (tag: string) =>
  tag.length > 0 && tag.length <= 50 && TAG_REGEX.test(tag);

export const isValidSpace = (space: ClubSpace) =>
  space.name.length > 0 &&
  space.name.length <= 100 &&
  /^[a-zA-Z0-9 ]+$/.test(space.name);

export function validateForm(
  data: ClubFormData,
  nameExist: boolean,
  quotaExceeded?: boolean,
): boolean {
  if (nameExist) return false;
  if (quotaExceeded) return false;
  if (!data.name.trim() || data.name.length > NAME_MAX_LENGTH) return false;
  if (
    !data.description.trim() ||
    data.description.length > DESCRIPTION_MAX_LENGTH
  )
    return false;
  if (data.category === null) return false;
  if (data.tags.length > MAX_TAGS) return false;
  if (data.tags.some((tag) => !isValidTag(tag))) return false;
  if (data.spaces.length > MAX_SPACES) return false;
  if (data.spaces.some((space) => !isValidSpace(space))) return false;
  if (
    !Number.isInteger(data.maxSeats) ||
    data.maxSeats < 1 ||
    data.maxSeats > MAX_SEATS
  )
    return false;
  if (data.socialLinks.some((link) => !Object.values(link)[0]?.trim()))
    return false;

  return true;
}

export const visibilityMap: Record<ClubVisibility, "Anyone" | "MemberOnly"> = {
  Anyone: "Anyone",
  "Club member only": "MemberOnly",
};

export const visibilityReverseMap: Record<
  "Anyone" | "MemberOnly",
  ClubVisibility
> = {
  Anyone: "Anyone",
  MemberOnly: "Club member only",
};

export const buildClubThumbnailFilename = (date: number, ext?: string) => {
  const filename = `club_${date}_thumbnail.${ext}`;
  return filename;
};

export const NOW_SECONDS = Date.now() / 1000;
export const SEVEN_DAYS = 7 * 86400;

export const gradientMap: Record<string, string> = {
  sports: "linear-gradient(160deg, #4a5a1a 0%, #7a8a2a 40%, #b8aa30 100%)",
  art: "linear-gradient(160deg, #5a1a2a 0%, #8a2a4a 40%, #aa3a6a 100%)",
  culture: "linear-gradient(160deg, #4a2a1a 0%, #7a4a2a 40%, #aa6a3a 100%)",
  esport: "linear-gradient(160deg, #2a1a5a 0%, #4a2a8a 40%, #6a3aaa 100%)",
  education: "linear-gradient(160deg, #1a5a3a 0%, #2a8a5a 40%, #3aaa7a 100%)",
  tech: "linear-gradient(160deg, #0a1a2a 0%, #1a3a5a 40%, #2a5a8a 100%)",
  other: "linear-gradient(160deg, #1a1a2a 0%, #2a2a4a 40%, #4a3a6a 100%)",
};

export const getCategory = (categoryName: string) => {
  return categories.find((c) => c.category === categoryName);
};

export const getCategoryGradient = (categoryName: string) => {
  const category = getCategory(categoryName);

  return gradientMap[category?.colorVariant ?? "other"] ?? gradientMap.other;
};

export const getCategoryColorVariant = (categoryName: string) => {
  return getCategory(categoryName)?.colorVariant ?? "other";
};
