import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg', // Change to 'mysql2' or 'better-sqlite' as needed
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
