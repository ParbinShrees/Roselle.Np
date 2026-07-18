/**
 * mailer.js — Nodemailer Gmail transporter and email templates for Roselle
 *
 * Requirements:
 *   - 2-Step Verification enabled on the Gmail account
 *   - Gmail App Password generated (NOT the regular account password)
 *   - GMAIL_USER and GMAIL_APP_PASSWORD set in backend/.env
 */
const nodemailer = require('nodemailer');

// ─── Transporter ──────────────────────────────────────────────────────────────
const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('⚠️  Gmail credentials not set — emails will be skipped.');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtNPR = (amount) =>
  'Rs. ' + Number(amount).toLocaleString('en-NP');

const formatItemsText = (items) =>
  items.map(i => `  • ${i.product_name}  ×${i.quantity}  @ ${fmtNPR(i.unit_price)}  = ${fmtNPR(i.quantity * i.unit_price)}`).join('\n');

const formatItemsHtml = (items) =>
  items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f5e8ee">${i.product_name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f5e8ee;text-align:center">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f5e8ee;text-align:right">${fmtNPR(i.unit_price)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f5e8ee;text-align:right;font-weight:600;color:#d1748c">${fmtNPR(i.quantity * i.unit_price)}</td>
    </tr>`).join('');

// ─── Owner notification email ─────────────────────────────────────────────────
const sendOwnerEmail = async (transporter, order) => {
  const { customer_name, phone, email, address, delivery_zone, gift_message, total_amount, created_at, items, id } = order;

  const zoneLabel = delivery_zone === 'inside' ? 'Inside Pokhara Valley (Cash on Delivery)' : 'Outside Pokhara Valley (Cost to be confirmed)';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fff8f3;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#d1748c,#e8a0b4);padding:28px 32px">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">🌸 New Order Received!</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px">Order #${id} · ${created_at}</p>
    </div>

    <!-- Customer Details -->
    <div style="padding:24px 32px;border-bottom:1px solid #f5e8ee">
      <h2 style="margin:0 0 16px;font-size:15px;color:#8a7a72;text-transform:uppercase;letter-spacing:0.08em">Customer Details</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 0;color:#8a7a72;width:120px">Name</td><td style="padding:6px 0;color:#2b2b2b;font-weight:600">${customer_name}</td></tr>
        <tr><td style="padding:6px 0;color:#8a7a72">Phone</td><td style="padding:6px 0;color:#2b2b2b;font-weight:600">${phone}</td></tr>
        <tr><td style="padding:6px 0;color:#8a7a72">Email</td><td style="padding:6px 0;color:#2b2b2b">${email}</td></tr>
        <tr><td style="padding:6px 0;color:#8a7a72">Address</td><td style="padding:6px 0;color:#2b2b2b">${address}</td></tr>
        <tr><td style="padding:6px 0;color:#8a7a72">Zone</td><td style="padding:6px 0;color:#2b2b2b">${zoneLabel}</td></tr>
        ${gift_message ? `<tr><td style="padding:6px 0;color:#8a7a72;vertical-align:top">Gift Note</td><td style="padding:6px 0;color:#2b2b2b;font-style:italic">"${gift_message}"</td></tr>` : ''}
      </table>
    </div>

    <!-- Order Items -->
    <div style="padding:24px 32px;border-bottom:1px solid #f5e8ee">
      <h2 style="margin:0 0 16px;font-size:15px;color:#8a7a72;text-transform:uppercase;letter-spacing:0.08em">Order Items</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#fff8f3">
            <th style="padding:10px 12px;text-align:left;color:#8a7a72;font-weight:600">Product</th>
            <th style="padding:10px 12px;text-align:center;color:#8a7a72;font-weight:600">Qty</th>
            <th style="padding:10px 12px;text-align:right;color:#8a7a72;font-weight:600">Unit Price</th>
            <th style="padding:10px 12px;text-align:right;color:#8a7a72;font-weight:600">Subtotal</th>
          </tr>
        </thead>
        <tbody>${formatItemsHtml(items)}</tbody>
        <tfoot>
          <tr style="background:#fff8f3">
            <td colspan="3" style="padding:12px;text-align:right;font-weight:700;color:#2b2b2b;font-size:15px">Total</td>
            <td style="padding:12px;text-align:right;font-weight:700;color:#d1748c;font-size:16px">${fmtNPR(total_amount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;background:#2b2b2b">
      <p style="margin:0;color:#7a7a7a;font-size:12px;text-align:center">Roselle · Rambazar, Pokhara, Nepal · 9769695263</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Roselle Orders" <${process.env.GMAIL_USER}>`,
    to: 'parbinshreesh64487@gmail.com',
    subject: `🌸 New Order #${id} from ${customer_name} — ${fmtNPR(total_amount)}`,
    html,
    text: `New Order #${id}\n\nCustomer: ${customer_name}\nPhone: ${phone}\nEmail: ${email}\nAddress: ${address}\nZone: ${zoneLabel}\n\nItems:\n${formatItemsText(items)}\n\nTotal: ${fmtNPR(total_amount)}\nDate: ${created_at}`,
  });
};

