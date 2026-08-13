# REST API Specifications

Base URL: `http://localhost:5000/api/v1`

---

## 🔑 Authentication Endpoints (`/auth`)

### 1. Register User
- **POST** `/auth/register`
- **Body**:
  ```json
  {
    "fullName": "John Customer",
    "email": "john@example.com",
    "phone": "+919876543212",
    "password": "Password@123"
  }
  ```

### 2. Login User
- **POST** `/auth/login`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "Password@123"
  }
  ```

---

## 🛒 Products Endpoints (`/products`)

### 1. Scan Barcode Lookup
- **GET** `/products/barcode/:code`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "p0000000-0000-0000-0000-000000000001",
      "barcode": "8901030000001",
      "name": "Amul Taaza Toned Milk (500ml)",
      "price": 27.00,
      "discountedPrice": 27.00,
      "stockQuantity": 150
    }
  }
  ```

---

## 💳 Checkout & Payments (`/checkout`, `/payments`)

### 1. Validate Cart
- **POST** `/checkout/validate-cart`
- **Body**:
  ```json
  {
    "items": [
      { "productId": "p0000000-0000-0000-0000-000000000001", "quantity": 2 }
    ]
  }
  ```

### 2. Create Razorpay Payment Order
- **POST** `/checkout/create-payment-order`

### 3. Verify Payment Signature
- **POST** `/payments/verify-payment`
