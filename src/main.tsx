import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { applySecurityUIRestrictions } from "./secure-ui";

import "./index.css";

applySecurityUIRestrictions();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
