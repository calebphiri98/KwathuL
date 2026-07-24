import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// GET /api/products  (public) — optional ?category= & ?search= & ?page= & ?limit=
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const offset = (page - 1) * limit;

    const conditions = ['is_available = true'];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }
    const where = conditions.join(' AND ');

    const countResult = await query(`SELECT COUNT(*)::int AS total FROM products WHERE ${where}`, params);
    const total = countResult.rows[0].total;

    const result = await query(
      `SELECT id, name, slug, description, price, category, image_url, is_organic,
              dietary_tags, nutrition_info, created_at
       FROM products
       WHERE ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    res.json({ products: result.rows, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load products.' });
  }
});

// GET /api/products/:slug  (public)
router.get('/:slug', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, slug, description, price, category, image_url, is_organic,
              dietary_tags, nutrition_info, created_at
       FROM products WHERE slug = $1 AND is_available = true`,
      [req.params.slug]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found.' });
    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load product.' });
  }
});

// ---------- ADMIN ONLY ----------

// GET /api/products/admin/all — includes unavailable items
router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  const result = await query('SELECT * FROM products ORDER BY created_at DESC');
  res.json({ products: result.rows });
});

// POST /api/products  (admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      name, description, price, category, image_url,
      is_organic, dietary_tags, nutrition_info, is_available,
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'name and price are required.' });
    }

    let slug = slugify(name);
    const dup = await query('SELECT id FROM products WHERE slug = $1', [slug]);
    if (dup.rowCount > 0) slug = `${slug}-${Date.now().toString().slice(-5)}`;

    const result = await query(
      `INSERT INTO products
        (name, slug, description, price, category, image_url, is_organic, dietary_tags, nutrition_info, is_available, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        name, slug, description || null, price, category || null, image_url || null,
        !!is_organic, dietary_tags || [], nutrition_info || {}, is_available !== false, req.user.id,
      ]
    );
    res.status(201).json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create product.' });
  }
});

// PUT /api/products/:id  (admin)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      name, description, price, category, image_url,
      is_organic, dietary_tags, nutrition_info, is_available,
    } = req.body;

    const result = await query(
      `UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        category = COALESCE($4, category),
        image_url = COALESCE($5, image_url),
        is_organic = COALESCE($6, is_organic),
        dietary_tags = COALESCE($7, dietary_tags),
        nutrition_info = COALESCE($8, nutrition_info),
        is_available = COALESCE($9, is_available)
       WHERE id = $10
       RETURNING *`,
      [name, description, price, category, image_url, is_organic, dietary_tags, nutrition_info, is_available, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found.' });
    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update product.' });
  }
});

// DELETE /api/products/:id  (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found.' });
  res.json({ message: 'Product deleted.' });
});

export default router;
