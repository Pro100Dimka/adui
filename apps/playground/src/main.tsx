import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@neo-ui-kit/react/styles.css";
import "./app/app.css";
const root = document.getElementById("root");
if (!root) throw new Error("Не найден корневой контейнер #root");
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
