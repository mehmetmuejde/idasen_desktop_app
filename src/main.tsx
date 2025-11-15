import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { applySecurityUIRestrictions } from "./secure-ui";

import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "./index.css";

applySecurityUIRestrictions();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider>
      <App />
    </MantineProvider>
  </React.StrictMode>
);
