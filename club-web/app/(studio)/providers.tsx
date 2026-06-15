"use client";

import { Header } from "@/features/shared/components/navigation/Header";
import { DashboardLayout } from "@/features/studio/components/layout/DashboardLayout";
import { useNoScroll } from "@/hooks/use-no-scroll";
import { type ReactNode, Suspense } from "react";

interface ProvidersProps {
  children: ReactNode;
}

const ProvidersContent = ({ children }: Readonly<ProvidersProps>) => {
  // useNoScroll(true);

  return <DashboardLayout>{children}</DashboardLayout>;
};

const Providers = ({ children }: ProvidersProps) => {
  return (
    <Suspense>
      <ProvidersContent>{children}</ProvidersContent>
    </Suspense>
  );
};

export default Providers;
