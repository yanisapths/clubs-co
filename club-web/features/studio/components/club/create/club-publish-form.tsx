"use client";

import { ClubFormData } from "./types";
import { ToggleSwitch } from "./toggle-switch";

interface ClubPublishFormProps {
  data: ClubFormData;
  onUpdate: (updates: Partial<ClubFormData>) => void;
}

export function ClubPublishForm({ data, onUpdate }: ClubPublishFormProps) {
  return (
    <div>
      <div>
        <h3 className="text-base font-semibold text-white">Social Links</h3>
        <button
          type="button"
          className="mt-3 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-left text-base text-zinc-300 transition-colors hover:border-zinc-600"
        >
          Connect to your social accounts
        </button>
      </div>

      <div className="mt-8 flex items-start justify-between gap-6">
        <div>
          <h3 className="text-base font-semibold text-white">Followers</h3>
          <p className="mt-1 text-sm text-zinc-500">
            When a club member is full. Allow other to follow a club.
            <br />
            Followers can only see contents with no further actions. Disable to
            not allow followers.
          </p>
        </div>
        <ToggleSwitch
          checked={data.allowFollowers}
          onChange={(checked) => onUpdate({ allowFollowers: checked })}
          label="Allow followers"
        />
      </div>

      <div className="mt-8 flex items-start justify-between gap-6">
        <div>
          <h3 className="text-base font-semibold text-white">Activate</h3>
          <p className="mt-1 text-sm text-zinc-500">
            This club is ready to be exposed. Turn on to active a club.
          </p>
        </div>
        <ToggleSwitch
          checked={data.activate}
          onChange={(checked) => onUpdate({ activate: checked })}
          label="Activate club"
        />
      </div>
    </div>
  );
}
