import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const file =
  process.env.DATABASE_FILE ?? path.join(process.cwd(), "data", "bbq.db");

fs.mkdirSync(path.dirname(file), { recursive: true });

const db = drizzle(new Database(file));
migrate(db, { migrationsFolder: "./drizzle" });

console.log(`Migrations applied to ${file}`);
