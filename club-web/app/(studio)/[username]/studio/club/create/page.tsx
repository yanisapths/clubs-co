"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAccountAuth } from "@/hooks/use-account-auth";
import { categories } from "@/features/shared/constants";
import {
  useCreateClub,
  useGetOwnerClubs,
} from "@/features/studio/hooks/use-club";
import { toast } from "@heroui/react";
import {
  buildClubThumbnailFilename,
  validateForm,
  visibilityMap,
} from "@/features/studio/components/club/constants";

import { getStoredToken } from "@/lib/storage";
import { uploadFile } from "@/features/studio/api/file";
import {
  ClubFormData,
  initialClubFormData,
} from "@/features/studio/components/club/create";
import { ClubBasicInfoForm } from "@/features/studio/components/club/create/ClubBasicInfoForm";
import { ClubFormFooter } from "@/features/studio/components/club/create/ClubFormFooter";
import { ClubFormHeader } from "@/features/studio/components/club/create/ClubFormHeader";
import { ClubImageUpload } from "@/features/studio/components/club/create/ClubImageUpload";
import { ClubPreviewCard } from "@/features/studio/components/club/create/ClubPreviewCard";
import { ClubPublishForm } from "@/features/studio/components/club/create/ClubPublishForm";
import { ClubSettingsForm } from "@/features/studio/components/club/create/ClubSettingsForm";
import { PlugZap } from "lucide-react";

export default function CreateClubPage() {
  const router = useRouter();
  const { user } = useAccountAuth();
  const [formData, setFormData] = useState<ClubFormData>(initialClubFormData);
  const [isNameExist, setIsNameExist] = useState<boolean>(false);
  const { clubs } = useGetOwnerClubs();
  const quotaExceeded = clubs?.length >= 5;

  const { mutate: createClub, isPending: isCreating } = useCreateClub();

  const updateFormData = (updates: Partial<ClubFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleImageChange = (file: File | null, preview: string | null) => {
    updateFormData({ image: file, imagePreview: preview });
  };

  const handleCreate = async () => {
    try {
      let thumbnailImage: string | undefined;

      if (formData.image) {
        const ext = formData.image.name.split(".").pop();
        const filename = buildClubThumbnailFilename(Date.now(), ext);
        const uploadResult = await uploadFile(
          getStoredToken()!,
          formData.image,
          filename,
          "club/images",
        );

        thumbnailImage = uploadResult.url;
      }

      createClub(
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
          })),
          activate: formData.activate,
          thumbnailImage: thumbnailImage,
          socialLinks: formData.socialLinks,
        },
        {
          onSuccess: () => {
            router.push(`/${user.username}/studio/club`);
            toast.success("Club created successfully!");
          },
        },
      );
    } catch (error) {
      toast.danger("Failed to upload image");
    }
  };

  const selectedCategory = categories.find((c) => c.id === formData.category);

  const hasPreviewContent =
    Boolean(formData.name) ||
    Boolean(formData.description) ||
    formData.tags.length > 0 ||
    formData.spaces.length > 0;

  const isValid = validateForm(formData, isNameExist, quotaExceeded);

  if (quotaExceeded) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-[#0c0c0c] text-white">
        <ClubFormHeader onBack={() => router.back()} />

        <div className="flex flex-col items-center justify-center m-auto text-center">
          <PlugZap size={200} className="opacity-30 rotate-10" />
          <div className="text-white/60">
            Quata exceeded club creation limit. <br />
            Only 5 clubs can be created.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0c0c0c] text-white">
      <ClubFormHeader onBack={() => router.back()} />

      <div className="flex min-h-0 flex-1 flex-col gap-12 overflow-hidden lg:flex-row lg:gap-16">
        <div className="shrink-0 lg:w-1/3 bg-[#141415] border-r border-white/20">
          <div className="lg:sticky px-4 py-6 sm:px-24 sm:pt-8">
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
          <div className="flex flex-col gap-4 px-4 sm:gap-8 pb-10 sm:px-20 sm:pt-12">
            <section>
              <ClubBasicInfoForm
                data={formData}
                onUpdate={updateFormData}
                setIsNameExist={setIsNameExist}
              />
            </section>
            <section>
              <ClubSettingsForm formdata={formData} onUpdate={updateFormData} />
            </section>
            <section>
              <ClubPublishForm data={formData} onUpdate={updateFormData} />
            </section>
          </div>
        </div>
      </div>

      <ClubFormFooter
        onCancel={() => router.back()}
        onCreate={handleCreate}
        isCreating={isCreating}
        isValid={isValid}
      />
    </div>
  );
}
