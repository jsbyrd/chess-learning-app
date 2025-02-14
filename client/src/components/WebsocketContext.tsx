import { createContext } from "react";
import { io, Socket } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_BASE_URL, {
  autoConnect: false,
});
export const WebsocketContext = createContext<Socket>(socket);
export const WebsocketProvider = WebsocketContext.Provider;