// ─── Customer confirmation email ──────────────────────────────────────────────
const sendCustomerEmail = async (transporter, order) => {
  const { customer_name, email, address, delivery_zone, total_amount, items, id } = order;

  const zoneLabel = delivery_zone === 'inside' ? 'Inside Pokhara Valley — Cash on Delivery' : 'Outside Pokhara Valley — Delivery cost to be confirmed';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fff8f3;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#d1748c,#e8a0b4);padding:32px;text-align:center">
      <div style="font-size:40px;margin-bottom:12px">🌸</div>
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">Thank you, ${customer_name}!</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:15px">Your order has been received.</p>
    </div>

    <!-- Message -->
    <div style="padding:28px 32px;border-bottom:1px solid #f5e8ee">
      <p style="margin:0;font-size:15px;color:#5a5a5a;line-height:1.7">
        We've got your order and we're excited to get it to you! 
        We will call you shortly on <strong style="color:#2b2b2b">${order.phone}</strong> to confirm your delivery details and arrange payment.
      </p>
      <div style="margin-top:20px;background:#edf4ee;border-left:4px solid #4f6f52;border-radius:8px;padding:14px 18px">
        <p style="margin:0;font-size:13px;color:#4f6f52;font-weight:600">No payment has been taken yet.</p>
        <p style="margin:4px 0 0;font-size:13px;color:#4f6f52">Payment will be arranged on delivery — Cash on Delivery for orders inside Pokhara Valley.</p>
      </div>
    </div>

    <!-- Order Summary -->
    <div style="padding:24px 32px;border-bottom:1px solid #f5e8ee">
      <h2 style="margin:0 0 16px;font-size:15px;color:#8a7a72;text-transform:uppercase;letter-spacing:0.08em">Your Order — #${id}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#fff8f3">
            <th style="padding:10px 12px;text-align:left;color:#8a7a72;font-weight:600">Product</th>
            <th style="padding:10px 12px;text-align:center;color:#8a7a72;font-weight:600">Qty</th>
            <th style="padding:10px 12px;text-align:right;color:#8a7a72;font-weight:600">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(i => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f5e8ee">${i.product_name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f5e8ee;text-align:center">${i.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f5e8ee;text-align:right;font-weight:600;color:#d1748c">${fmtNPR(i.quantity * i.unit_price)}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr style="background:#fff8f3">
            <td colspan="2" style="padding:12px;text-align:right;font-weight:700;color:#2b2b2b">Total</td>
            <td style="padding:12px;text-align:right;font-weight:700;color:#d1748c;font-size:16px">${fmtNPR(total_amount)}</td>
          </tr>
        </tfoot>
      </table>
      <p style="margin:16px 0 0;font-size:13px;color:#8a7a72"><strong>Delivery to:</strong> ${address}<br><strong>Zone:</strong> ${zoneLabel}</p>
    </div>

    <!-- Footer -->
    <div style="padding:24px 32px;text-align:center">
      <p style="margin:0 0 8px;font-size:13px;color:#5a5a5a">Questions? Reach us on WhatsApp or Instagram.</p>
      <p style="margin:0;font-size:12px;color:#8a7a72">Roselle · Rambazar, Pokhara, Nepal · 9769695263</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Roselle 🌸" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `🌸 Order Confirmed — Roselle #${id}`,
    html,
    text: `Hi ${customer_name},\n\nThank you for your order!\n\nOrder #${id}\nItems:\n${formatItemsText(items)}\nTotal: ${fmtNPR(total_amount)}\nDelivery: ${address}\n\nWe'll call you on ${order.phone} to confirm delivery and arrange payment.\n\nNo payment has been taken yet.\n\nRoselle · Rambazar, Pokhara · 9769695263`,
  });
};

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * Attempts to send both emails. Failures are logged but never thrown —
 * the order is already saved; email is a notification, not a requirement.
 */
const sendOrderEmails = async (order) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const results = { owner: false, customer: false };

  try {
    await sendOwnerEmail(transporter, order);
    results.owner = true;
    console.log(`📧 Owner email sent for order #${order.id}`);
  } catch (err) {
    console.error(`❌ Owner email failed for order #${order.id}:`, err.message);
  }

  try {
    await sendCustomerEmail(transporter, order);
    results.customer = true;
    console.log(`📧 Customer email sent to ${order.email} for order #${order.id}`);
  } catch (err) {
    console.error(`❌ Customer email failed for order #${order.id}:`, err.message);
  }

  return results;
};

module.exports = { sendOrderEmails };
