import { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: Readonly<RootLayoutProps>) => {
  return (
    <div className="flex flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col  h-full w-screen pt-16">{children}</div>
    </div>
  );
};

export default RootLayout;
