import "dotenv/config";

import { Redis } from '@upstash/redis'
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

declare global {
  // avoid creating a new pool every hot reload in dev
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var __PG_POOL__: any;
}

const pool = global.__PG_POOL__ ?? new Pool({ connectionString: process.env.DATABASE_URL! });
if (!global.__PG_POOL__) global.__PG_POOL__ = pool;

export const db = drizzle(pool, { schema });


export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})