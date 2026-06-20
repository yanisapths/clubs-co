"use client";

import { ToastProvider } from "@heroui/toast";
import { type ReactNode, Suspense, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOverflowDebugger } from "@/hooks/use-overflow-debugger";
import { SessionProvider } from "next-auth/react";

interface ProvidersProps {
  children: ReactNode;
}

const ProvidersContent = ({ children }: Readonly<ProvidersProps>) => {
  useOverflowDebugger();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchInterval: false,
            refetchIntervalInBackground: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider
        placement="top-center"
        toastProps={{
          classNames: {
            base: "group relative",
            closeButton:
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-2 top-2",
          },
          closeIcon: (
            <svg
              fill="none"
              height="32"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="32"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ),
        }}
      />
      <SessionProvider
        refetchOnWindowFocus={false}
        refetchWhenOffline={false}
        refetchInterval={0}
      >
        {children}
      </SessionProvider>
    </QueryClientProvider>
  );
};

const Providers = ({ children }: ProvidersProps) => {
  return (
    <Suspense>
      <ProvidersContent>{children}</ProvidersContent>
    </Suspense>
  );
};

export default Providers;
