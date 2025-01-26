import customAxios from "@/api/custom-axios";
import { toast } from "@/hooks/use-toast";
import { createContext, ReactNode, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";

export interface User {
  username: string;
  isLoggedIn: boolean;
  handleLogin: (username: string) => void;
  handleLogout: () => void;
}

export const UserContext = createContext<User | undefined>(undefined);

// Function to generate a random username
// const generateRandomUsername = (length: number) => {
//   const chars =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let result = "*USER";
//   for (let i = 5; i < length; i++) {
//     result += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return result;
// };

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchUserInfo = async () => {
    try {
      const res = await customAxios.get("/users/");
      setUsername(res.data.username);
      setIsLoggedIn(true);
      console.log("logged into " + res.data.username);
    } catch (err) {
      setIsLoggedIn(false);
    }
  };

  // Log in user and refresh access token when refresh token is still valid
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleLogin = (username: string) => {
    setUsername(username);
    setIsLoggedIn(true);
    toast({
      title: "Login successful",
      description: `Welcome back, ${username}`,
    });
    navigate("/");
  };

  const handleLogout = () => {
    setUsername("");
    setIsLoggedIn(false);
    navigate("/"); // Currently too lazy to check whether or not user is in protected page
  };

  const value = useMemo(
    () => ({ username, isLoggedIn, handleLogin, handleLogout }),
    [username, isLoggedIn, handleLogin, handleLogout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
