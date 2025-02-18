// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import Router from "./Router.tsx";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import "./index.css";
import { Toaster } from "./components/ui/toaster.tsx";
import { UserProvider } from "./components/UserProvider/UserProvider.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <BrowserRouter>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <UserProvider>
        <Router />
        <Toaster />
      </UserProvider>
    </ThemeProvider>
  </BrowserRouter>
  // </StrictMode>
);
