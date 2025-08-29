import "dotenv/config";

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!); // client
export const db = drizzle(sql);


import { Redis } from '@upstash/redis'
export const redis = Redis.fromEnv()
