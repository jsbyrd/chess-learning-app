import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import Router from "./Router.tsx";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
