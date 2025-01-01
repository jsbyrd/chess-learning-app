import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router";

interface ListItemProps {
  className?: string;
  title: string;
  children: React.ReactNode;
  to: string;
}

const ListItem: React.FC<ListItemProps> = ({
  className,
  title,
  children,
  to,
}) => {
  return (
    <li>
      <NavLink
        to={to}
        className={cn(
          "block h-20 select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </NavLink>
    </li>
  );
};

export default ListItem;
