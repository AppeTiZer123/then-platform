import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// ตรวจสอบ DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// สร้าง connection
// สำหรับ serverless ต้องใช้ connection pooling
const connectionString = process.env.DATABASE_URL;

// Postgres client
// prepare: false จำเป็นสำหรับ Supabase Transaction Mode (PgBouncer) เพราะ prepared statements ทำงานไม่ได้กับ connection pooler
const client = postgres(connectionString, {
  prepare: false,
});

// Drizzle instance พร้อม schema
export const db = drizzle(client, { schema });

// Export types
export type Database = typeof db;
