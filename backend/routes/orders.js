import { Router } from 'express';
import { query, pool } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// POST /api/orders  (logged-in customer places an order)
// body: { items: [{ product_id, quantity }], delivery_address, delivery_phone, notes }
router.post('/', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, delivery_address, delivery_phone, notes } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must include at least one item.' });
    }

    await client.query('BEGIN');

    // Fetch current prices server-side (never trust client-sent prices)
    const productIds = items.map((i) => i.product_id);
    const { rows: products } = await client.query(
      `SELECT id, name, price FROM products WHERE id = ANY($1) AND is_available = true`,
      [productIds]
    );
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const lineItems = [];
    for (const item of items) {
      const product = productMap[item.product_id];
      if (!product) {
        throw new Error(`Product ${item.product_id} is not available.`);
      }
      const quantity = Number(item.quantity) || 1;
      const line_total = Number(product.price) * quantity;
      subtotal += line_total;
      lineItems.push({ product, quantity, line_total });
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, delivery_address, delivery_phone, notes, subtotal, total)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, delivery_address || null, delivery_phone || null, notes || null, subtotal, subtotal]
    );
    const order = orderResult.rows[0];

    for (const li of lineItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id, li.product.id, li.product.name, li.product.price, li.quantity, li.line_total]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ order: { ...order, items: lineItems } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ error: err.message || 'Could not place order.' });
  } finally {
    client.release();
  }
});

// GET /api/orders/mine  (customer's own order history)
router.get('/mine', requireAuth, async (req, res) => {
  const orders = await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
  const items = await query(
    `SELECT * FROM order_items WHERE order_id = ANY($1)`,
    [orders.rows.map((o) => o.id)]
  );
  const byOrder = {};
  for (const it of items.rows) {
    (byOrder[it.order_id] ||= []).push(it);
  }
  const result = orders.rows.map((o) => ({ ...o, items: byOrder[o.id] || [] }));
  res.json({ orders: result });
});

// ---------- ADMIN ----------

// GET /api/orders/admin/all
router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  const orders = await query(
    `SELECT o.*, u.full_name AS customer_name, u.email AS customer_email
     FROM orders o JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`
  );
  res.json({ orders: orders.rows });
});

// PUT /api/orders/:id/status  (admin updates order status)
router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status.' });

  const result = await query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Order not found.' });
  res.json({ order: result.rows[0] });
});

export default router;
