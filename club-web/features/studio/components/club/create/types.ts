import { SocialLink } from "@/features/studio/api/common";
import { MAX_SEATS } from "../constants";

export type ClubType = "Public" | "Private" | "Exclusive";
export type ClubVisibility = "Anyone" | "Club member only";

export interface ClubSpace {
  id: string;
  name: string;
  isNew?: boolean;
}

export type SocialPlatform = "Website" | "X" | "Meta" | "Instagram";

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
