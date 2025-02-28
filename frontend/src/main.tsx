import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./App";
import { Suspense } from "react";

const container = document.getElementById("root");

const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <Suspense>
      <App />
    </Suspense>
  </React.StrictMode>,
);
