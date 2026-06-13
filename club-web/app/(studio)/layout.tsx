"use client";
import { DashboardLayout } from "@/features/studio/components/layout/DashboardLayout";
import { useNoScroll } from "@/hooks/use-no-scroll";
import { ReactNode } from "react";

interface providersProps {
  children: ReactNode;
}

const Layout = ({ children }: providersProps) => {
  useNoScroll(true);

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default Layout;
