/**
 * Browser observability instrumentation.
 * Initialize Sentry/GlitchTip and PostHog before React starts.
 */

import * as Sentry from "@sentry/react";
import posthog from "posthog-js";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST as string | undefined;

export function initInstruments(): void {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      tracesSampleRate: parseFloat(
        (import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE as string) || "0.1"
      ),
      replaysSessionSampleRate: parseFloat(
        (import.meta.env.VITE_POSTHOG_REPLAY_SAMPLE_RATE as string) || "0.0"
      ),
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        // Scrub PII: never send email/phone in user context
        if (event.user) {
          delete event.user.email;
          delete event.user.phone;
        }
        return event;
      },
    });
  }

  if (POSTHOG_KEY && POSTHOG_HOST) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      loaded: (posthogInstance) => {
        // Link PostHog session to Sentry for replay-from-error workflow
        const sessionId = posthogInstance.get_session_id?.();
        if (sessionId && SENTRY_DSN) {
          Sentry.setTag("posthog_session_id", sessionId);
        }
      },
      // Autocapture is enabled by default and includes rage-click detection
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
    });
  }
}

export { Sentry, posthog };
