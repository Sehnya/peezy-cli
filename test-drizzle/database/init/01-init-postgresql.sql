-- PostgreSQL initialization script for test_drizzle_db
-- This file is automatically executed when the database starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create initial tables (customize as needed)
-- Example:
-- CREATE TABLE users (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   email VARCHAR(255) UNIQUE NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Insert seed data if needed
-- INSERT INTO users (email) VALUES ('admin@example.com');
