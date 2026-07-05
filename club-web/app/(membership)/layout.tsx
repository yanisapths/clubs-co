import type { ReactNode } from "react";
import { Footer } from "@/features/shared/components/navigation/Footer";
import { Header } from "@/features/shared/components/navigation/Header";

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: Readonly<RootLayoutProps>) => {
  return (
    <div className="relative">
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default RootLayout;
