import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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
import { setupSwagger } from "./infrastructure.layer/docs/swagger";
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
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow serving uploads cross-origin
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter limit for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later." },
});

// Middleware
app.use(cors(
  env.NODE_ENV === "production"
    ? {
        origin: env.FRONTEND_URL,
        credentials: true
      }
    : {
        origin: true,
        credentials: true
      }
));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Request logging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO";
    console.log(
      `[${level}] ${method} ${originalUrl} -> ${status} (${duration}ms)` +
        (status >= 400 ? ` | IP: ${req.ip}` : "")
    );
  });

  next();
});

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
      console.log("🛠️  Dev routes enabled (non-production environment)");
    }
    const server = app.listen(env.PORT, env.HOST, () => {
      console.log(`🚀 TradeMaster Server running on ${env.HOST}:${env.PORT}`);
      console.log(
        `📊 Health check available at http://localhost:${env.PORT}/health`
      );
      if (env.NODE_ENV !== "production") {
        console.log(
          `📚 API documentation available at http://localhost:${env.PORT}/api-docs`
        );
      }
    });

    // [DISABLED] WebSocket only used for messaging
    // initializeWebSocket(server);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  await closeDatabase();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down gracefully...");
  await closeDatabase();
  process.exit(0);
});

startServer();

export default app;
