# Technical Architecture & System Specification

## 1. Executive Summary
**Scan. Pay. Go.** is an enterprise-grade retail self-checkout platform that eliminates store checkout queues. Using an Android/iOS Flutter app, customers scan product barcodes, manage a validated digital cart, complete digital payments through Razorpay, generate encrypted exit receipts, and undergo 3-second gate verifications.

---

## 2. System Architecture Diagram

```
+------------------------------------+        +-----------------------------------+
|      Customer Mobile App           |        |      Admin Web Dashboard          |
|    - Flutter Framework             |        |    - React + TypeScript + Vite    |
|    - Android / iOS Camera Scanner  |        |    - Tailwind CSS UI              |
|    - Razorpay SDK Integration      |        |    - Exit Gate Verification UI    |
+-----------------+------------------+        +-----------------+-----------------+
                  |                                             |
                  | REST API (HTTPS / JSON)                     | REST API (HTTPS / JSON)
                  v                                             v
+---------------------------------------------------------------------------------+
|                         Express.js REST API Server                              |
|   - Authentication Middleware (JWT)                                             |
|   - Server-Side Cart & Total Price Calculator                                   |
|   - Razorpay Payment Gateway Integrator & HMAC Verifier                         |
|   - Encrypted One-Time Exit QR Code Token Engine                                |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
                             +-----------------------+
                             | PostgreSQL Database   |
                             | - Relational Storage  |
                             +-----------------------+
```

---

## 3. Core Architectural Rules
1. **Frontend Isolation**: Frontend apps (`customer-app` & `admin-dashboard`) communicate solely via backend REST endpoints.
2. **Server-Side Validation**: All product prices, cart totals, discounts, taxes, and Razorpay payment signatures are validated on the backend.
3. **Exit Security**: Exit QR payload contains an encrypted HMAC signature. Verification atomically changes order status from `paid` to `verified` to prevent double-exiting.
