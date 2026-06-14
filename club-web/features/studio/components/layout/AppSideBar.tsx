// AppSideBar.tsx
"use client";

import { cn } from "@/lib/utils";
import { Clock, FolderLock, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StudioLogo } from "../studio-logo";

const mainNavItems = [
  { title: "History", url: "/history", icon: Clock },
  { title: "Vault", url: "/vault", icon: FolderLock },
];

const bottomNavItems = [{ title: "Settings", url: "/", icon: Settings }];

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const NavItem = ({ item }: { item: (typeof mainNavItems)[0] }) => (
    <Link
      href={item.url}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "text-white/60 hover:bg-white/10 hover:text-white",
        isActive(item.url) && "text-white",
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      <span className="truncate opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {item.title}
      </span>
    </Link>
  );

  return (
    <aside
      className={cn(
        "group bg-[#1c1c1c] border-white/5 fixed left-0 top-0 z-50 flex h-screen w-16 flex-col border-r",
        "transition-[width] duration-300 ease-in-out hover:w-56",
        "overflow-hidden hover:overflow-visible",
      )}
    >
      <div className="flex items-center gap-2 px-3 py-4">
        <StudioLogo />
        <p className="truncate whitespace-nowrap text-lg font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Creator Studio
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {mainNavItems.map((item) => (
          <NavItem key={item.title} item={item} />
        ))}
      </nav>

      <nav className="border-sidebar-border space-y-1 px-3 py-4">
        {bottomNavItems.map((item) => (
          <NavItem key={item.title} item={item} />
        ))}
      </nav>
    </aside>
  );
}
