"use client";
import React from "react";
import { Logo } from "../Logo";

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
        style={{
          maxWidth: "1790px",
          margin: "0 auto",
          padding: "60px 40px 48px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "64px",
          alignItems: "start",
        }}
      >
        {/* Brand */}
        <div className="flex flex-col justify-start gap-3">
          <Logo />
          <p style={{ fontSize: "13px", color: "#555" }}>
            © {new Date().getFullYear()} Clubspace. All rights reserved.
          </p>
        </div>

        {/* Nav columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 140px)",
            gap: "48px",
          }}
        >
          <FooterColumn
            title="Explore"
            links={[
              { label: "Discover clubs" },
              { label: "Spaces" },
              { label: "Communities" },
              { label: "Events" },
              { label: "Members" },
            ]}
          />
          <FooterColumn
            title="Account"
            links={[
              { label: "Sign up" },
              { label: "Log in" },
              { label: "My clubs" },
              { label: "Settings" },
              { label: "Forgot password" },
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
        <div className="leading-none select-none pointer-events-none">
          <p
            className="font-bold tracking-tighter m-0 bg-gradient-to-b from-[#111] to-[#2a2a2a] bg-clip-text text-transparent"
            style={{
              fontSize: "clamp(64px, 12vw, 160px)",
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
