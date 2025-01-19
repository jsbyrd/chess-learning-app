import { buttonVariants } from "@/components/ui/button";
import { NavLink } from "react-router";
import { ModeToggle } from "./ModeToggle";
import Navigation from "./navigation/Navigation";
import MobileNavigation from "./navigation/MobileNavigation";
import { useUser } from "./UserProvider/use-user-hook";
import { useMemo } from "react";
import DropMenu from "./DropMenu";

const Header = () => {
  const { email, isLoggedIn } = useUser();

  const rightSideHeader = useMemo(() => {
    return isLoggedIn ? (
      <DropMenu />
    ) : (
      <>
        <NavLink to="/login" className={buttonVariants({ variant: "ghost" })}>
          Login
        </NavLink>
        <NavLink
          to="/register"
          className={buttonVariants({ variant: "default" })}
        >
          Sign Up
        </NavLink>
      </>
    );
  }, [isLoggedIn, email]);

  return (
    <header className="sticky flex justify-between md:justify-around h-14 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Logo */}
      <NavLink to="/" className="hidden md:flex items-center space-x-2">
        {/* <div className="h-6 w-6 bg-foreground rounded-sm" /> */}
        <span className="font-bold">Practice Chess</span>
      </NavLink>

      {/* Main Navigation */}
      <Navigation />
      <MobileNavigation />

      {/* Right side actions */}
      <div className="flex items-center gap-4 px-4">
        <ModeToggle />
        {/* <NavLink to="/login" className={buttonVariants({ variant: "ghost" })}>
          Login
        </NavLink>
        <NavLink
          to="/register"
          className={buttonVariants({ variant: "default" })}
        >
          Sign Up
        </NavLink> */}
        {rightSideHeader}
      </div>
    </header>
  );
};

export default Header;
