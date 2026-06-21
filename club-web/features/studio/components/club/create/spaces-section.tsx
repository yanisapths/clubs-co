"use client";

import { useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { ClubSpace } from "./types";
import { MAX_SPACES } from "../constants";

interface SpacesSectionProps {
  spaces: ClubSpace[];
  onChange: (spaces: ClubSpace[]) => void;
}

export function SpacesSection({ spaces, onChange }: SpacesSectionProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");

  const canAddMore = spaces.length < MAX_SPACES;

  const addSpace = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setIsSearching(false);
      return;
    }
    if (spaces.length < MAX_SPACES) {
      onChange([...spaces, { id: crypto.randomUUID(), name: trimmed }]);
    }
    setQuery("");
    setIsSearching(false);
  };

  const removeSpace = (id: string) => {
    onChange(spaces.filter((space) => space.id !== id));
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-white">Spaces</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Locations that a club is primary active. Maximum {MAX_SPACES} spaces can
        be added.
      </p>

      {spaces.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {spaces.map((space) => (
            <span
              key={space.id}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-200"
            >
              {space.name}
              <button
                type="button"
                onClick={() => removeSpace(space.id)}
                aria-label={`Remove ${space.name}`}
                className="text-zinc-500 transition-colors hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        {isSearching ? (
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onBlur={addSpace}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addSpace();
                }
                if (event.key === "Escape") {
                  setQuery("");
                  setIsSearching(false);
                }
              }}
              placeholder="Search a space"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsSearching(true)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600"
          >
            Search a space
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsSearching(true)}
          disabled={!canAddMore}
          aria-label="Add a space"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-200 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
