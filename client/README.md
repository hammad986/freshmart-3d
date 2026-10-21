# 🛒 FreshMart 3D - Online Supermarket

An end-to-end supermarket web app: a 3D storefront (Three.js) written in TypeScript,
backed by a Python Flask REST API with JWT auth, a SQLite database, cart, checkout,
order tracking and an admin panel.

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18 + TypeScript + Vite, Three.js (interactive 3D hero + 3D product viewer) |
| Backend  | Python 3 + Flask REST API |
| Auth     | JWT (PyJWT) + hashed passwords (Werkzeug PBKDF2), admin role |
| Database | SQLite via Flask-SQLAlchemy |

## Features

**Storefront**
- Interactive 3D hero scene: floating groceries with mouse parallax (Three.js)
- Per-product 3D viewer: every product maps to a procedural 3D model (fruit, bottle,
  box, bag, loaf, bar, egg) you can drag to spin
- Catalog with live search, category filters, product detail pages
- Stock-aware cart (blocks out-of-stock and over-stock adds), quantity steppers
- Checkout with delivery address + payment method (COD / UPI mock)
- Order history with live status badges

**Accounts & security**
- Register / login / logout with JWT bearer tokens (7-day expiry)
- Passwords hashed with PBKDF2, never stored in plain text
- Role-based access: admin-only API routes guarded on the server
- Server-side validation on every input; stock and order writes in one transaction

**Admin panel** (`/admin`)
- Dashboard: revenue, order/customer/product counts, recent orders, low stock
- Product CRUD: create, edit, delete, hide, pick the 3D model + tile color
- Order management with one-click status updates
  (Placed → Packed → Out for delivery → Delivered / Cancelled)

## Quick start

```bash
# 1. Backend (terminal 1)
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 run.py                       # http://localhost:5000 (auto-seeds demo data)

# 2. Frontend dev server (terminal 2)
cd client
npm install
npm run dev                          # http://localhost:5173 (proxies /api to :5000)
```

### Production-style single-process run

```bash
cd client && npm run build           # outputs client/dist
cd ../backend && python3 run.py      # Flask serves the built app at :5000
```

### Demo accounts

| Role     | Email                | Password    |
|----------|----------------------|-------------|
| Admin    | `admin@freshmart.in` | `Admin@123` |
| Customer | `user@freshmart.in`  | `User@1234` |

Change these before deploying anywhere real.

## Project structure

```
freshmart-3d/
├── backend/
│   ├── run.py                 # entry point
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py        # app factory, blueprint registration, SPA serving
│       ├── models.py          # User, Category, Product, CartItem, Order, OrderItem
│       ├── auth.py            # JWT sign/verify, auth + admin decorators
│       ├── seed_data.py       # 24 demo products in 6 categories + demo users
│       └── routes/            # products, cart, orders, admin (REST)
└── client/
    ├── index.html
    └── src/
        ├── App.tsx            # routes + header
        ├── auth.tsx           # auth context (token in localStorage)
        ├── cart.tsx           # cart context synced with the API
        ├── api.ts             # typed fetch wrapper
        ├── three/
        │   ├── shapes.ts      # procedural grocery 3D models
        │   ├── HeroScene.tsx  # floating-groceries hero
        │   └── ProductViewer.tsx
        └── pages/             # shop, cart, checkout, orders, auth, admin/*
```

## API summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | - | create account |
| POST | `/api/auth/login` | - | log in, get JWT |
| GET  | `/api/auth/me` | user | current user |
| GET  | `/api/categories` | - | list categories |
| GET  | `/api/products?q=&category=` | - | catalog search |
| GET  | `/api/products/:id` | - | product + related |
| GET/POST | `/api/cart` | user | read cart / add item |
| PATCH/DELETE | `/api/cart/:itemId` | user | change qty / remove |
| POST | `/api/orders` | user | checkout |
| GET  | `/api/orders`, `/api/orders/:id` | user | order history |
| GET  | `/api/admin/stats` | admin | dashboard numbers |
| POST/PUT/DELETE | `/api/admin/products[/:id]` | admin | product CRUD |
| GET/PATCH | `/api/admin/orders[/:id]` | admin | order list + status |

## Configuration

Backend environment variables:

- `SECRET_KEY`, `JWT_SECRET` - set long random values in production
- `DATABASE_URL` - SQLAlchemy URI, defaults to SQLite at `backend/instance/freshmart.db`
- `PORT` - default 5000

## Roadmap ideas

- Real payment gateway (Razorpay / Stripe)
- GLTF product models instead of procedural shapes
- Order status emails, image uploads, pagination
- Docker compose for one-command boot
