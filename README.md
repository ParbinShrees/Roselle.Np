# 🌸 Roselle — Handcrafted Flower Boutique (Pokhara, Nepal)

Everlasting fuzzy-wire bouquets and floral art, handcrafted in Rambazar, Pokhara. Features a seamless Cash-on-Delivery order flow, bespoke bouquet builder studio, live customer order tracker, and protected admin operations dashboard.

---

## 🌟 Key Features

### 🛒 E-Commerce & Storefront
- **Everlasting Catalog**: High-resolution gallery of handcrafted tulips, roses, sunflowers, lilies, and daisy bouquets.
- **Instant Search & Filtering**: Debounced filter by flower type, color theme, occasion, and price.
- **Custom Bouquet Builder (`/builder`)**:
  - Interactive stem counters for Velvet Roses, French Tulips, Sunflowers, Daisies, and Lilies.
  - Wrapping paper selection (Korean Frosted White, Vintage Kraft, Rose Gold Shimmer, Midnight Black).
  - Free custom-printed satin ribbons and personalized occasion greeting cards.
  - Optional luxury add-ons (Warm Fairy LED String Lights, Sweet Rose Mist, Chocolates).
  - Real-time price breakdown and instant cart integration.
- **Live Order Tracker (`/track`)**:
  - Track orders in real-time by entering **Order ID** (e.g. `#4`) or customer's **10-digit phone number**.
  - 5-step visual delivery pipeline: *Received ➜ Handcrafting ➜ Wrapped & Inspected ➜ Out for Delivery ➜ Delivered*.
  - One-click WhatsApp support pre-filled with order details.
- **Cash on Delivery Checkout**:
  - Strict 10-digit Nepal phone validation.
  - Scheduled delivery time windows (Morning 9am-12pm, Afternoon 12pm-4pm, Evening 4pm-7pm).
  - Delivery cost calculation (Complimentary inside Pokhara valley / Flat Rs. 150 outside valley).

### 🔒 Admin Portal (`/admin`)
- Direct access at `/admin` (Default password: `roselle2024` or via `ADMIN_PASSWORD` env variable).
- Live metrics: Total Orders, Pending Orders, Delivered Orders, and Total Revenue in Rs.
- Update order lifecycle status (`pending`, `confirmed`, `delivered`, `cancelled`).
- One-click direct WhatsApp chat launcher with customer details.

### ⚡ Performance & Core Web Vitals
- **Ultra-low INP (< 20ms)**: Page navigation is powered by React 18 `useTransition` and non-blocking rendering.
- **Lightweight Chunks**: Sub-260 kB total bundle with code-splitting via `React.lazy()` for all secondary pages.
- **Progressive Web App (PWA)**: Includes `manifest.json` and `sw.js` service worker for asset caching and mobile installation.
- **SEO Ready**: Dynamic meta tags, Open Graph card preview for WhatsApp & Facebook, `robots.txt`, and `sitemap.xml`.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide Icons, Sonner Toaster.
- **Backend API**: Node.js, Express.
- **Database**: SQLite via `sql.js` (Pure WebAssembly, zero C++ build dependencies required).
- **Email Notifications**: Nodemailer (Gmail SMTP).
- **Deployment**: Vercel Serverless Functions (`@vercel/node` + `@vercel/static-build`).

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/ParbinShrees/Roselle.Np.git
cd Roselle.Np

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 3. Running Dev Servers
```bash
# Terminal 1: Start Backend API (Port 3001)
node backend/server.js

# Terminal 2: Start Frontend Dev Server (Port 5173)
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Backend health check |
| `POST` | `/api/orders` | Public (Rate Limited) | Confirm a new flower order |
| `GET` | `/api/orders/track?q=<id_or_phone>` | Public (Rate Limited) | Track order status by ID or Phone |
| `GET` | `/api/orders` | Admin (`x-admin-password`) | View all customer orders with item details |
| `PATCH` | `/api/orders/:id/status` | Admin (`x-admin-password`) | Update order status (`pending`, `confirmed`, `delivered`, `cancelled`) |

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"** ➔ Import `Roselle.Np`.
3. In **Settings ➔ Environment Variables**, optionally add:
   - `ADMIN_PASSWORD`: Custom secret admin password (defaults to `roselle2024`).
   - `GMAIL_USER`: Your Gmail address for order notifications.
   - `GMAIL_APP_PASSWORD`: 16-character Google App Password.
4. Click **Deploy**. Vercel will build both the frontend and serverless API automatically according to `vercel.json`.

---

## 📄 License & Attribution
Designed and handcrafted with care in Pokhara, Nepal. © 2026 Roselle.