import React from "react";
import { buttonVariants } from "@/components/ui/button";
import { Navigation } from "./navigation";
import Link from "next/link";
import { ModeToggle } from "./theme-toggle";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-around h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {/* <div className="h-6 w-6 bg-foreground rounded-sm" /> */}
          <span className="font-bold">Practice Chess</span>
        </Link>

        {/* Main Navigation */}
        <Navigation />

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
            Login
          </Link>
          <Link
            href="/signup"
            className={buttonVariants({ variant: "default" })}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
