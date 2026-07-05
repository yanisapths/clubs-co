"use client";

import { Logo } from "../Logo";
import Link from "next/link";
import { Button } from "@/design-system/components/button";
import { UserDropdown } from "./UserDropdown";
import { useAccountAuth } from "@/hooks/use-account-auth";

export const Header = () => {
  const { isLoggedIn } = useAccountAuth();

  return (
    <header className="relative bg-black h-20 py-6">
      <div className="absolute z-50 flex mx-auto w-full px-6 inset-x-0 items-center justify-between">
        <Logo />
        {isLoggedIn ? (
          <UserDropdown />
        ) : (
          <Link href="/login">
            <Button className="bg-white text-black py-5.5 px-6 transition-colors duration-200 hover:border hover:border-white/20 hover:text-white hover:bg-white/10">
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};
