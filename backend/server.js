/**
 * server.js — Roselle Order Backend
 * Express + sql.js (pure JS SQLite) + Nodemailer
 */
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const db      = require('./db');
const { sendOrderEmails } = require('./mailer');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Security Headers ────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://roselle-np.vercel.app'],
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-password'],
}));
app.use(express.json({ limit: '50kb' }));

// ─── In-Memory Rate Limiter ──────────────────────────────────────────────────
const rateLimits = new Map();
const rateLimiter = (maxRequests, windowMs) => (req, res, next) => {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown');
  const now = Date.now();
  const record = rateLimits.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count++;
  }
  rateLimits.set(ip, record);

  if (record.count > maxRequests) {
    return res.status(429).json({ success: false, errors: ['Too many requests. Please try again shortly.'] });
  }
  next();
};

// ─── Validation & Sanitization ───────────────────────────────────────────────
const sanitize      = (v) => String(v ?? '').replace(/[<>]/g, '').trim();
const isValidPhone  = (v) => /^\d{10}$/.test(String(v ?? '').trim());
const isValidEmail  = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? '').trim());
const isNonEmpty    = (v) => typeof v === 'string' && v.trim().length > 0;
const isValidAmount = (v) => typeof v === 'number' && isFinite(v) && v > 0;

// ─── GET /api/health ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: '🌸 Roselle backend is running' });
});

