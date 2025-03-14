import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import "./tailwind.css";
import App from "./App";
import { ThemeProvider } from "@/components/theme-provider";

const container = document.getElementById("root");

const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
