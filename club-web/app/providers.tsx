"use client";

import { type ReactNode, Suspense, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOverflowDebugger } from "@/hooks/use-overflow-debugger";
import { SessionProvider } from "next-auth/react";
import { Toast } from "@heroui/react";

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
      <SessionProvider
        refetchOnWindowFocus={false}
        refetchWhenOffline={false}
        refetchInterval={0}
      >
        <Toast.Provider placement="top" />
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
