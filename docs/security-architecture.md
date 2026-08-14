# Security Architecture & Exit Gate HMAC Specification

## 1. Overview
In the **Scan. Pay. Go.** self-checkout platform, security against cart tampering, pricing fraud, and unauthorized exit token duplication is enforced exclusively on the Express backend server.

---

## 2. Zero-Trust Cart Validation Protocol
1. **Frontend Role**: The mobile app maintains an ephemeral cart for UI preview and scanning UX only.
2. **Server Verification**:
   - Upon initiating checkout, the customer app transmits product IDs and quantities.
   - The backend retrieves authoritative item prices and discount rates directly from PostgreSQL.
   - Server re-calculates the `subtotal`, `tax`, `discount`, and `grandTotal`.
   - The Razorpay order amount is generated strictly using the server-calculated total.

---

## 3. Exit QR Code HMAC Security Specification

To prevent customers from presenting fake, recycled, or stolen Exit QR codes at gate scanners:

### Payload Format
```text
Payload = "${orderId}:${userId}:${timestampMillis}"
```

### Digital Signature Generation
```text
HMAC-SHA256(Payload, SECRET_KEY)
```

### Verification Workflow at Exit Terminal
1. Staff or optical gate scanner reads QR code payload containing `{ orderId, userId, timestamp, hmac }`.
2. Verifier sends payload to `/api/v1/exit-tokens/verify`.
3. Backend checks:
   - **Order Payment Status**: Must be `PAID`.
   - **Exit Token Expiry**: Current time must be within 15 minutes of generation.
   - **Replay Protection**: Token must not have been previously marked as `EXIT_VERIFIED` in database.
   - **HMAC Signature**: Constant-time comparison (`crypto.timingSafeEqual`) against re-computed HMAC.
4. Gate unlocks upon `200 OK` response.
