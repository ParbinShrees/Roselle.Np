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

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// ─── Validation ───────────────────────────────────────────────────────────────
const isValidPhone  = (v) => /^\d{10}$/.test(String(v ?? '').trim());
const isValidEmail  = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? '').trim());
const isNonEmpty    = (v) => typeof v === 'string' && v.trim().length > 0;
const isValidAmount = (v) => typeof v === 'number' && isFinite(v) && v > 0;

// ─── GET /api/health ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: '🌸 Roselle backend is running' });
});

// ─── POST /api/orders ─────────────────────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customer_name,
      phone,
      email,
      address,
      delivery_zone = 'inside',
      gift_message  = '',
      total_amount,
      items = [],
    } = req.body;

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

// ─── GET /api/orders ─────────────────────────────────────────────────────────
app.get('/api/orders', (_req, res) => {
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
