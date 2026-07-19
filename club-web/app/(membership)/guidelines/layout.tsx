import { Metadata } from "next";
import { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "Guidelines | Meeteon",
  description: "Practical guides for using Meeteon effectively",
};

const RootLayout = ({ children }: Readonly<RootLayoutProps>) => {
  return (
    <div className="flex flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col h-full w-screen pt-16">{children}</div>
    </div>
  );
};

export default RootLayout;
