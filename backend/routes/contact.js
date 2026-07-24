import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { contactLimiter } from '../middleware/rateLimit.js';

const router = Router();

// POST /api/contact  (public)
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required.' });
    }
    const result = await query(
      `INSERT INTO contact_messages (name, email, subject, message) VALUES ($1,$2,$3,$4) RETURNING id, created_at`,
      [name, email, subject || null, message]
    );
    res.status(201).json({ message: 'Thank you — we will get back to you soon.', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not send message.' });
  }
});

// GET /api/contact  (admin) — view submissions
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const result = await query('SELECT * FROM contact_messages ORDER BY created_at DESC');
  res.json({ messages: result.rows });
});

// PUT /api/contact/:id/read  (admin)
router.put('/:id/read', requireAuth, requireAdmin, async (req, res) => {
  const result = await query('UPDATE contact_messages SET is_read = true WHERE id = $1 RETURNING *', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Message not found.' });
  res.json({ message: result.rows[0] });
});

export default router;
