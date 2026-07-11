"use client";

import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Check, Loader2 } from "lucide-react";
import { ClubFormData } from "./types";
import { TagInput } from "./TagInput";
import { categories } from "@/features/shared/constants";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { checkClubExist, Club } from "@/features/studio/api/club";
import { getStoredToken } from "@/lib/storage";

interface ClubBasicInfoFormProps {
  data: ClubFormData;
  onUpdate: (updates: Partial<ClubFormData>) => void;
  isEdit?: boolean;
  originalName?: string;
  setIsNameExist: Dispatch<SetStateAction<boolean>>;
}

const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 250;
const NAME_CHECK_DEBOUNCE_MS = 400;

type NameCheckResult = {
  name: string;
  status: "available" | "taken" | "error";
};

export function ClubBasicInfoForm({
  data,
  onUpdate,
  isEdit = false,
  originalName,
  setIsNameExist,
}: ClubBasicInfoFormProps) {
  const trimmedName = data.name.trim();
  const debouncedName = useDebouncedValue(trimmedName, NAME_CHECK_DEBOUNCE_MS);

  const skipCheck =
    !debouncedName ||
    (isEdit && !!originalName && debouncedName === originalName.trim());

  const [result, setResult] = useState<NameCheckResult | null>(null);

  useEffect(() => {
    if (skipCheck) return;

    let cancelled = false;

    checkClubExist({ name: debouncedName, token: getStoredToken()! })
      .then((exists) => {
        if (cancelled) return;
        if (exists) {
          setIsNameExist(true);
        } else {
          setIsNameExist(false);
        }
        setResult({
          name: debouncedName,
          status: exists ? "taken" : "available",
        });
      })
      .catch(() => {
        if (cancelled) return;
        setResult({ name: debouncedName, status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedName, skipCheck]);

  const nameStatus: "idle" | "checking" | "available" | "taken" | "error" =
    skipCheck
      ? "idle"
      : result && result.name === debouncedName
        ? result.status
        : "checking";

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    onUpdate({ name: event.target.value.slice(0, NAME_MAX_LENGTH) });
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      description: event.target.value.slice(0, DESCRIPTION_MAX_LENGTH),
    });
  };

  const showChecking = nameStatus === "checking";
  const showAvailable = nameStatus === "available";
  const showTaken = nameStatus === "taken";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">
        {isEdit ? "Edit your club" : "Start with your club"}
      </h1>
      <p className="mt-1 text-base text-zinc-400">
        {isEdit ? null : "Create a club where people can share commons."}
      </p>

      <div className="mt-6">
        <label
          htmlFor="club-name"
          className="text-base font-semibold text-white"
        >
          Name<span className="text-red-500">*</span>
        </label>
        <div className="relative mt-3">
          <input
            id="club-name"
            type="text"
            value={data.name}
            onChange={handleNameChange}
            placeholder="Add a club name"
            aria-invalid={showTaken}
            className={`w-full rounded-2xl border bg-zinc-900 px-5 py-4 pr-12 text-base text-white placeholder-zinc-500 outline-none focus:border-zinc-500 ${
              showTaken
                ? "border-red-500"
                : showAvailable
                  ? "border-green-500"
                  : "border-zinc-700"
            }`}
          />

          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            {showChecking && (
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            )}
            {showAvailable && <Check className="h-5 w-5 text-green-500" />}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm">
          <span className={showTaken ? "text-red-500" : "text-zinc-500"}>
            {showTaken
              ? "This club name is already in use."
              : "This is your club name. It can be changed later."}
          </span>
          <span className="font-mono text-zinc-500">
            {data.name.length}/{NAME_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="club-description"
          className="text-base font-semibold text-white"
        >
          Description<span className="text-red-500">*</span>
        </label>
        <textarea
          id="club-description"
          value={data.description}
          onChange={handleDescriptionChange}
          placeholder="Add a club description"
          rows={3}
          className="mt-3 w-full resize-none rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-base text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
        />
        <div className="mt-2 flex items-center justify-end text-sm text-zinc-500">
          <span className="font-mono">
            {data.description.length}/{DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="club-category"
          className="text-base font-semibold text-white"
        >
          Category
        </label>
        <div className="relative mt-3">
          <select
            id="club-category"
            value={data.category ?? ""}
            onChange={(event) =>
              onUpdate({ category: Number(event.target.value) })
            }
            className="w-full appearance-none rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-base text-white outline-none focus:border-zinc-500"
          >
            <option value="" disabled className="text-zinc-500">
              Select category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 9l6 6 6-6"
            />
          </svg>
        </div>
      </div>

      <div className="mt-4">
        <TagInput tags={data.tags} onChange={(tags) => onUpdate({ tags })} />
      </div>
    </div>
  );
}
