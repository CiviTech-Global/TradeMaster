import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TradeMaster Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/`);
});

export default app;
