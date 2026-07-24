// import { Pool } from '@neondatabase/serverless';
// import dotenv from 'dotenv';

// dotenv.config();

// if (!process.env.DATABASE_URL) {
//   console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
// }

// // Pool works well for a long-running Node server (e.g. Render, Railway, Fly.io, a VPS).
// // If you deploy the API itself as serverless functions, prefer the one-shot
// // `neon()` client from @neondatabase/serverless per-request instead of a Pool.
// export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// export async function query(text, params) {
//   const start = Date.now();
//   const result = await pool.query(text, params);
//   if (process.env.NODE_ENV !== 'production') {
//     const duration = Date.now() - start;
//     console.log('executed query', { text, duration, rows: result.rowCount });
//   }
//   return result;
// }
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
}

// Standard node-postgres Pool over TCP+SSL — the right choice for a
// long-running Node server (unlike @neondatabase/serverless, which uses
// WebSockets and is meant for short-lived serverless/edge functions).
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
});

// Without this handler, a dropped/idle connection error crashes the whole
// process (Node's default behavior for an unhandled Pool 'error' event).
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  if (process.env.NODE_ENV !== 'production') {
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: result.rowCount });
  }
  return result;
}
