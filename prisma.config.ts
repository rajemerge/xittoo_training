import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // Empty fallback lets `prisma generate` run before .env exists.
    // Commands that touch the database (db push, migrate) need the real URL.
    url: process.env.DATABASE_URL ?? "",
  },
});
