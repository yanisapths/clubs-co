"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getClubListPaginated, type MembershipClub } from "../api/club";
import { mapPaginatedClubsResponse, PaginatedClubsResponse } from "./use-club";
import { getClubByCategorySlug } from "./use-infinite-clubs-by-category";

interface UseInfiniteClubsOptions {
  pageSize?: number;
}

interface UseInfiniteClubsResult {
  clubs: MembershipClub[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  sentinelRef: (node: HTMLDivElement | null) => void;
}

export function useInfiniteClubs(
  categorySlug: string | undefined,
  options: UseInfiniteClubsOptions = {},
): UseInfiniteClubsResult {
  const { pageSize = 12 } = options;

  const [clubs, setClubs] = useState<MembershipClub[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cursorRef = useRef(0);
  const loadingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadPage = useCallback(
    async (isFirstPage: boolean) => {
      if (loadingRef.current) return;

      loadingRef.current = true;

      await Promise.resolve();

      if (isFirstPage) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = categorySlug
          ? await getClubByCategorySlug({
              categorySlug,
              cursor: isFirstPage ? 0 : cursorRef.current,
              limit: pageSize,
            })
          : await getClubList({
              cursor: isFirstPage ? 0 : cursorRef.current,
              limit: pageSize,
            });

        setClubs((prev) =>
          isFirstPage ? result.clubs : [...prev, ...result.clubs],
        );

        setHasMore(result.hasMore);
        cursorRef.current = result.nextCursor ?? cursorRef.current;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load clubs"),
        );
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [categorySlug, pageSize],
  );

  useEffect(() => {
    cursorRef.current = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on categorySlug change
    loadPage(true);
  }, [categorySlug, loadPage]);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
            loadPage(false);
          }
        },
        { rootMargin: "400px" },
      );
      observerRef.current.observe(node);
    },
    [hasMore, loadPage],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { clubs, isLoading, isLoadingMore, hasMore, error, sentinelRef };
}

export interface GetClubsParams {
  cursor?: number;
  limit?: number;
}

export async function getClubList({
  cursor = 0,
  limit = 12,
}: GetClubsParams): Promise<PaginatedClubsResponse> {
  const response = await getClubListPaginated({
    limit,
    offset: cursor,
  });

  return mapPaginatedClubsResponse(response.data);
}
