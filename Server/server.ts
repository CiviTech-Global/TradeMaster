import "reflect-metadata";
import { setupTelemetry, shutdownTelemetry } from "./infrastructure.layer/utils/telemetry";
const telemetrySdk = setupTelemetry();
import { initSentry, Sentry } from "./infrastructure.layer/utils/sentry";
initSentry();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "./infrastructure.layer/config/env";
import {
  initializeDatabase,
  closeDatabase,
} from "./infrastructure.layer/database";
import userRoutes from "./presentation.layer/routes/user.route";
import authRoutes from "./presentation.layer/routes/auth.route";
import businessRoutes from "./presentation.layer/routes/business.route";
import categoryRoutes from "./presentation.layer/routes/category.route";
import uploadRoutes from "./presentation.layer/routes/upload.route";
// [DISABLED] Products not shown in business directory mode
// import productRoutes from "./presentation.layer/routes/product.route";
import searchRoutes from "./presentation.layer/routes/search.route";
// [DISABLED] Orders not shown in business directory mode
// import orderRoutes from "./presentation.layer/routes/order.route";
// [DISABLED] Messaging not shown in business directory mode
// import messageRoutes from "./presentation.layer/routes/message.route";
import reviewRoutes from "./presentation.layer/routes/review.route";
import devRoutes from "./presentation.layer/routes/dev.route";
import auditRoutes from "./presentation.layer/routes/audit.route";
import { setupSwagger } from "./infrastructure.layer/docs/swagger";
import { logger } from "./infrastructure.layer/utils/logger.util";
import { requestIdMiddleware } from "./infrastructure.layer/middleware/request-id.middleware";
import { errorHandler } from "./infrastructure.layer/middleware/error.middleware";
import { NotFoundError } from "./infrastructure.layer/errors/app-error";
// [DISABLED] WebSocket only used for messaging
// import { initializeWebSocket } from "./infrastructure.layer/websocket";
import { initializeWebSocket } from "./infrastructure.layer/websocket";

const app = express();

// Setup Swagger documentation (non-production only)
if (env.NODE_ENV !== "production") {
  setupSwagger(app);
}

// Security middleware
app.use(helmet({
  // Content Security Policy for the API itself (Swagger/docs may need adjustments in dev)
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow serving uploads cross-origin
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith("/uploads"), // static uploads should not be rate-limited
  message: { error: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/signout" || req.path === "/auth/signout",
  message: { error: "Too many login attempts, please try again later." },
});

// Request ID middleware (must be early so correlation ID is available to all logs)
app.use(requestIdMiddleware);

// Middleware
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, server-to-server, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiLimiter);

// Request logging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Skip noisy static/health paths at info level; still log at debug
  const isNoisy = originalUrl === "/health" || originalUrl.startsWith("/uploads/");

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : isNoisy ? "debug" : "info";

    logger.log(level, "HTTP", `${method} ${originalUrl} -> ${status} (${duration}ms)`, {
      method,
      path: originalUrl,
      status,
      durationMs: duration,
      ip: maskIp(req.ip ?? "unknown"),
      userAgent: req.headers["user-agent"],
    });
  });

  next();
});

function maskIp(ip: string): string {
  if (!ip || ip === "unknown") return "unknown";
  // IPv4: keep first 3 octets
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.x`;
  }
  // IPv6: keep first 4 groups
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 4).join(":") + ":x:x:x:x";
  }
  return ip;
}

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "TradeMaster Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    app.use("/users", userRoutes);
    app.use("/auth", authLimiter, authRoutes);
    app.use("/businesses", businessRoutes);
    app.use("/categories", categoryRoutes);
    app.use("/uploads", uploadRoutes);
    // [DISABLED] Products not shown in business directory mode
    // app.use("/products", productRoutes);
    app.use("/search", searchRoutes);
    // [DISABLED] Orders not shown in business directory mode
    // app.use("/orders", orderRoutes);
    // [DISABLED] Messaging not shown in business directory mode
    // app.use("/messages", messageRoutes);
    app.use("/reviews", reviewRoutes);
    if (env.NODE_ENV !== "production") {
      app.use("/dev", devRoutes);
      app.use("/dev/audit", auditRoutes);
      logger.info("SERVER", "Dev routes enabled (non-production environment)");
    }
    // 404 handler — convert unknown routes to operational errors
    app.use((req, res, next) => {
      next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
    });

    // Centralized error handler — must be last
    app.use(errorHandler);

    // Sentry/GlitchTip error handler (captures errors sent via next(error))
    Sentry.setupExpressErrorHandler(app);

    const server = app.listen(env.PORT, env.HOST, () => {
      logger.info("SERVER", `TradeMaster Server running on ${env.HOST}:${env.PORT}`);
      logger.info("SERVER", `Health check available at http://localhost:${env.PORT}/health`);
      if (env.NODE_ENV !== "production") {
        logger.info(
          "SERVER",
          `API documentation available at http://localhost:${env.PORT}/api-docs`
        );
      }
    });

    // [DISABLED] WebSocket only used for messaging
    // initializeWebSocket(server);
  } catch (error) {
    logger.error("SERVER", "Failed to start server", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SERVER", "SIGTERM received. Shutting down gracefully...");
  await closeDatabase();
  await shutdownTelemetry(telemetrySdk);
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SERVER", "SIGINT received. Shutting down gracefully...");
  await closeDatabase();
  await shutdownTelemetry(telemetrySdk);
  process.exit(0);
});

startServer();

export default app;
