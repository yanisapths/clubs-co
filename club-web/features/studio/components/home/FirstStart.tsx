"use client";

import {
  Card,
  CardDivider,
  CardHeader,
  CardRow,
} from "@/features/shared/components/card/Card";
import { UserInfo } from "@/hooks/use-account-auth";
import { useModal } from "@/hooks/use-modal";
import { useRouter } from "next/navigation";
import { EditProfileModal, ProfileFormData } from "./profile/EditProfileModal";

interface FirstStart {
  user: UserInfo;
}

export function FirstStart({ user }: FirstStart) {
  const router = useRouter();
  const { show, visible, close } = useModal();
  const profileData: ProfileFormData = {
    displayName:
      user?.username || `${user?.firstName} ${user?.lastName}`.trim(),
    bio: "",
    avatarUrl: null,
    socialLinks: [],
  };
  const finished = true;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6 text-left">
      <Card>
        <CardHeader
          title="Welcome to Creator Studio"
          description="Let's set up your page and grow your communities."
        />

        <CardRow
          title="About you"
          description="Curate your profile stories."
          onClick={show}
        />

        <CardDivider />

        <CardRow
          title="Create a club"
          description="Become a founder of a club and invite members to join!"
          onClick={() => {
            if (!finished) {
              router.push(`/${user.username}/studio/club/create`);
            }
          }}
          finished
        />
      </Card>

      <Card>
        <CardHeader
          title="What's a Creator Studio?"
          description="Club creation Tips & Guideline"
        />

        <CardRow
          title="Everyone can has a club"
          description="Learn how clubs work and how members join."
        />
      </Card>

      {visible ? (
        <EditProfileModal
          initialData={profileData}
          username={user?.username}
          onSave={async (data, avatarFile) => {
            console.log(data);
            close();
          }}
          onClose={close}
        />
      ) : null}
    </div>
  );
}
