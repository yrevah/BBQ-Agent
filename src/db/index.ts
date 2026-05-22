import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "postgres://localhost:5432/_unset";

const client = postgres(url, { prepare: false });

export const db = drizzle(client, { schema });
export { schema };