// ─── POST /api/orders ─────────────────────────────────────────────────────────
app.post('/api/orders', rateLimiter(15, 10 * 60 * 1000), async (req, res) => {
  try {
    const customer_name = sanitize(req.body.customer_name);
    const phone         = sanitize(req.body.phone);
    const email         = sanitize(req.body.email).toLowerCase();
    const address       = sanitize(req.body.address);
    const delivery_zone = req.body.delivery_zone === 'outside' ? 'outside' : 'inside';
    const gift_message  = sanitize(req.body.gift_message);
    const total_amount  = req.body.total_amount;
    const items         = Array.isArray(req.body.items) ? req.body.items : [];


    // ── Validate ──────────────────────────────────────────────────────────
    const errors = [];
    if (!isNonEmpty(customer_name))              errors.push('Full name is required.');
    if (!isValidPhone(phone))                    errors.push('Phone must be exactly 10 digits (e.g. 9841234567).');
    if (!isValidEmail(email))                    errors.push('A valid email address is required.');
    if (!isNonEmpty(address))                    errors.push('Delivery address is required.');
    if (!isValidAmount(total_amount))            errors.push('Order total must be a positive number.');
    if (!Array.isArray(items) || items.length === 0) errors.push('Cart is empty.');

    for (const item of items) {
      if (!isNonEmpty(item.product_name))                              errors.push(`Item missing product name.`);
      if (!Number.isInteger(item.quantity) || item.quantity < 1)       errors.push(`"${item.product_name}" has invalid quantity.`);
      if (typeof item.unit_price !== 'number' || item.unit_price <= 0) errors.push(`"${item.product_name}" has invalid price.`);
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // ── Save in a single transaction ──────────────────────────────────────
    const orderId = db.transaction(() => {
      const oid = db.run(
        `INSERT INTO orders (customer_name, phone, email, address, delivery_zone, gift_message, total_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          customer_name.trim(),
          phone.trim(),
          email.trim().toLowerCase(),
          address.trim(),
          delivery_zone === 'outside' ? 'outside' : 'inside',
          gift_message.trim() || null,
          total_amount,
        ]
      );
      for (const item of items) {
        db.run(
          `INSERT INTO order_items (order_id, product_name, quantity, unit_price) VALUES (?, ?, ?, ?)`,
          [oid, item.product_name, item.quantity, item.unit_price]
        );
      }
      return oid;
    });

    console.log(`✅ Order #${orderId} saved`);

    // ── Fetch saved order for email ───────────────────────────────────────
    const savedOrder = db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    const savedItems = db.all('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    // ── Send emails (non-blocking) ────────────────────────────────────────
    sendOrderEmails({ ...savedOrder, items: savedItems }).catch((err) =>
      console.error('Unexpected email error:', err)
    );

    return res.status(201).json({
      success:  true,
      order_id: orderId,
      message:  'Order confirmed! We will contact you shortly.',
    });

  } catch (err) {
    console.error('❌ Order creation failed:', err);
    return res.status(500).json({
      success: false,
      errors:  ['Server error — please try again.'],
    });
  }
});

// ─── GET /api/orders/track (Public customer order tracking) ───────────────────
app.get('/api/orders/track', rateLimiter(30, 60 * 1000), (req, res) => {
  const query = sanitize(req.query.q);
  if (!query) {
    return res.status(400).json({ success: false, errors: ['Please provide an Order ID or 10-digit phone number.'] });
  }


  try {
    let order = null;
    if (/^\d+$/.test(query) && query.length <= 6) {
      // Numerical Order ID (e.g. 1, 25, 104)
      order = db.get(
        'SELECT id, customer_name, delivery_zone, status, total_amount, created_at FROM orders WHERE id = ?',
        [parseInt(query, 10)]
      );
    } else {
      // 10-digit Phone number (e.g. 9841234567)
      order = db.get(
        'SELECT id, customer_name, delivery_zone, status, total_amount, created_at FROM orders WHERE phone = ? ORDER BY id DESC LIMIT 1',
        [query]
      );
    }

    if (!order) {
      return res.status(404).json({ success: false, errors: ['No order found for this Order ID or phone number.'] });
    }

    const items = db.all('SELECT product_name, quantity, unit_price FROM order_items WHERE order_id = ?', [order.id]);
    return res.json({ success: true, order: { ...order, items } });
  } catch (err) {
    console.error('Order tracking query failed:', err);
    return res.status(500).json({ success: false, errors: ['Failed to track order.'] });
  }
});

// ─── GET /api/orders ─────────────────────────────────────────────────────────
// Protected with ADMIN_PASSWORD env var

app.get('/api/orders', (req, res) => {
  const pwd = req.headers['x-admin-password'];
  if (pwd !== (process.env.ADMIN_PASSWORD || 'roselle2024')) {
    return res.status(401).json({ success: false, errors: ['Unauthorised.'] });
  }
  try {
    const orders = db.all(`SELECT * FROM orders ORDER BY id DESC`);
    const enriched = orders.map(order => ({
      ...order,
      items: db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]),
    }));
    return res.json({ success: true, count: enriched.length, orders: enriched });
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    return res.status(500).json({ success: false, errors: ['Failed to load orders.'] });
  }
});

// ─── PATCH /api/orders/:id/status ─────────────────────────────────────────────
app.patch('/api/orders/:id/status', (req, res) => {
  const pwd = req.headers['x-admin-password'];
  if (pwd !== (process.env.ADMIN_PASSWORD || 'roselle2024')) {
    return res.status(401).json({ success: false, errors: ['Unauthorised.'] });
  }
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, errors: [`Invalid status. Must be one of: ${allowed.join(', ')}`] });
  }
  try {
    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    return res.json({ success: true, message: `Order #${req.params.id} marked as ${status}.` });
  } catch (err) {
    console.error('Status update failed:', err);
    return res.status(500).json({ success: false, errors: ['Failed to update status.'] });
  }
});


// ─── Start (wait for DB to init first) ───────────────────────────────────────
if (process.env.VERCEL) {
  // If running on Vercel, initialize DB synchronously (or inside route) 
  // Vercel handles the server listening automatically
  db.initDb().catch(console.error);
} else {
  db.initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`\n🌸 Roselle backend  →  http://localhost:${PORT}`);
      console.log(`   POST /api/orders   confirm an order`);
      console.log(`   GET  /api/orders   view all saved orders`);
      console.log(`   GET  /api/health   health check\n`);
    });
  }).catch(err => {
    console.error('❌ Failed to start — database init error:', err);
    process.exit(1);
  });
}

module.exports = app;
