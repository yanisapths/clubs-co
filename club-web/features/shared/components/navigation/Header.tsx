"use client";

import { Logo } from "../Logo";
import Link from "next/link";
import { Button } from "@/design-system/components/button";
import { UserDropdown } from "./UserDropdown";
import { useAccountAuth } from "@/hooks/use-account-auth";

export const Header = () => {
  const { isLoggedIn } = useAccountAuth();

  return (
    <header className="flex h-20 w-full items-center justify-between bg-black p-6">
      <Logo />
      {isLoggedIn ? (
        <UserDropdown />
      ) : (
        <Link href="/login">
          <Button className="bg-white font-light text-black py-6 px-8 transition-colors duration-200 hover:border hover:border-white hover:text-white hover:bg-transparent">
            Login
          </Button>
        </Link>
      )}
    </header>
  );
};
