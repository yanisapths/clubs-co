export type ClubType = "Public" | "Private" | "Exclusive";
export type ClubVisibility = "Anyone" | "Club member only";

export interface ClubSpace {
  id: string;
  name: string;
  location: string;
}

export type SocialPlatform = "Website" | "X" | "Meta" | "Instagram";

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string; //validate valid url
}

export interface ClubFormData {
  image: File | null;
  imagePreview: string | null;
  name: string;
  description: string;
  category: number | null;
  tags: string[];
  clubType: ClubType;
  visibility: ClubVisibility;
  maxSeats: number;
  spaces: ClubSpace[];
  socialLinks: SocialLink[];
  allowFollowers: boolean;
  activate: boolean;
}

export const MAX_TAGS = 5; // validate max 50 characters per tag, English only, allow space, not allow any special characters.
export const MAX_SPACES = 3; // validate max 100 characters per space, English only.
export const MAX_SEATS = 200;

export const initialClubFormData: ClubFormData = {
  image: null,
  imagePreview: null,
  name: "",
  description: "",
  category: 1,
  tags: [],
  clubType: "Public",
  visibility: "Anyone",
  maxSeats: MAX_SEATS,
  spaces: [],
  socialLinks: [],
  allowFollowers: true,
  activate: true,
};
