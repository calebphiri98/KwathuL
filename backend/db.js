import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
}

// Pool works well for a long-running Node server (e.g. Render, Railway, Fly.io, a VPS).
// If you deploy the API itself as serverless functions, prefer the one-shot
// `neon()` client from @neondatabase/serverless per-request instead of a Pool.
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  if (process.env.NODE_ENV !== 'production') {
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: result.rowCount });
  }
  return result;
}
