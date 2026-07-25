// Runs a .sql file against DATABASE_URL using the pg driver — no psql install needed.
//
// Usage (from the backend/ folder):
//   node scripts/runSqlFile.js ../schema.sql
//   node scripts/runSqlFile.js ../seed-data.sql

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { pool } from '../db.js';

dotenv.config();

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node scripts/runSqlFile.js <path-to-sql-file>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(resolvedPath, 'utf8');
  console.log(`Running ${resolvedPath} ...`);

  try {
    const result = await pool.query(sql);
    const last = Array.isArray(result) ? result[result.length - 1] : result;
    if (last?.rows?.length) {
      console.table(last.rows);
    }
    console.log('Done.');
  } catch (err) {
    console.error('SQL execution failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();