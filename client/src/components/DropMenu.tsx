import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser } from "./UserProvider/use-user-hook";
import { LogOut, Settings, User } from "lucide-react";
import customAxios from "@/api/custom-axios";
import { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";

const DropMenu = () => {
  const { username, handleLogout } = useUser();

  const handleLogoutPress = async () => {
    try {
      await customAxios.post("/auth/logout");
      toast({
        title: "Successful logout",
        description: `You have logged out of ${username}, goodbye 😞`,
      });
      handleLogout();
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        toast({
          title: `Error Code ${error.status} (${error.response?.data?.error})`,
          description: `${
            error.response?.data?.message ??
            "Something went wrong, please try again later."
          }`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error: Unable to log out",
          description:
            "There was an issue when trying to log out. Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="ml-4 hover:cursor-pointer">
          <AvatarImage src="/default_pfp.svg" alt="default profile picture" />
          <AvatarFallback>{username.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Settings />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogoutPress}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropMenu;
