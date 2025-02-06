import { WebsocketContext } from "@/components/WebSocketContext";
import { useContext, useEffect } from "react";
import { Outlet } from "react-router";

const GameLayout = () => {
  const socket = useContext(WebsocketContext);

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
