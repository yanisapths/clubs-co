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

export function validateForm(data: ClubFormData): boolean {
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
  if (data.socialLinks.some((link) => !link.url.trim())) return false;
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
