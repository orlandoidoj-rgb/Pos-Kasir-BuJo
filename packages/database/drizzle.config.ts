import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Pastikan environment variable DATABASE_URL diset sebelum menjalankan drizzle-kit
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
