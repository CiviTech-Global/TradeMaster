import dotenv from "dotenv";
import { Pool } from "pg";
import { config } from "./config";

// Load environment variables
dotenv.config();

if (
  !config.host ||
  !config.port ||
  !config.user ||
  !config.password ||
  !config.database
) {
  throw new Error("Database configuration is missing");
}

const pool = new Pool({
  host: config.host,
  port: Number(config.port),
  user: config.user,
  password: config.password,
  database: config.database,
});

export { pool };
