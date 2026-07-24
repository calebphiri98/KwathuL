// Usage: node scripts/createAdmin.js
// Prompts for admin details, hashes the password with bcrypt, and inserts
// (or upgrades an existing user to) an admin account.

import readline from 'readline';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from '../db.js';

dotenv.config();

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const full_name = await ask('Admin full name: ');
  const email = (await ask('Admin email: ')).toLowerCase();
  const password = await ask('Admin password (min 8 chars): ');

  if (!full_name || !email || password.length < 8) {
    console.error('Invalid input — all fields are required, password must be 8+ chars.');
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(password, 10);

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount > 0) {
    await pool.query(
      'UPDATE users SET role = $1, password_hash = $2, full_name = $3 WHERE email = $4',
      ['admin', password_hash, full_name, email]
    );
    console.log(`Existing user ${email} upgraded to admin.`);
  } else {
    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role) VALUES ($1,$2,$3,'admin')`,
      [full_name, email, password_hash]
    );
    console.log(`Admin account created for ${email}.`);
  }

  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
