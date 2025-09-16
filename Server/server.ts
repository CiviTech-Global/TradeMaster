import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import {
  initializeDatabase,
  closeDatabase,
} from "./infrastructure.layer/database";
import userRoutes from "./presentation.layer/routes/user.route";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    app.listen(PORT, () => {
      console.log(`🚀 TradeMaster Server running on port ${PORT}`);
      console.log(
        `📊 Health check available at http://localhost:${PORT}/health`
      );
    });
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
