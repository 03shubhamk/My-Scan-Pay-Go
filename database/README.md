# Database Architecture & Migration Guide

This directory contains the database schema definition (`schema.sql`) and sample seed dataset (`seed.sql`) for **Scan. Pay. Go. — Shopping Without Queues**.

---

## 📐 Entity Relationship Model

The database comprises 7 core tables:

1. **`users`**: Customer and Admin account details with role-based authorization (`CUSTOMER`, `ADMIN`).
2. **`products`**: Product catalog with barcode, category, unit price (`DECIMAL(10,2)`), and image URL.
3. **`inventory`**: Stock levels and low-stock alert thresholds for each product (`1:1` relationship with `products`).
4. **`orders`**: Self-checkout transactions storing server-calculated totals, order status (`PENDING`, `COMPLETED`, `CANCELLED`, `EXIT_VERIFIED`), and payment status (`UNPAID`, `PAID`, `FAILED`, `REFUNDED`).
5. **`order_items`**: Line items per order snapshotting `price_at_purchase` and `subtotal`.
6. **`payments`**: Razorpay transaction logs (`razorpay_order_id`, `razorpay_payment_id`, amount, status).
7. **`exit_verifications`**: Encrypted Exit QR tokens and gate verification logs (`PENDING`, `VERIFIED`, `FAILED`, `EXPIRED`).

---

## ⚡ Performance & Constraints Strategy

- **Primary Keys**: UUID v4 auto-generated keys (`uuid_generate_v4()`).
- **Barcode Index**: B-Tree index on `products(barcode)` for fast barcode scanning lookups.
- **Monetary Precision**: All currency values use `DECIMAL(10,2)` to prevent floating-point precision loss.
- **Cascading Rules**:
  - Deleting a user cascades to their `orders`.
  - Deleting an order cascades to `order_items`, `payments`, and `exit_verifications`.
  - Deleting a product is restricted if existing orders contain that product (`ON DELETE RESTRICT`).
- **Automatic Triggers**: PostgreSQL trigger `update_updated_at_column()` automatically updates `updated_at` timestamps whenever `users`, `products`, `orders`, or `inventory` rows are updated.

---

## 🚀 How to Run Migrations & Seed Data

### Prerequisites
- **PostgreSQL 14+** running on `localhost:5432`
- `psql` command line utility

### 1. Create Database
```sql
CREATE DATABASE scan_pay_go_db;
```

### 2. Apply Schema DDL
```bash
psql -U postgres -d scan_pay_go_db -f database/schema.sql
```

### 3. Insert Seed Data
```bash
psql -U postgres -d scan_pay_go_db -f database/seed.sql
```

---

## 🔑 Default Seed Users

| Role | Email | Default Password |
| :--- | :--- | :--- |
| **Admin** | `admin@scanpaygo.com` | `Password@123` |
| **Customer** | `alex@example.com` | `Password@123` |
| **Customer** | `priya@example.com` | `Password@123` |
