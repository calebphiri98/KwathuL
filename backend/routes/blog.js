import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// GET /api/blog  (public) — optional ?category= & ?page= & ?limit=
router.get('/', async (req, res) => {
  const { category } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 9));
  const offset = (page - 1) * limit;

  const params = [];
  let where = 'is_published = true';
  if (category) {
    params.push(category);
    where += ` AND category = $${params.length}`;
  }

  const countResult = await query(`SELECT COUNT(*)::int AS total FROM blog_posts WHERE ${where}`, params);
  const total = countResult.rows[0].total;

  const result = await query(
    `SELECT id, title, slug, excerpt, cover_image_url, category, tags, published_at
     FROM blog_posts WHERE ${where} ORDER BY published_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  res.json({ posts: result.rows, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

// GET /api/blog/:slug  (public)
router.get('/:slug', async (req, res) => {
  const result = await query(
    `SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.content, bp.cover_image_url,
            bp.category, bp.tags, bp.published_at, u.full_name AS author_name
     FROM blog_posts bp
     LEFT JOIN users u ON u.id = bp.author_id
     WHERE bp.slug = $1 AND bp.is_published = true`,
    [req.params.slug]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Post not found.' });
  res.json({ post: result.rows[0] });
});

// ---------- ADMIN ONLY ----------

router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  const result = await query('SELECT * FROM blog_posts ORDER BY created_at DESC');
  res.json({ posts: result.rows });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, excerpt, content, cover_image_url, category, tags, is_published } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content are required.' });

    let slug = slugify(title);
    const dup = await query('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
    if (dup.rowCount > 0) slug = `${slug}-${Date.now().toString().slice(-5)}`;

    const result = await query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, cover_image_url, category, tags, is_published, author_id, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, CASE WHEN $8 THEN now() ELSE NULL END)
       RETURNING *`,
      [title, slug, excerpt || null, content, cover_image_url || null, category || 'General', tags || [], is_published !== false, req.user.id]
    );
    res.status(201).json({ post: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create post.' });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, excerpt, content, cover_image_url, category, tags, is_published } = req.body;
    const result = await query(
      `UPDATE blog_posts SET
        title = COALESCE($1, title),
        excerpt = COALESCE($2, excerpt),
        content = COALESCE($3, content),
        cover_image_url = COALESCE($4, cover_image_url),
        category = COALESCE($5, category),
        tags = COALESCE($6, tags),
        is_published = COALESCE($7, is_published),
        published_at = CASE WHEN $7 = true AND published_at IS NULL THEN now() ELSE published_at END
       WHERE id = $8
       RETURNING *`,
      [title, excerpt, content, cover_image_url, category, tags, is_published, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Post not found.' });
    res.json({ post: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update post.' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const result = await query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Post not found.' });
  res.json({ message: 'Post deleted.' });
});

export default router;
