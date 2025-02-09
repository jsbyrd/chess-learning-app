import { useUser } from "@/components/UserProvider/use-user-hook";
import { WebsocketContext } from "@/components/WebsocketContext";
import { toast } from "@/hooks/use-toast";
import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

const GameLayout = () => {
  const { isLoggedIn } = useUser();
  const navigate = useNavigate();
  const socket = useContext(WebsocketContext);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      toast({
        title: "Error",
        variant: "destructive",
        description: "You must be logged in to play games.",
      });
    }
  }, []);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      console.log("Connected");
    });

    return () => {
      socket.off("connect");
      socket.disconnect();
    };
  }, []);

  return <Outlet context={socket} />;
};

export default GameLayout;
