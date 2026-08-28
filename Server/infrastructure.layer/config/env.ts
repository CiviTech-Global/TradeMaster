import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function generateSecureSecret(): string {
  return crypto.randomBytes(64).toString("hex");
}

const isProduction = process.env.NODE_ENV === "production";

// In production, secrets MUST come from env vars. In dev, we generate them if missing.
const jwtSecret = isProduction
  ? requireEnv("JWT_SECRET")
  : process.env.JWT_SECRET || generateSecureSecret();

const jwtRefreshSecret = isProduction
  ? requireEnv("JWT_REFRESH_SECRET")
  : process.env.JWT_REFRESH_SECRET || generateSecureSecret();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || process.env.BACKEND_PORT || "3000", 10),
  HOST: process.env.HOST || "0.0.0.0",

  // Database
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT || "5432", 10),
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: requireEnv("DB_PASSWORD", isProduction ? undefined : "postgres"),
  DB_NAME: process.env.DB_NAME || "trademaster",

  // JWT
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET: jwtRefreshSecret,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  // Uploads
  UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10), // 5MB

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "5000", 10), // general API limit per window
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || "100", 10), // auth endpoints limit per window

  // Observability
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_DB_QUERIES: process.env.LOG_DB_QUERIES === "true",

  // OpenTelemetry
  OTEL_ENABLED: process.env.OTEL_ENABLED || "false",
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318",
  OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME || "trademaster-server",

  // Error tracking (GlitchTip / Sentry)
  SENTRY_DSN: process.env.SENTRY_DSN || "",
  SENTRY_TRACES_SAMPLE_RATE: process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1",
  SENTRY_PROFILES_SAMPLE_RATE: process.env.SENTRY_PROFILES_SAMPLE_RATE || "0.0",
} as const;
