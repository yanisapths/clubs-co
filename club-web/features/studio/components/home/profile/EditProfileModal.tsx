"use client";

import { useRef, useState, ChangeEvent } from "react";
import {
  Pencil,
  Globe,
  AlertCircle,
  ChevronDown,
  ChevronUp,
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
import { SiInstagram, SiFacebook, SiX } from "@icons-pack/react-simple-icons";
import { SocialPlatform } from "../../club/create/types";

interface SocialLink {
  platform: SocialPlatform;
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

const PLATFORM_CONFIG: Record<
  SocialPlatform,
  { label: string; placeholder: string; Icon: React.FC<{ className?: string }> }
> = {
  Website: {
    label: "Website",
    placeholder: "https://yourwebsite.com",
    Icon: ({ className }) => <Globe className={className} />,
  },
  Instagram: {
    label: "Instagram",
    placeholder: "https://instagram.com/yourhandle",
    Icon: ({ className }) => <SiInstagram className={className} />,
  },
  Meta: {
    label: "Facebook",
    placeholder: "https://facebook.com/yourprofile",
    Icon: ({ className }) => <SiFacebook className={className} />,
  },
  X: {
    label: "X (Twitter)",
    placeholder: "https://x.com/yourhandle",
    Icon: ({ className }) => <SiX className={className} />,
  },
};
const ALL_PLATFORMS: SocialPlatform[] = ["Website", "Instagram", "Meta", "X"];

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
  const [socialExpanded, setSocialExpanded] = useState(false);

  // Build URL map from initial social links
  const initialUrls = Object.fromEntries(
    initialData.socialLinks.map((l) => [l.platform, l.url]),
  ) as Record<SocialPlatform, string>;

  const [socialUrls, setSocialUrls] = useState<Record<SocialPlatform, string>>({
    Website: initialUrls.Website || "",
    Instagram: initialUrls.Instagram || "",
    Meta: initialUrls.Meta || "",
    X: initialUrls.X || "",
  });

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const socialLinks: SocialLink[] = ALL_PLATFORMS.filter((p) =>
        socialUrls[p].trim(),
      ).map((p) => ({ platform: p, url: socialUrls[p].trim() }));

      await onSave(
        {
          ...initialData,
          displayName,
          bio,
          avatarUrl: avatarPreview,
          socialLinks,
        },
        avatarFile,
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const connectedCount = ALL_PLATFORMS.filter((p) =>
    socialUrls[p].trim(),
  ).length;

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title="Edit profile" onClose={onClose} />

      <ModalBody className="flex flex-col gap-6">
        {/* Avatar */}
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
            accept="image/png, image/jpeg"
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
        saveLabel="Save"
        isSaving={isSaving}
      />
    </ModalShell>
  );
}
