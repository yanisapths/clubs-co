"use client";

import { ChangeEvent } from "react";
import { ClubFormData, ClubType, ClubVisibility } from "./types";
import { SpacesSection } from "./SpacesSection";
import { MAX_SEATS, MIN_SEATS } from "../constants";
import { Club } from "@/features/studio/api/club";
import { InfoIcon } from "lucide-react";
import { Tooltip } from "@/design-system/components/tooltip";

interface ClubSettingsFormProps {
  data: ClubFormData;
  onUpdate: (updates: Partial<ClubFormData>) => void;
  clubInfo?: Club;
}

export function ClubSettingsForm({
  data,
  onUpdate,
  clubInfo,
}: ClubSettingsFormProps) {
  const handleMaxSeatsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/[^0-9]/g, "");
    const value = raw === "" ? 0 : Math.min(MAX_SEATS, Number(raw));
    onUpdate({ maxSeats: value });
  };

  return (
    <div>
      <div>
        <h3 className="text-base font-semibold text-white">Club Type</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Public : Anyone can join a club instantly.
          <br />
          Private : Anyone can request to join a club.
          <br />
          Exclusive : Only invited member can join a club. (Coming soon)
        </p>
        <div className="relative mt-3">
          <select
            value={data.clubType}
            onChange={(event) =>
              onUpdate({ clubType: event.target.value as ClubType })
            }
            className="w-full appearance-none rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-base text-white outline-none focus:border-zinc-500"
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
            <option value="Exclusive" disabled>
              Exclusive (Coming soon)
            </option>
          </select>
          <ChevronDown />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          You won&apos;t be able to change a club type later.
        </p>
      </div>

      <div className="mt-8 opacity-40">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-white/50">Visibility</h3>
          <Tooltip content="This feature is unavailable">
            <InfoIcon size={14} className="text-white/50" />
          </Tooltip>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Anyone : Anyone can see contents in the club.
          <br />
          Club member only : Only club members can see contents in the club.
        </p>
        <div className="relative mt-3">
          <select
            disabled
            value={data.visibility}
            onChange={(event) =>
              onUpdate({ visibility: event.target.value as ClubVisibility })
            }
            className="w-full appearance-none rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-base text-white outline-none focus:border-zinc-500"
          >
            <option value="Anyone">Anyone</option>
            <option value="Club member only">Club member only</option>
          </select>
          <ChevronDown />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          You won&apos;t be able to change visibility later.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-base font-semibold text-white">Max seats</h3>
        <p className="mt-1 text-sm text-zinc-500">
          You can set at most maximum {MAX_SEATS} and minimum {MIN_SEATS}{" "}
          members to join a club.
        </p>
        <input
          type="text"
          inputMode="numeric"
          value={data.maxSeats}
          onChange={handleMaxSeatsChange}
          className="mt-3 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-base text-white outline-none focus:border-zinc-500"
        />
        {clubInfo?.memberCount && data.maxSeats < clubInfo?.memberCount && (
          <p className="text-red-500 mt-2 text-sm">
            Max seats cannot be less than number of members in the club.
          </p>
        )}
      </div>

      <div className="mt-8">
        <SpacesSection
          spaces={data.spaces}
          onChange={(spaces) => onUpdate({ spaces })}
        />
      </div>
    </div>
  );
}

function ChevronDown() {
  return (
    <svg
      className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}
