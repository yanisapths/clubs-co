"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClubFormData,
  ClubImageUpload,
  ClubPreviewCard,
  ClubBasicInfoForm,
  ClubSettingsForm,
  ClubPublishForm,
  ClubFormFooter,
  ClubFormHeader,
  MAX_TAGS,
  MAX_SEATS,
  MAX_SPACES,
  ClubVisibility,
  ClubSpace,
} from "@/features/studio/components/club/create";
import { useAccountAuth } from "@/hooks/use-account-auth";
import { categories } from "@/features/shared/constants";
import {
  useGetClubById,
  useUpdateClub,
} from "@/features/studio/hooks/use-club";
import { toast } from "@heroui/react";

const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 250;

const TAG_REGEX = /^[a-zA-Z0-9 ]+$/;
const isValidTag = (tag: string) =>
  tag.length > 0 && tag.length <= 50 && TAG_REGEX.test(tag);

const isValidSpace = (space: ClubSpace) =>
  space.name.length > 0 &&
  space.name.length <= 100 &&
  /^[a-zA-Z0-9 ]+$/.test(space.name);

function validateForm(data: ClubFormData): boolean {
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

const visibilityMap: Record<ClubVisibility, "Anyone" | "MemberOnly"> = {
  Anyone: "Anyone",
  "Club member only": "MemberOnly",
};

export function EditClubForm({
  clubId,
  initialData,
  isEdit,
}: {
  clubId: number;
  initialData: ClubFormData;
  isEdit: boolean;
}) {
  const router = useRouter();
  const { user } = useAccountAuth();
  const { club } = useGetClubById(clubId);
  const { mutate: updateClub, isPending: isUpdating } = useUpdateClub(clubId);

  const [formData, setFormData] = useState<ClubFormData>(initialData);

  const updateFormData = (updates: Partial<ClubFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleImageChange = (file: File | null, preview: string | null) => {
    updateFormData({ image: file, imagePreview: preview });
  };

  const handleUpdate = () => {
    updateClub(
      {
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryId: formData.category!,
        clubType: formData.clubType,
        visibility: visibilityMap[formData.visibility],
        maxSeats: formData.maxSeats,
        tags: formData.tags.map((name) => ({ name })),
        spaces: formData.spaces.map((s) => ({
          id: Number(s.id),
          name: s.name,
        })),
      },
      {
        onSuccess: () => {
          router.push(`/${user.username}/club`);
          toast.success("Club updated successfully!");
        },
        onError: () => {
          toast.danger("Failed to update club");
        },
      },
    );
  };

  const selectedCategory = categories.find((c) => c.id === formData.category);

  const hasPreviewContent =
    Boolean(formData.name) ||
    Boolean(formData.description) ||
    formData.tags.length > 0 ||
    formData.spaces.length > 0;

  const isValid = validateForm(formData);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0c0c0c] text-white">
      <ClubFormHeader
        onBack={() => router.back()}
        isEdit={isEdit}
        clubName={club?.name}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-12 overflow-hidden lg:flex-row lg:gap-16">
        <div className="shrink-0 lg:w-1/3 bg-[#141415] border-r border-white/20">
          <div className="lg:sticky px-24 pt-8">
            <ClubImageUpload
              imagePreview={formData.imagePreview}
              onImageChange={handleImageChange}
              badge={formData.clubType}
              category={selectedCategory}
            />
            {hasPreviewContent && <ClubPreviewCard data={formData} />}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto lg:w-2/3">
          <div className="flex flex-col gap-8 pb-10 px-20 pt-12">
            <section>
              <ClubBasicInfoForm
                data={formData}
                onUpdate={updateFormData}
                isEdit={isEdit}
              />
            </section>
            <section>
              <ClubSettingsForm data={formData} onUpdate={updateFormData} />
            </section>
            <section>
              <ClubPublishForm data={formData} onUpdate={updateFormData} />
            </section>
          </div>
        </div>
      </div>

      <ClubFormFooter
        onCancel={() => router.back()}
        onCreate={handleUpdate}
        isCreating={isUpdating}
        isValid={isValid}
        isEdit={isEdit}
      />
    </div>
  );
}
