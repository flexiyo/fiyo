import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import ContextProviders from "./context/ContextProviders";
import App from "./App";
import { register } from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
    <ContextProviders>
      <App />
    </ContextProviders>
  // </React.StrictMode>,
);

register();