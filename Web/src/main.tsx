import { initInstruments, Sentry } from "./instrument";

// Initialize Sentry + PostHog before React boots so crashes during render are captured.
initInstruments();

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./infrastructure/i18n/i18n";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>An unexpected error occurred.</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>
);
