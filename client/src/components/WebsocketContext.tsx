import { createContext } from "react";
import { io, Socket } from "socket.io-client";

// TODO: Replace base url with env variable
export const socket = io("http://localhost:8080", {
  autoConnect: false,
});
export const WebsocketContext = createContext<Socket>(socket);
export const WebsocketProvider = WebsocketContext.Provider;
