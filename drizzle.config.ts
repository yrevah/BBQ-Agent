import path from "node:path";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url:
      process.env.DATABASE_FILE ?? path.join(process.cwd(), "data", "bbq.db"),
  },
  strict: true,
  verbose: true,
});
