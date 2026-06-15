"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { MAX_TAGS } from "./types";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [value, setValue] = useState("");

  const canAddMore = tags.length < MAX_TAGS;

  const commitTag = () => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < MAX_TAGS) {
      onChange([...tags, trimmed]);
    }
    setValue("");
    setIsAdding(false);
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-white">Tags</h3>
      <p className="mt-1 text-sm text-zinc-500">
        A tag helps people find related ideas about your club easier. Maximum{" "}
        {MAX_TAGS} tags can be added.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag} tag`}
              className="text-zinc-500 transition-colors hover:text-zinc-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}

        {isAdding ? (
          <input
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={commitTag}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitTag();
              }
              if (event.key === "Escape") {
                setValue("");
                setIsAdding(false);
              }
            }}
            placeholder="Type a tag and press Enter"
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            disabled={!canAddMore}
            className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add a tag
            <span className="cursor-pointer flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800">
              <Plus className="h-3.5 w-3.5" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
