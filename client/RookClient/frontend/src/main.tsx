// client/RookClient/frontend/src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

/**
 * Punto de arranque del frontend (Vite + React).
 * @remarks
 * Monta la SPA en #root y envuelve en React.StrictMode para advertencias
 * de desarrollo sin afectar producción.
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
