import { Logo } from "../Logo";
import Link from "next/link";
import { Button } from "@/design-system/components/button";

export const Header = () => {
  return (
    <header className="flex h-20 w-full p-6 justify-between bg-black">
      <Logo />
      <Link href="/login">
        <Button className="bg-white font-light text-black py-6 px-8 transition-colors duration-200 hover:border hover:border-white hover:text-white hover:bg-transparent">
          Login
        </Button>
      </Link>
    </header>
  );
};
