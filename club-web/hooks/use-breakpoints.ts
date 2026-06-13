"use client";

import { useMediaQuery } from "react-responsive";

import { breakpoint } from "@/design-system/constants";

interface UseBreakpointsOptions {
  exact?: boolean;
}

export const useBreakpoints = (options?: UseBreakpointsOptions) => {
  const xs = useMediaQuery({
    query: mediaQuery.xs,
  });

  const sm = useMediaQuery({
    query: options?.exact ? mediaQueryExact.sm : mediaQuery.sm,
  });

  const md = useMediaQuery({
    query: options?.exact ? mediaQueryExact.md : mediaQuery.md,
  });

  const lg = useMediaQuery({
    query: options?.exact ? mediaQueryExact.lg : mediaQuery.lg,
  });

  const xl = useMediaQuery({
    query: mediaQuery.xl,
  });

  return {
    breakpoint,
    xs,
    sm,
    md,
    lg,
    xl,
  };
};

const mediaQuery = {
  xs: `(max-width: ${breakpoint.sm}px)`,
  sm: `(min-width: ${breakpoint.sm}px)`,
  md: `(min-width: ${breakpoint.md}px)`,
  lg: `(min-width: ${breakpoint.lg}px)`,
  xl: `(min-width: ${breakpoint.xl}px)`,
} as const;

const mediaQueryExact = {
  xs: `(max-width: ${breakpoint.sm}px)`,
  sm: `(min-width: ${breakpoint.sm}px) and (max-width: ${breakpoint.md}px)`,
  md: `(min-width: ${breakpoint.md}px) and (max-width: ${breakpoint.lg}px)`,
  lg: `(min-width: ${breakpoint.lg}px) and (max-width: ${breakpoint.xl}px)`,
  xl: `(min-width: ${breakpoint.xl}px)`,
} as const;
