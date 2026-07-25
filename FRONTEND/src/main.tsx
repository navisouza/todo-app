import { Provider } from "@/components/ui/provider";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { Toaster } from "@/components/ui/toaster";
import { AccentThemeProvider } from "./contexts/AccentThemeProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider>
      <AccentThemeProvider>
        <App />
        <Toaster />
      </AccentThemeProvider>
    </Provider>
  </React.StrictMode>,
);
