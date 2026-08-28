/**
 * Sentry/GlitchTip initialization for server-side error tracking.
 * GlitchTip is a Sentry-compatible self-hosted alternative.
 */

import * as Sentry from "@sentry/node";
import { env } from "../config/env";

export function initSentry(): void {
  if (!env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    release: process.env.npm_package_version,
    tracesSampleRate: parseFloat(env.SENTRY_TRACES_SAMPLE_RATE || "0.1"),
    profilesSampleRate: parseFloat(env.SENTRY_PROFILES_SAMPLE_RATE || "0.0"),
    beforeSend(event) {
      // Scrub PII from tags and user context
      if (event.user) {
        delete event.user.email;
        delete event.user.phone;
      }
      return event;
    },
  });
}

export { Sentry };
