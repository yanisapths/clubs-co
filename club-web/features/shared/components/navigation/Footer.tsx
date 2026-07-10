"use client";
import React from "react";
import { Logo } from "../Logo";
import { useAccountAuth } from "@/hooks/use-account-auth";

const FooterLink = ({
  href = "#",
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    style={{
      color: "#888",
      textDecoration: "none",
      fontSize: "14px",
      lineHeight: "2",
      transition: "color 0.15s",
      display: "block",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
    onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
  >
    {children}
  </a>
);

const FooterColumn = ({
  title,
  links,
}: {
  title: string;
  links: { label: string; href?: string }[];
}) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <p
      style={{
        fontSize: "13px",
        fontWeight: 500,
        color: "#fff",
        marginBottom: "12px",
        letterSpacing: "0.02em",
      }}
    >
      {title}
    </p>
    {links.map((link) => (
      <FooterLink key={link.label} href={link.href}>
        {link.label}
      </FooterLink>
    ))}
  </div>
);

export const Footer = () => {
  const { user } = useAccountAuth();
  return (
    <footer
      style={{
        backgroundColor: "#111",
        color: "#fff",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
      className="pb-6"
    >
      {/* Top divider */}
      <div style={{ borderTop: "0.5px solid #2a2a2a" }} />

      {/* Main footer content */}
      <div
        className="
          max-w-[1790px] mx-auto
          px-5 sm:px-8 lg:px-10
          py-10 sm:py-14 lg:py-[60px]
          pb-8 sm:pb-12 lg:pb-12
          grid grid-cols-1 lg:grid-cols-[1fr_auto]
          gap-8 sm:gap-12 lg:gap-16
          items-start
        "
      >
        {/* Brand */}
        <div className="flex flex-col justify-start gap-3 order-1">
          <Logo />
          <p style={{ fontSize: "13px", color: "#555" }}>
            © {new Date().getFullYear()} Clubspace. All rights reserved.
          </p>
        </div>

        {/* Nav columns */}
        <div
          className="
            order-2
            grid grid-cols-2 sm:grid-cols-4
            gap-x-6 gap-y-8 sm:gap-x-8 lg:gap-12
            w-full lg:w-auto
          "
        >
          <FooterColumn
            title="Explore"
            links={[
              { label: "Home", href: "/" },
              { label: "Discover clubs", href: "/club" },
              // { label: "Communities" },
              // { label: "Events" },
              //
            ]}
          />
          <FooterColumn
            title="Account"
            links={[
              { label: "Sign up", href: "/login" },
              { label: "Account settings", href: `${user.username}` },
              { label: "Creator studio", href: `${user.username}/studio/club` },
              { label: "Gudelines", href: "/guidelines" },
            ]}
          />
          <FooterColumn
            title="Legal"
            links={[
              { label: "Privacy policy" },
              { label: "Terms of service" },
              { label: "Cookie policy" },
              { label: "Community rules" },
            ]}
          />
          <FooterColumn
            title="Socials"
            links={[
              { label: "Instagram" },
              { label: "Twitter / X" },
              { label: "Facebook" },
              { label: "LinkedIn" },
            ]}
          />
        </div>

        {/* Large wordmark */}
        <div className="hidden sm:block order-3 leading-none select-none pointer-events-none lg:col-span-2">
          <p
            className="font-bold tracking-tighter m-0 bg-gradient-to-b from-[#111] to-[#2a2a2a] bg-clip-text text-transparent"
            style={{
              fontSize: "clamp(48px, 14vw, 160px)",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            Clubspace
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
