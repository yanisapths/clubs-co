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
import {
  EditProfileModal,
  ProfileFormData,
  ProfileSaveData,
} from "./profile/EditProfileModal";
import { ProfileClub } from "../../api/profile";
interface FirstStart {
  user: UserInfo;
  profileData: ProfileFormData;
  onSave: (data: ProfileSaveData) => Promise<void>;
  clubFounded: number;
  hasSetUpProfile: boolean;
}

export function FirstStart({
  user,
  profileData,
  onSave,
  clubFounded,
  hasSetUpProfile,
}: FirstStart) {
  const router = useRouter();
  const { show, visible, close } = useModal();
  const clubFinished = clubFounded > 0;

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
          finished={hasSetUpProfile}
        />

        <CardDivider />

        <CardRow
          title="Create a club"
          description="Become a founder of a club and invite members to join!"
          onClick={() => {
            if (!clubFinished) {
              router.push(`/${user.username}/studio/club/create`);
            }
          }}
          finished={clubFinished}
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
          onSave={onSave}
          onClose={close}
        />
      ) : null}
    </div>
  );
}
