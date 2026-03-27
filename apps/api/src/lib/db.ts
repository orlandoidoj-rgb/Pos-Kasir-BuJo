import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@warung-bujo/database";

const pool = new Pool({
  user: 'warungbujo',
  host: 'localhost',
  port: 5432,
  database: 'warungbujo',
  password: 'BuJo2026SecurePass!',
  max: 20,
});

export const db = drizzle(pool, { schema });
