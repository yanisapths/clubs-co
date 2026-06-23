"use client";

import { useRef, useState, ChangeEvent } from "react";
import { Pencil, Globe, AlertCircle } from "lucide-react";
import {
  ModalShell,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/features/shared/components/modal/modal";
import {
  FormInput,
  FormTextarea,
} from "@/features/shared/components/input/FormInput";

interface SocialLink {
  platform: "Website" | "X" | "Meta" | "Instagram";
  url: string;
}

export interface ProfileFormData {
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  socialLinks: SocialLink[];
}

interface EditProfileModalProps {
  initialData: ProfileFormData;
  username: string;
  onSave: (data: ProfileFormData, avatarFile: File | null) => Promise<void>;
  onClose: () => void;
}

const DISPLAY_NAME_MAX = 100;
const BIO_MAX = 500;
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_ACCEPTED = "image/png, image/jpeg";

export function EditProfileModal({
  initialData,
  username,
  onSave,
  onClose,
}: EditProfileModalProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(initialData.displayName);
  const [bio, setBio] = useState(initialData.bio);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData.avatarUrl,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Avatar ──────────────────────────────────────────────────────────────────

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setAvatarError("Only PNG or JPG files are accepted.");
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError(
        `File is ${(file.size / (1024 * 1024)).toFixed(1)} MB — must be under 2 MB.`,
      );
      return;
    }

    setAvatarError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(
        { ...initialData, displayName, bio, avatarUrl: avatarPreview },
        avatarFile,
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title="Edit profile" onClose={onClose} />

      <ModalBody className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-full bg-zinc-800"
            aria-label="Change profile picture"
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

            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/50">
              <Pencil className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>

          <span className="text-sm text-zinc-500">@{username}</span>

          {avatarError && (
            <p className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {avatarError}
            </p>
          )}

          <input
            ref={avatarInputRef}
            type="file"
            accept={AVATAR_ACCEPTED}
            className="hidden"
            onChange={handleAvatarChange}
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
          hint="It can be changed later."
        />

        <div>
          <p className="text-base font-semibold text-white">Social Links</p>
          <button
            type="button"
            className="mt-3 flex cursor-pointer items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-base text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span>Connect to your social accounts</span>
          </button>
        </div>
      </ModalBody>

      <ModalFooter
        onClose={onClose}
        onSave={handleSave}
        saveLabel="Save"
        isSaving={isSaving}
      />
    </ModalShell>
  );
}
