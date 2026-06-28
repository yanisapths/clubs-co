"use client";

import { useRef, useState, ChangeEvent, useCallback } from "react";
import {
  Pencil,
  Globe,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import {
  FormInput,
  FormTextarea,
} from "@/features/shared/components/input/FormInput";
import {
  ModalShell,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/features/shared/components/modal";
import { SocialPlatform } from "../../club/create";
import { uploadFile } from "@/features/studio/api/file";
import { getStoredToken } from "@/lib/storage";
import { ALL_PLATFORMS, PLATFORM_CONFIG } from "@/features/shared/constants";

export type SocialLinkMap = Record<string, string>;

export interface ProfileFormData {
  firstname: string;
  lastname: string;
  displayName: string;
  bio: string;
  imageUrl: string | null;
  bannerUrl: string | null;
  socialLinks: SocialLinkMap;
}

export interface ProfileSaveData {
  firstname: string;
  lastname: string;
  displayName: string;
  bio: string;
  socialLinks: SocialLinkMap;
  imageUrl: string | null;
  bannerUrl?: string | null;
}

interface EditProfileModalProps {
  initialData: ProfileFormData;
  username: string;
  onSave: (data: ProfileSaveData) => Promise<void>;
  onClose: () => void;
}

const DISPLAY_NAME_MAX = 50;
const BIO_MAX = 500;
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];
const TEMP_DEST_PATH = "user/temp";

type AvatarUploadStatus = "idle" | "uploading" | "uploaded" | "error";

export function EditProfileModal({
  initialData,
  username,
  onSave,
  onClose,
}: EditProfileModalProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [firstname, setFirstname] = useState(initialData.firstname);
  const [lastname, setLastname] = useState(initialData.lastname);
  const [displayName, setDisplayName] = useState(initialData.displayName);
  const [bio, setBio] = useState(initialData.bio);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData.imageUrl,
  );
  const [avatarUploadStatus, setAvatarUploadStatus] =
    useState<AvatarUploadStatus>("idle");
  const [avatarTempUrl, setAvatarTempUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [socialExpanded, setSocialExpanded] = useState(false);

  const [socialUrls, setSocialUrls] = useState<Record<SocialPlatform, string>>(
    () => {
      const seed: Record<SocialPlatform, string> = {
        Website: "",
        Instagram: "",
        Meta: "",
        X: "",
      };
      for (const platform of ALL_PLATFORMS) {
        const { apiKey } = PLATFORM_CONFIG[platform];
        seed[platform] = initialData.socialLinks[apiKey] ?? "";
      }
      return seed;
    },
  );

  const uploadAvatar = useCallback(async (file: File) => {
    const token = getStoredToken();
    if (!token) {
      setAvatarUploadStatus("error");
      setAvatarError("Not signed in.");
      return;
    }

    setAvatarUploadStatus("uploading");
    setAvatarTempUrl(null);
    setAvatarError(null);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const tempFilename = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const result = await uploadFile(
        token,
        file,
        tempFilename,
        TEMP_DEST_PATH,
      );

      setAvatarTempUrl(result.url);
      setAvatarUploadStatus("uploaded");
    } catch (err) {
      setAvatarUploadStatus("error");
      setAvatarError(
        err instanceof Error ? err.message : "Upload failed. Tap to retry.",
      );
    }
  }, []);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setAvatarError("Only PNG or JPG files are accepted.");
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError(
        `File is ${(file.size / (1024 * 1024)).toFixed(1)} MB — must be under 2 MB.`,
      );
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    uploadAvatar(file);
  };

  const handleRetryUpload = () => {
    avatarInputRef.current?.click();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const socialLinks: SocialLinkMap = {};
      for (const platform of ALL_PLATFORMS) {
        const { apiKey } = PLATFORM_CONFIG[platform];
        const url = socialUrls[platform].trim();
        if (url) socialLinks[apiKey] = url;
      }

      await onSave({
        firstname,
        lastname,
        displayName,
        bio,
        socialLinks,
        imageUrl: avatarTempUrl,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const connectedCount = ALL_PLATFORMS.filter((p) =>
    socialUrls[p].trim(),
  ).length;

  const isAvatarUploading = avatarUploadStatus === "uploading";
  const isSaveDisabled =
    isSaving ||
    isAvatarUploading ||
    (avatarUploadStatus === "error" && avatarTempUrl === null);

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title="Edit profile" onClose={onClose} />

      <ModalBody className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={
              avatarUploadStatus === "error"
                ? handleRetryUpload
                : () => avatarInputRef.current?.click()
            }
            disabled={isAvatarUploading}
            className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-full bg-zinc-800 disabled:cursor-not-allowed"
            aria-label={
              avatarUploadStatus === "error"
                ? "Retry avatar upload"
                : "Change profile picture"
            }
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-zinc-500">
                {username?.charAt(0).toUpperCase()}
              </span>
            )}

            {isAvatarUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}

            {avatarUploadStatus === "error" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <span className="text-[10px] text-red-300 font-medium text-center px-1 leading-tight">
                  Failed — tap to retry
                </span>
              </div>
            )}

            {!isAvatarUploading && avatarUploadStatus !== "error" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/50">
                <Pencil className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            )}
          </button>

          <span className="text-sm text-zinc-500">@{username}</span>

          {avatarError && avatarUploadStatus === "error" && (
            <p className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {avatarError}
            </p>
          )}

          {avatarError && avatarUploadStatus === "idle" && (
            <p className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {avatarError}
            </p>
          )}

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png, image/jpeg"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <FormInput
            id="firstname"
            label="First name"
            value={firstname}
            onChange={setFirstname}
            placeholder="First name"
            maxLength={100}
            hint="It can be changed later."
          />
          <FormInput
            id="lastname"
            label="Last name"
            value={lastname}
            onChange={setLastname}
            placeholder="D"
            maxLength={1}
            hint="Only 1 letter allowed."
          />
        </div>

        <FormInput
          id="display-name"
          label="Display name"
          value={displayName}
          onChange={setDisplayName}
          placeholder="Add a display name"
          maxLength={DISPLAY_NAME_MAX}
          showCount
          hint="It can be changed later."
        />

        <FormTextarea
          id="profile-bio"
          label="Bio"
          value={bio}
          onChange={setBio}
          placeholder="Add a detail bio"
          maxLength={BIO_MAX}
          showCount
          rows={6}
          hint="It can be changed later."
        />

        {/* ── Social links ── */}
        <div>
          <p className="text-base font-semibold text-white">Social Links</p>

          <button
            type="button"
            onClick={() => setSocialExpanded((v) => !v)}
            className="mt-3 flex w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-base transition-colors hover:border-zinc-500"
          >
            <div className="flex items-center gap-2 text-zinc-400">
              <Globe className="h-4 w-4 shrink-0" />
              <span>
                {connectedCount > 0
                  ? `${connectedCount} account${connectedCount > 1 ? "s" : ""} connected`
                  : "Connect to your social accounts"}
              </span>
            </div>
            {socialExpanded ? (
              <ChevronUp className="h-4 w-4 text-zinc-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            )}
          </button>

          {socialExpanded && (
            <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4">
              {ALL_PLATFORMS.map((platform) => {
                const { label, placeholder, Icon } = PLATFORM_CONFIG[platform];
                return (
                  <div key={platform} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
                      <Icon className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-xs text-zinc-500">{label}</span>
                      <input
                        type="url"
                        value={socialUrls[platform]}
                        onChange={(e) =>
                          setSocialUrls((prev) => ({
                            ...prev,
                            [platform]: e.target.value,
                          }))
                        }
                        placeholder={placeholder}
                        className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none border-b border-zinc-700 focus:border-zinc-400 pb-1 transition-colors"
                      />
                    </div>
                    {socialUrls[platform] && (
                      <button
                        type="button"
                        onClick={() =>
                          setSocialUrls((prev) => ({ ...prev, [platform]: "" }))
                        }
                        className="text-xs text-zinc-500 hover:text-red-400 transition-colors shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter
        onClose={onClose}
        onSave={handleSave}
        saveLabel={isAvatarUploading ? "Uploading…" : "Save"}
        isSaving={isSaveDisabled}
      />
    </ModalShell>
  );
}
