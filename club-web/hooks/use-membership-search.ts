// club-web/hooks/use-membership-search.ts
"use client";

import { useEffect, useRef, useState } from "react";
import {
  searchMembership,
  type SearchResponse,
} from "@/features/shared/api/api";

const EMPTY_RESULT: SearchResponse = {
  clubs: [],
  members: [],
  spaces: [],
  categories: [],
};

interface UseMembershipSearchOptions {
  debounceMs?: number;
  /** Skip fetching until the trimmed query reaches this length. Default 0 (always fetch, browsing defaults on empty query). */
  minLength?: number;
  enabled?: boolean;
  limit?: number;
  offset?: number;
}

interface UseMembershipSearchResult {
  data: SearchResponse;
  isLoading: boolean;
  error: Error | null;
}

export function useMembershipSearch(
  query: string,
  options: UseMembershipSearchOptions = {},
): UseMembershipSearchResult {
  const {
    debounceMs = 300,
    minLength = 0,
    enabled = true,
    limit,
    offset,
  } = options;

  const [data, setData] = useState<SearchResponse>(EMPTY_RESULT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect((): (() => void) | void => {
    if (!enabled) {
      return;
    }

    const trimmed: string = query.trim();

    const timeout: ReturnType<typeof setTimeout> = setTimeout((): void => {
      if (trimmed.length < minLength) {
        setData(EMPTY_RESULT);
        setIsLoading(false);
        setError(null);
        return;
      }

      abortRef.current?.abort();
      const controller: AbortController = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);

      searchMembership(trimmed, controller.signal, { limit, offset })
        .then((result: SearchResponse): void => {
          setData(result);
          setIsLoading(false);
        })
        .catch((err: unknown): void => {
          if (err instanceof DOMException && err.name === "AbortError") {
            return;
          }
          setError(err instanceof Error ? err : new Error("Search failed"));
          setIsLoading(false);
        });
    }, debounceMs);

    return (): void => {
      clearTimeout(timeout);
    };
  }, [query, debounceMs, minLength, enabled]);

  // Also abort any in-flight request on unmount.
  useEffect((): (() => void) => {
    return (): void => {
      abortRef.current?.abort();
    };
  }, []);

  return { data, isLoading, error };
}
