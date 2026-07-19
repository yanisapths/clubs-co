import type { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "Clubs | Creator Studio",
  description: "Create and customize your club on Meeteon.",
};

const RootLayout = ({ children }: Readonly<RootLayoutProps>) => {
  return <div>{children}</div>;
};

export default RootLayout;
