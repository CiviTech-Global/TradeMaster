/**
 * OpenTelemetry bootstrap for the TradeMaster server.
 * Must be imported and called before any other modules so auto-instrumentation
 * can hook Express, HTTP clients, PostgreSQL, etc.
 */

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { env } from "../config/env";

export function setupTelemetry(): NodeSDK | undefined {
  if (env.OTEL_ENABLED !== "true") {
    return undefined;
  }

  const endpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318";
  const serviceName = env.OTEL_SERVICE_NAME || "trademaster-server";
  const serviceVersion = process.env.npm_package_version || "1.0.0";

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
    "deployment.environment": env.NODE_ENV,
  });

  const sdk = new NodeSDK({
    resource,
    traceExporter: new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${endpoint}/v1/metrics`,
      }),
      exportIntervalMillis: 60000,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Reduce noise from high-volume or non-API paths
        "@opentelemetry/instrumentation-fs": { enabled: false },
        "@opentelemetry/instrumentation-http": {
          ignoreIncomingRequestHook: (req) => {
            const path = req.url || "";
            return path === "/health" || path === "/metrics" || path === "/favicon.ico";
          },
        },
      }),
    ],
  });

  sdk.start();

  return sdk;
}

export function shutdownTelemetry(sdk?: NodeSDK): Promise<void> {
  if (!sdk) return Promise.resolve();
  return sdk.shutdown();
}
