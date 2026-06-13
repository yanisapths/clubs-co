import type { Viewport } from "next";
import type { ReactNode } from "react";

import { GlobalStyle } from "@/design-system/styles";

import "./globals.css";
import Providers from "./providers";
import { Header } from "@/features/shared/components/navigation/Header";
import { Footer } from "@/features/shared/components/navigation/Footer";

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

        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
