import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@ad-voice/ui/styles.css";
import "./app/app.css";
const root = document.getElementById("root");
if (!root) throw new Error("Не найден корневой контейнер #root");
createRoot(root).render(<StrictMode><App /></StrictMode>);
