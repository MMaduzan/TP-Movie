import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./Infrastructure/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    host: process.env.DRIZZLE_DB_HOST ?? "localhost",
    port: Number(process.env.DRIZZLE_DB_PORT ?? "5434"),
    user: process.env.DRIZZLE_DB_USER ?? "postgres",
    password: process.env.DRIZZLE_DB_PASSWORD ?? "postgres",
    database: process.env.DRIZZLE_DB_NAME ?? "db_sandbox",
    ssl: false,
  },
});
