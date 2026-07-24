import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// GET /api/recipes  (public) — teaser fields only, secret formula/method excluded
// Supports ?page= & ?limit=
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
  const offset = (page - 1) * limit;

  const countResult = await query(`SELECT COUNT(*)::int AS total FROM recipes WHERE is_public = true`);
  const total = countResult.rows[0].total;

  const result = await query(
    `SELECT id, title, slug, summary, cover_image_url, dietary_tags, ingredients_public, created_at
     FROM recipes WHERE is_public = true ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  res.json({ recipes: result.rows, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

// GET /api/recipes/:slug  (public) — teaser only, never returns *_private columns
router.get('/:slug', async (req, res) => {
  const result = await query(
    `SELECT id, title, slug, summary, cover_image_url, dietary_tags, ingredients_public, created_at
     FROM recipes WHERE slug = $1 AND is_public = true`,
    [req.params.slug]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Recipe not found.' });
  res.json({ recipe: result.rows[0] });
});

// ---------- ADMIN ONLY ----------

// GET /api/recipes/admin/all — includes secret ingredients/steps
router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  const result = await query('SELECT * FROM recipes ORDER BY created_at DESC');
  res.json({ recipes: result.rows });
});

router.get('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  const result = await query('SELECT * FROM recipes WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Recipe not found.' });
  res.json({ recipe: result.rows[0] });
});

// POST /api/recipes  (admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      title, summary, cover_image_url, dietary_tags, is_public,
      ingredients_public, ingredients_private, steps_private,
    } = req.body;

    if (!title) return res.status(400).json({ error: 'title is required.' });

    let slug = slugify(title);
    const dup = await query('SELECT id FROM recipes WHERE slug = $1', [slug]);
    if (dup.rowCount > 0) slug = `${slug}-${Date.now().toString().slice(-5)}`;

    const result = await query(
      `INSERT INTO recipes
        (title, slug, summary, cover_image_url, dietary_tags, is_public, ingredients_public, ingredients_private, steps_private, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        title, slug, summary || null, cover_image_url || null, dietary_tags || [],
        is_public !== false, ingredients_public || null, ingredients_private || null,
        steps_private || null, req.user.id,
      ]
    );
    res.status(201).json({ recipe: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create recipe.' });
  }
});

// PUT /api/recipes/:id  (admin)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      title, summary, cover_image_url, dietary_tags, is_public,
      ingredients_public, ingredients_private, steps_private,
    } = req.body;

    const result = await query(
      `UPDATE recipes SET
        title = COALESCE($1, title),
        summary = COALESCE($2, summary),
        cover_image_url = COALESCE($3, cover_image_url),
        dietary_tags = COALESCE($4, dietary_tags),
        is_public = COALESCE($5, is_public),
        ingredients_public = COALESCE($6, ingredients_public),
        ingredients_private = COALESCE($7, ingredients_private),
        steps_private = COALESCE($8, steps_private)
       WHERE id = $9
       RETURNING *`,
      [title, summary, cover_image_url, dietary_tags, is_public, ingredients_public, ingredients_private, steps_private, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Recipe not found.' });
    res.json({ recipe: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update recipe.' });
  }
});

// DELETE /api/recipes/:id  (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const result = await query('DELETE FROM recipes WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Recipe not found.' });
  res.json({ message: 'Recipe deleted.' });
});

export default router;
