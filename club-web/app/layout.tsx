import type { Viewport } from "next";
import type { ReactNode } from "react";

import { GlobalStyle } from "@/design-system/styles";

import "./globals.css";
import Providers from "./providers";
import { poppins, sulphurPoint } from "@/design-system/constants/fonts";
interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "Explore | Meeteon",
  description:
    "The place to grow communities and share passion in spaces where people connect.",
};

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

      <body
        className={`${sulphurPoint.variable} ${poppins.variable} antialiased flex min-h-screen flex-col overflow-y-auto overflow-x-hidden bg-black text-white font-poppins`}
      >
        <GlobalStyle />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
