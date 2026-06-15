"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClubFormData,
  initialClubFormData,
  ClubImageUpload,
  ClubPreviewCard,
  ClubBasicInfoForm,
  ClubSettingsForm,
  ClubPublishForm,
  ClubFormFooter,
  ClubFormHeader,
} from "@/features/studio/components/club/create";
import { useAccountAuth } from "@/hooks/use-account-auth";
import { categories } from "@/features/shared/constants";

export default function CreateClubPage() {
  const router = useRouter();
  const { user } = useAccountAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ClubFormData>(initialClubFormData);

  const updateFormData = (updates: Partial<ClubFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleImageChange = (file: File | null, preview: string | null) => {
    updateFormData({ image: file, imagePreview: preview });
  };

  const handleCancel = () => {
    router.back();
  };

  const handleCreate = async () => {
    console.log(formData);
    setIsCreating(true);
    try {
      // TODO: wire up to the clubs API once available
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push(`/${user.username}/club`);
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCategory = categories.find(
    (category) => category.id === formData.category,
  );

  const hasPreviewContent =
    Boolean(formData.name) ||
    Boolean(formData.description) ||
    formData.tags.length > 0 ||
    formData.spaces.length > 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0c0c0c] text-white">
      <ClubFormHeader onBack={() => router.back()} />

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
          <div className="flex flex-col gap-16 pb-10 px-20 pt-12">
            <section>
              <ClubBasicInfoForm data={formData} onUpdate={updateFormData} />
            </section>

            <hr className="border-zinc-800" />

            <section>
              <ClubSettingsForm data={formData} onUpdate={updateFormData} />
            </section>

            <hr className="border-zinc-800" />

            <section>
              <ClubPublishForm data={formData} onUpdate={updateFormData} />
            </section>
          </div>
        </div>
      </div>

      <ClubFormFooter
        onCancel={handleCancel}
        onCreate={handleCreate}
        isCreating={isCreating}
      />
    </div>
  );
}
