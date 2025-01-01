import { buttonVariants } from "@/components/ui/button";
import { NavLink } from "react-router";
import { ModeToggle } from "./ModeToggle";
import Navigation from "./navigation/Navigation";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-around h-14">
        {/* Logo */}
        <NavLink to="/" className="flex items-center space-x-2">
          {/* <div className="h-6 w-6 bg-foreground rounded-sm" /> */}
          <span className="font-bold">Practice Chess</span>
        </NavLink>

        {/* Main Navigation */}
        <Navigation />

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <NavLink to="/login" className={buttonVariants({ variant: "ghost" })}>
            Login
          </NavLink>
          <NavLink
            to="/signup"
            className={buttonVariants({ variant: "default" })}
          >
            Sign Up
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default Header;
