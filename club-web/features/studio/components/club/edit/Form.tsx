"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClubFormData } from "@/features/studio/components/club/create";
import { useAccountAuth } from "@/hooks/use-account-auth";
import { categories } from "@/features/shared/constants";
import {
  useGetClubById,
  useUpdateClub,
} from "@/features/studio/hooks/use-club";
import { toast } from "@heroui/react";
import {
  visibilityMap,
  validateForm,
  buildClubThumbnailFilename,
} from "../constants";
import { ApiError } from "@/lib/api-types";
import { uploadFile } from "@/features/studio/api/file";
import { getStoredToken } from "@/lib/storage";
import { ClubFormHeader } from "../create/ClubFormHeader";
import { ClubImageUpload } from "../create/ClubImageUpload";
import { ClubPreviewCard } from "../create/ClubPreviewCard";
import { ClubBasicInfoForm } from "../create/ClubBasicInfoForm";
import { ClubSettingsForm } from "../create/ClubSettingsForm";
import { ClubPublishForm } from "../create/ClubPublishForm";
import { ClubFormFooter } from "../create/ClubFormFooter";

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
  const [isNameExist, setIsNameExist] = useState<boolean>(false);

  const updateFormData = (updates: Partial<ClubFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleImageChange = (file: File | null, preview: string | null) => {
    updateFormData({ image: file, imagePreview: preview });
  };

  const handleUpdate = async () => {
    let thumbnailImage: string | null | undefined = undefined;

    if (formData.image) {
      const ext = formData.image.name.split(".").pop();

      const filename = buildClubThumbnailFilename(Date.now(), ext);
      const form = new FormData();
      form.append("file", formData.image);
      form.append("filename", filename);
      form.append("dest_path", "club/images");

      const uploadRes = await uploadFile(
        getStoredToken()!,
        formData.image,
        filename,
        "club/images",
      );
      thumbnailImage = uploadRes.url;
    } else if (formData.imagePreview === null) {
      thumbnailImage = null;
    }

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
        ...(thumbnailImage !== undefined && { thumbnailImage }),
        socialLinks: formData.socialLinks,
      },
      {
        onSuccess: () => {
          router.push(`/${user.username}/studio/club/${clubId}`);
          toast.success("Club updated successfully!");
        },
        onError: (error: Error) => {
          const message =
            error instanceof ApiError ? error.message : "Failed to update club";
          toast.danger(message);
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

  const isValid = validateForm(formData, isNameExist, false, club?.memberCount);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0c0c0c] text-white">
      <ClubFormHeader
        onBack={() => router.back()}
        isEdit={isEdit}
        clubName={club?.name}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-12 overflow-hidden lg:flex-row lg:gap-16">
        <div className="shrink-0 lg:w-1/3 bg-[#141415] border-r border-white/20">
          <div className="lg:sticky p-4 sm:px-24 sm:pt-8">
            <ClubImageUpload
              imagePreview={formData.imagePreview}
              onImageChange={handleImageChange}
              badge={formData.clubType}
              category={selectedCategory}
            />
            {hasPreviewContent && <ClubPreviewCard data={formData} />}
          </div>
        </div>

        <div className="-mt-8 sm:mt-0 sm:min-h-0 sm:flex-1 overflow-y-auto lg:w-2/3">
          <div className="flex flex-col gap-8 pb-10 px-4 sm:px-20 sm:pt-12">
            <section>
              <ClubBasicInfoForm
                data={formData}
                onUpdate={updateFormData}
                isEdit={isEdit}
                originalName={club?.name}
                setIsNameExist={setIsNameExist}
              />
            </section>
            <section>
              <ClubSettingsForm
                formdata={formData}
                onUpdate={updateFormData}
                clubInfo={club}
              />
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
