-- Expanded Mock Seed Dataset for Scan. Pay. Go. Supermarket
-- Multi-category retail items, sample customer accounts, and historical orders.

-- Insert additional product categories
INSERT INTO products (barcode, name, description, price, category, stock_quantity, image_url) VALUES
('8901030012345', 'Amul Taaza Toned Milk 1L', 'Pasteurised toned milk with 3.0% fat', 54.00, 'Dairy & Eggs', 150, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400'),
('8901058852109', 'Britannia Good Day Cookies 200g', 'Butter cookies enriched with almonds and cashews', 40.00, 'Snacks & Bakery', 200, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400'),
('8901030777123', 'Tropicana Orange Juice 1L', '100% real orange juice with vitamin C', 125.00, 'Beverages', 80, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400'),
('8901040001122', 'Tata Sampann Unpolished Toor Dal 1kg', 'Protein-rich essential unpolished pulses', 165.00, 'Staples & Grains', 120, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400'),
('8901050998877', 'Cadbury Dairy Milk Silk 150g', 'Smooth and creamy milk chocolate bar', 175.00, 'Snacks & Bakery', 95, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400'),
('8901060334455', 'Lays India Magic Masala 50g', 'Spicy potato chips seasoned with Indian spices', 20.00, 'Snacks & Bakery', 300, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400')
ON CONFLICT (barcode) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity;
