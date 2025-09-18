import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { config } from "@/config/environment";
import { errorHandler } from "@/middleware/errorHandler";
import { notFoundHandler } from "@/middleware/notFoundHandler";
import { healthRoutes } from "@/routes/health";
import { apiRoutes } from "@/routes/api";
import { logger } from "@/utils/logger";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(morgan(config.isDevelopment ? "dev" : "combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/health", healthRoutes);
app.use("/api/v1", apiRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(config.port, () => {
  logger.info(`🚀 Server running on port ${config.port}`);
  logger.info(`📝 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Health check: http://localhost:${config.port}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

export default app;
