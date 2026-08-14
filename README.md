# Scan. Pay. Go. — Shopping Without Queues

A modern self-checkout retail system enabling supermarket shoppers to scan barcodes using a mobile app, pay digitally, and receive exit verification without waiting in traditional billing queues.

---

## 🏗️ System Architecture

```
  +-----------------------+              +------------------------+
  | Customer App          |              | Admin Web Dashboard    |
  | (Flutter / Mobile)    |              | (React / Vite / TS)    |
  +-----------+-----------+              +-----------+------------+
              |                                      |
              | REST API                             | REST API
              v                                      v
  +---------------------------------------------------------------+
  |                  Node.js + Express REST API                   |
  |      (Authentication, Price Engine, Razorpay Integration)     |
  +-------------------------------+-------------------------------+
                                  |
                                  v
                      +-----------------------+
                      |  PostgreSQL Database  |
                      +-----------------------+
```

---

## 📂 Repository Structure

```
scan-pay-go/
├── backend/            # Express.js + TypeScript REST API
├── admin-dashboard/    # React + TypeScript + Vite + Tailwind CSS Web App
├── customer-app/       # Flutter Mobile Application (Android/iOS)
├── database/           # PostgreSQL Schema & Seed Scripts
└── docs/               # System Architecture & API Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher
- **PostgreSQL**: v14.0 or higher
- **Flutter SDK**: v3.10 or higher (for `customer-app`)

---

### 1. Database Setup
1. Create a PostgreSQL database named `scan_pay_go_db`.
2. Execute the schema and seed scripts:
   ```bash
   psql -U postgres -d scan_pay_go_db -f database/schema.sql
   psql -U postgres -d scan_pay_go_db -f database/seed.sql
   ```

---

### 2. Backend Setup (`/backend`)
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Copy environment template and configure secrets:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
   *The API server will run at `http://localhost:5000`*

---

### 3. Admin Dashboard Setup (`/admin-dashboard`)
1. Navigate to admin dashboard directory:
   ```bash
   cd admin-dashboard
   ```
2. Copy environment template:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start Vite development server:
   ```bash
   npm run dev
   ```
   *The admin dashboard will run at `http://localhost:3000`*

---

### 4. Customer App Setup (`/customer-app`)
1. Navigate to customer app directory:
   ```bash
   cd customer-app
   ```
2. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
3. Fetch Flutter dependencies:
   ```bash
   flutter pub get
   ```
4. Run on connected device or emulator:
   ```bash
   flutter run
   ```

---


## 📜 Documentation
- See [`docs/architecture.md`](docs/architecture.md) for full technical design details.
- See [`docs/api-spec.md`](docs/api-spec.md) for API endpoint specifications.
- See [`docs/stitch-design-mapping.md`](docs/stitch-design-mapping.md) for UI design system tokens.
