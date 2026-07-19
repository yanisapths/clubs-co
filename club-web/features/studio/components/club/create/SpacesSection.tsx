/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { Meeteon } from "./types";
import { MAX_SPACES } from "../constants";
import { SearchSpace } from "@/features/shared/api/api";

interface SpacesSectionProps {
  spaces: Meeteon[];
  onChange: (spaces: Meeteon[]) => void;
  query: string;
  onQueryChange: (value: string) => void;
  searchResults: SearchSpace[];
  isLoading: boolean;
}

type SpaceOption =
  | { kind: "existing"; space: SearchSpace }
  | { kind: "create"; name: string };

function newLocalId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `new-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function SpacesSection({
  spaces,
  query,
  onChange,
  onQueryChange,
  searchResults,
  isLoading,
}: SpacesSectionProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const canAddMore = spaces.length < MAX_SPACES;
  const trimmedQuery = query.trim();

  const hasExactMatch = searchResults.some(
    (space) => space.name.toLowerCase() === trimmedQuery.toLowerCase(),
  );
  const canCreateFromQuery =
    trimmedQuery.length > 0 && !hasExactMatch && !isLoading;

  const options: SpaceOption[] = [
    ...searchResults.map((space): SpaceOption => ({ kind: "existing", space })),
    ...(canCreateFromQuery
      ? [{ kind: "create", name: trimmedQuery } as SpaceOption]
      : []),
  ];

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, searchResults.length, canCreateFromQuery]);

  const removeSpace = (id: string) => {
    onChange(spaces.filter((space) => space.id !== id));
  };

  const addSpace = (space: { id: string; name: string; isNew?: boolean }) => {
    if (spaces.length >= MAX_SPACES) return;
    onChange([
      ...spaces,
      { id: space.id, name: space.name, isNew: space.isNew },
    ]);
    onQueryChange("");
    setIsSearching(false);
  };

  const selectOption = (option: SpaceOption) => {
    if (option.kind === "existing") {
      addSpace({ id: String(option.space.id), name: option.space.name });
    } else {
      addSpace({ id: newLocalId(), name: option.name, isNew: true });
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (options.length === 0) return;
      setHighlightedIndex((i) => (i + 1) % options.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (options.length === 0) return;
      setHighlightedIndex((i) => (i - 1 + options.length) % options.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = options[highlightedIndex];
      if (option && canAddMore) {
        selectOption(option);
      }
      return;
    }

    if (event.key === "Escape") {
      onQueryChange("");
      setIsSearching(false);
    }
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
                className="cursor-pointer text-zinc-500 transition-colors hover:text-zinc-200"
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
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              autoFocus
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search a space"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
            />
            {isSearching && trimmedQuery && (
              <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900">
                {isLoading ? (
                  <div className="p-3 text-sm text-zinc-400">Searching...</div>
                ) : options.length === 0 ? (
                  <div className="p-3 text-sm text-zinc-400">
                    No spaces found
                  </div>
                ) : (
                  options.map((option, index) => {
                    const isHighlighted = index === highlightedIndex;
                    const label =
                      option.kind === "existing"
                        ? option.space.name
                        : `Add "${option.name}" as new space`;
                    const key =
                      option.kind === "existing"
                        ? option.space.id
                        : "create-option";

                    return (
                      <button
                        key={key}
                        type="button"
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onMouseDown={() => selectOption(option)}
                        className={`block w-full cursor-pointer px-4 py-3 text-left text-sm hover:bg-zinc-800 ${
                          isHighlighted ? "bg-zinc-800" : ""
                        } ${
                          option.kind === "create"
                            ? "text-zinc-400 italic"
                            : "text-white"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsSearching(true)}
            disabled={!canAddMore}
            className="cursor-pointer rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
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
