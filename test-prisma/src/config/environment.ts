import dotenv from "dotenv";
import Joi from "joi";

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(3000),
  CORS_ORIGIN: Joi.string().default("*"),
  LOG_LEVEL: Joi.string()
    .valid("error", "warn", "info", "debug")
    .default("info"),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  nodeEnv: envVars.NODE_ENV,
  isDevelopment: envVars.NODE_ENV === "development",
  isProduction: envVars.NODE_ENV === "production",
  isTest: envVars.NODE_ENV === "test",
  port: envVars.PORT,
  cors: {
    origin: envVars.CORS_ORIGIN,
  },
  logging: {
    level: envVars.LOG_LEVEL,
  },
} as const;
