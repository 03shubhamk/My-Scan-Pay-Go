-- =============================================================================
-- SEED DATA: Scan. Pay. Go. Self-Checkout System
-- Realistic Supermarket Dataset for Development & Testing
-- =============================================================================

-- Clear existing data safely
TRUNCATE TABLE exit_verifications, payments, order_items, orders, inventory, products, users CASCADE;

-- -----------------------------------------------------------------------------
-- 1. SEED USERS (Password hashes: bcrypt hash of 'Password@123')
-- -----------------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role) VALUES
('u1000000-0000-0000-0000-000000000001', 'Store Administrator', 'admin@scanpaygo.com', '$2a$12$e/9V9P2Qy9s1Rk5H3Fz7u.xO8Z5w9Xy0u1v2w3x4y5z6a7b8c9d0e', 'ADMIN'),
('u1000000-0000-0000-0000-000000000002', 'Alex Customer', 'alex@example.com', '$2a$12$e/9V9P2Qy9s1Rk5H3Fz7u.xO8Z5w9Xy0u1v2w3x4y5z6a7b8c9d0e', 'CUSTOMER'),
('u1000000-0000-0000-0000-000000000003', 'Priya Shopper', 'priya@example.com', '$2a$12$e/9V9P2Qy9s1Rk5H3Fz7u.xO8Z5w9Xy0u1v2w3x4y5z6a7b8c9d0e', 'CUSTOMER');

-- -----------------------------------------------------------------------------
-- 2. SEED PRODUCTS
-- -----------------------------------------------------------------------------
INSERT INTO products (id, name, description, barcode, category, price, image_url) VALUES
('p1000000-0000-0000-0000-000000000001', 'Amul Taaza Milk (500ml)', 'Pasteurised Toned Milk 500ml pouch', '8901030000001', 'Dairy', 27.00, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80'),
('p1000000-0000-0000-0000-000000000002', 'Lay''s Classic Salted Chips (50g)', 'Crispy salted potato chips 50g pack', '8901491100010', 'Snacks', 20.00, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80'),
('p1000000-0000-0000-0000-000000000003', 'Coca-Cola Original Taste (750ml)', 'Refreshing sparkling soft drink bottle', '8901764012345', 'Beverages', 40.00, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80'),
('p1000000-0000-0000-0000-000000000004', 'Britannia Good Day Biscuits (100g)', 'Rich butter cookies 100g pack', '8901030678901', 'Snacks', 30.00, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80'),
('p1000000-0000-0000-0000-000000000005', 'Colgate Strong Teeth Toothpaste (100g)', 'Cavity protection toothpaste tube', '8901207011111', 'Personal Care', 65.00, 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?auto=format&fit=crop&w=400&q=80'),
('p1000000-0000-0000-0000-000000000006', 'Britannia Sandwich Bread (400g)', 'Fresh baked whole wheat slice bread', '8901058002222', 'Bakery', 45.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'),
('p1000000-0000-0000-0000-000000000007', 'Tropicana 100% Orange Juice (1L)', '100% pure orange juice tetra pack', '8902080033333', 'Beverages', 120.00, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80'),
('p1000000-0000-0000-0000-000000000008', 'Cadbury Dairy Milk Silk (60g)', 'Smooth milk chocolate bar', '8901233044444', 'Confectionery', 80.00, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80');

-- -----------------------------------------------------------------------------
-- 3. SEED INVENTORY
-- -----------------------------------------------------------------------------
INSERT INTO inventory (id, product_id, quantity, low_stock_threshold) VALUES
('i1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 150, 20),
('i1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002', 200, 25),
('i1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', 100, 15),
('i1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000004', 120, 20),
('i1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000005', 80, 10),
('i1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000006', 45, 10),
('i1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000007', 60, 12),
('i1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000008', 90, 15);

-- -----------------------------------------------------------------------------
-- 4. SEED DEMO COMPLETED ORDER
-- -----------------------------------------------------------------------------
INSERT INTO orders (id, user_id, total_amount, status, payment_status) VALUES
('o1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000002', 114.00, 'EXIT_VERIFIED', 'PAID');

-- Order Items (2 x Milk @ 27.00 = 54.00, 3 x Lays @ 20.00 = 60.00 -> Total: 114.00)
INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase, subtotal) VALUES
('item0000-0000-0000-0000-000000000001', 'o1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 2, 27.00, 54.00),
('item0000-0000-0000-0000-000000000002', 'o1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000002', 3, 20.00, 60.00);

-- Payment record
INSERT INTO payments (id, order_id, razorpay_order_id, razorpay_payment_id, amount, status) VALUES
('pay00000-0000-0000-0000-000000000001', 'o1000000-0000-0000-0000-000000000001', 'order_rzp_demo_12345', 'pay_rzp_demo_67890', 114.00, 'CAPTURED');

-- Exit Verification record
INSERT INTO exit_verifications (id, order_id, verification_token, status, verified_at) VALUES
('v1000000-0000-0000-0000-000000000001', 'o1000000-0000-0000-0000-000000000001', 'TOKEN_HMAC_DEMO_EXIT_VERIFIED_9999', 'VERIFIED', CURRENT_TIMESTAMP);
