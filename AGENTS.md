# AGENTS.md — Workspace Guidelines & Architecture Rules

## Project Overview
**Scan. Pay. Go. — Shopping Without Queues** is a final-year B.Tech major project. It is a retail self-checkout solution consisting of:
1. `customer-app`: Flutter mobile application for scanning product barcodes, managing cart, paying via Razorpay, and presenting Exit QR codes.
2. `admin-dashboard`: React + TypeScript + Vite + Tailwind CSS dashboard for store staff/admin to manage products, view sales analytics, and scan/verify Exit QR codes.
3. `backend`: Node.js + Express + TypeScript REST API managing PostgreSQL database operations, price validation, authentication, and Razorpay signature verification.
4. `database`: PostgreSQL relational database schema and seed data.
5. `docs`: Architecture, API specifications, and design system mappings.

---

## Strict Architectural Rules
1. **Source of Truth**: The Express backend is the **sole source of truth** for pricing, discounts, cart validation, inventory management, payment signatures, and exit token security.
2. **No Direct Database Connections**: Frontend applications (`customer-app` and `admin-dashboard`) must **NEVER** connect directly to PostgreSQL. All interactions must go through the Node.js REST API.
3. **No Secrets in Code**: Secrets (DB passwords, JWT secrets, Razorpay API keys) must be loaded from `.env` environment variables. Never commit secret keys or hardcoded API tokens.
4. **Zero Client Trust**: All cart prices and order totals calculated on the frontend are for preview only. The backend must recalculate all totals from database prices before initiating Razorpay orders.

---

## Directory Responsibilities
- `backend/`: REST APIs, JWT & RBAC middlewares, Razorpay integration, Exit QR HMAC generator/verifier.
- `admin-dashboard/`: React web app using Tailwind CSS aligned with Google Stitch design.
- `customer-app/`: Flutter mobile app following clean feature-based architecture (`auth`, `home`, `scanner`, `cart`, `checkout`, `receipt`, `orders`).
- `database/`: `schema.sql` DDL definitions and `seed.sql` initial dataset.
- `docs/`: System documentation, API contracts, and Stitch design mapping.
