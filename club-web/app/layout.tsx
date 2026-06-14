import type { Viewport } from "next";
import type { ReactNode } from "react";

import { GlobalStyle } from "@/design-system/styles";

import "./globals.css";
import Providers from "./providers";
interface RootLayoutProps {
  children: ReactNode;
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const RootLayout = ({ children }: Readonly<RootLayoutProps>) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>

      <body className="flex min-h-screen flex-col overflow-y-auto overflow-x-hidden bg-black font-sans text-white">
        <GlobalStyle />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
