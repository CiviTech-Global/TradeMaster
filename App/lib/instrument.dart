import 'package:flutter/material.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:posthog_flutter/posthog_flutter.dart';

/// Initialize Sentry/GlitchTip and PostHog before running the app.
///
/// Set these in your environment/build config:
///   SENTRY_DSN
///   POSTHOG_API_KEY
///   POSTHOG_HOST
Future<void> initInstruments(Widget Function() appBuilder) async {
  const sentryDsn = String.fromEnvironment('SENTRY_DSN');
  const posthogKey = String.fromEnvironment('POSTHOG_API_KEY');
  const posthogHost = String.fromEnvironment(
    'POSTHOG_HOST',
    defaultValue: 'http://localhost:8001',
  );

  if (posthogKey.isNotEmpty) {
    final config = PostHogConfig(posthogKey);
    config.host = posthogHost;
    config.captureApplicationLifecycleEvents = true;
    await Posthog().setup(config);
    await Posthog().identify(userId: 'anonymous');
  }

  if (sentryDsn.isNotEmpty) {
    await SentryFlutter.init(
      (options) {
        options.dsn = sentryDsn;
        options.tracesSampleRate = 0.1;
        options.profilesSampleRate = 0.0;
        options.beforeSend = (SentryEvent event, Hint hint) {
          // Scrub PII before sending by replacing the user context
          return event.copyWith(
            user: event.user?.copyWith(
              email: null,
              ipAddress: null,
            ),
          );
        };
      },
      appRunner: appBuilder,
    );
  } else {
    runApp(appBuilder());
  }
}
