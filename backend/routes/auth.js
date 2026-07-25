import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'token';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // requires HTTPS in prod
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { full_name, email, password, phone, dietary_notes } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'full_name, email and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, phone, dietary_notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role, phone, dietary_notes, created_at`,
      [full_name, email.toLowerCase(), password_hash, phone || null, dietary_notes || null]
    );

    const user = result.rows[0];
    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});
// GET /api/auth/csrf-token
// Returns the CSRF token in the response body since the frontend
// (different origin) can't read the csrf_token cookie via document.cookie.
router.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken });
});
// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        dietary_notes: user.dietary_notes,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  res.json({ message: 'Logged out.' });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const result = await query(
    'SELECT id, full_name, email, role, phone, dietary_notes, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: result.rows[0] });
});

export default router;
